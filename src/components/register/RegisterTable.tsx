import type { RosterRow } from '../../types/mis';
import { COLS } from '../../lib/registerColumns';
import { ageOf } from '../../lib/format';
import { Cell, Pill, type PillVariant } from '../ui/primitives';
import { Table, TableWrap, Td, TdNum, Th, Tr } from '../ui/table';
import { EditableCell } from './EditableCell';

const MATCH_PILL: Record<string, PillVariant> = {
  confirmed: 'ok',
  ambiguous: 'amb',
  unmatched: 'no',
};

const BAND_PILL: Record<string, PillVariant> = {
  Improved: 'up',
  Declined: 'down',
  Stable: 'flat',
};

export function RegisterTable({
  rows,
  dirty,
  onCommit,
}: {
  rows: RosterRow[];
  dirty: Set<string>;
  onCommit: (uid: string, field: string, value: string | null) => void;
}) {
  const shown = rows.slice(0, 400);

  return (
    <>
      <TableWrap className="max-h-[66vh]">
        <Table>
          <thead>
            <tr>
              {COLS.map((c) => (
                <Th key={c.k} style={c.w ? { minWidth: c.w } : undefined}>
                  {c.t}
                  {c.ro ? ' 🔒' : ''}
                </Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <Tr key={r.uid}>
                {COLS.map((c) => {
                  if (c.derived) {
                    return (
                      <TdNum key={c.k}>
                        <Cell value={ageOf(r.dob)} />
                      </TdNum>
                    );
                  }
                  if (c.k === 'match') {
                    return (
                      <Td key={c.k}>
                        <Pill variant={MATCH_PILL[r.match] ?? 'flat'}>{r.match}</Pill>
                      </Td>
                    );
                  }
                  if (c.k === 'band' && r.band) {
                    return (
                      <Td key={c.k}>
                        <Pill variant={BAND_PILL[r.band] ?? 'flat'}>{r.band}</Pill>
                      </Td>
                    );
                  }
                  if (c.ro) {
                    return (
                      <Td key={c.k}>
                        <Cell value={r[c.k as keyof RosterRow]} />
                      </Td>
                    );
                  }
                  return (
                    <EditableCell
                      key={c.k}
                      value={r[c.k as keyof RosterRow]}
                      dirty={dirty.has(`${r.uid}|${c.k}`)}
                      onCommit={(v) => onCommit(r.uid, String(c.k), v)}
                    />
                  );
                })}
              </Tr>
            ))}
          </tbody>
        </Table>
      </TableWrap>
      {rows.length > 400 ? (
        <p className="mt-2.5 text-[12.5px] text-muted">
          Showing the first 400 matching rows. Narrow the filters to reach the rest.
        </p>
      ) : null}
    </>
  );
}
