export function Footer({
  generated,
  roleLabel,
}: {
  generated: string;
  roleLabel: string;
}) {
  return (
    <div className="mt-11 border-t border-line pt-4 text-[12px] text-muted">
      The Visiola Foundation · Management Information System · Data loaded {generated} ·
      Signed in as <b>{roleLabel}</b>. Edits made here are held in this session only;
      export them to save.
    </div>
  );
}
