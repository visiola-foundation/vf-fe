import { useEffect, useRef, useState } from 'react';
import { cellText, isBlank } from '../../lib/format';
import { Blank } from '../ui/primitives';

/**
 * An editable register cell. Renders plain text (or the hatch) until focused,
 * then swaps to an input. Enter commits and blurs; Escape reverts.
 */
export function EditableCell({
  value,
  dirty,
  onCommit,
}: {
  value: unknown;
  dirty: boolean;
  onCommit: (value: string | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const text = cellText(value);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function begin() {
    setDraft(text);
    setEditing(true);
  }

  function commit() {
    setEditing(false);
    const v = draft.trim();
    onCommit(v === '' ? null : v);
  }

  function cancel() {
    setEditing(false);
  }

  return (
    <td
      tabIndex={editing ? -1 : 0}
      onClick={editing ? undefined : begin}
      onFocus={editing ? undefined : begin}
      className={`cursor-text whitespace-nowrap border-b border-line px-[11px] py-2 align-top ${
        dirty ? 'shadow-[inset_3px_0_0_var(--color-vf-green)]' : ''
      } ${editing ? 'bg-[#FFFBEA] outline-2 -outline-offset-2 outline-vf-blue' : ''}`}
    >
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commit();
            } else if (e.key === 'Escape') {
              e.preventDefault();
              cancel();
            }
          }}
          className="w-full min-w-[70px] bg-transparent p-0 text-[13px] text-ink outline-none"
        />
      ) : isBlank(value) ? (
        <Blank />
      ) : (
        text
      )}
    </td>
  );
}
