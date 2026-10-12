import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { MisData } from '../types/mis';
import { fmt } from '../lib/format';
import { exportRegisterEdits } from '../lib/csv';
import { Notice } from '../components/ui/primitives';
import { Eyebrow, Lede, PageTitle } from '../components/ui/layout';
import {
  RegisterControls,
  type RegisterFilters,
} from '../components/register/RegisterControls';
import { RegisterTable } from '../components/register/RegisterTable';
import {
  useAddStudent,
  useRegisterEdits,
  useSaveCell,
} from '../queries/useRegister';

export function Register({ data }: { data: MisData }) {
  const [params, setParams] = useSearchParams();

  const text = params.get('q') ?? '';
  const school = params.get('school') ?? '';
  const match = params.get('match') ?? '';
  const missing = params.get('missing') === '1';

  const { data: dirtyKeys = [] } = useRegisterEdits();
  const dirty = useMemo(() => new Set(dirtyKeys), [dirtyKeys]);
  const saveCell = useSaveCell();
  const addStudent = useAddStudent();

  const saving = saveCell.isPending || addStudent.isPending;
  const mutationError = saveCell.error ?? addStudent.error;

  const roster = data.roster;

  const rows = useMemo(
    () =>
      roster.filter((r) => {
        if (school && r.school !== school) return false;
        if (match && r.match !== match) return false;
        if (missing && r.consent) return false;
        if (text) {
          const q = text.toLowerCase();
          return `${r.uid} ${r.last ?? ''} ${r.first ?? ''} ${r.school ?? ''}`
            .toLowerCase()
            .includes(q);
        }
        return true;
      }),
    [roster, school, match, missing, text],
  );

  function applyPatch(patch: Partial<RegisterFilters>) {
    const next = new URLSearchParams(params);
    if ('text' in patch) {
      const v = patch.text ?? '';
      if (v) next.set('q', v);
      else next.delete('q');
    }
    if ('school' in patch) {
      const v = patch.school ?? '';
      if (v) next.set('school', v);
      else next.delete('school');
    }
    if ('match' in patch) {
      const v = patch.match ?? '';
      if (v) next.set('match', v);
      else next.delete('match');
    }
    if ('missing' in patch) {
      if (patch.missing) next.set('missing', '1');
      else next.delete('missing');
    }
    setParams(next, { replace: true });
  }

  function onCommit(uid: string, field: string, value: string | null) {
    saveCell.mutate({ uid, key: field, value });
  }

  function onAdd() {
    addStudent.mutate();
    applyPatch({ text: '' });
  }

  function onExport() {
    const ok = exportRegisterEdits(roster, dirtyKeys);
    if (!ok) window.alert('No edits to export yet. Change a cell first.');
  }

  return (
    <>
      <Eyebrow>Records · key staff only</Eyebrow>
      <PageTitle>Student register</PageTitle>
      <Lede>
        Click any unlocked cell to edit it. Grey hatching means the field was never
        collected — fill it in here. Derived columns (age, GPA, progress) are locked because
        they are computed from other fields.
      </Lede>

      <RegisterControls
        filters={{ text, school, match, missing }}
        schools={data.schools}
        busy={addStudent.isPending}
        onChange={applyPatch}
        onAdd={onAdd}
        onExport={onExport}
      />

      {mutationError ? (
        <Notice variant="err" title="A change could not be saved">
          <p>
            {mutationError instanceof Error
              ? mutationError.message
              : String(mutationError)}
            . The edit was rolled back.
          </p>
        </Notice>
      ) : null}

      <p className="mb-3 mt-[-4px] text-[12.5px] text-muted">
        Showing <b className="font-mono tabular-nums">{fmt(rows.length)}</b> of{' '}
        <b className="font-mono tabular-nums">{fmt(roster.length)}</b> loaded records ·{' '}
        <b className="font-mono tabular-nums">{dirty.size}</b> edited
        {saving ? ' · Saving…' : ''} · the full register of{' '}
        {fmt(data.totals.unique_students)} students is in students.csv
      </p>

      <RegisterTable rows={rows} dirty={dirty} onCommit={onCommit} />
    </>
  );
}
