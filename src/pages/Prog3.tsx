import { EmptyState } from '../components/ui/primitives';
import { Eyebrow, Lede, PageTitle } from '../components/ui/layout';

export function Prog3() {
  return (
    <>
      <Eyebrow>Programmes</Eyebrow>
      <PageTitle>Programme 3</PageTitle>
      <Lede>
        A third programme is referred to in the brief but is not named or described in any
        document supplied, and no records exist for it.
      </Lede>
      <EmptyState title="Programme not yet identified">
        Tell us what this programme is and what a successful outcome looks like for it, and
        this page will be built to match. The table{' '}
        <span className="font-mono">prog3_record</span> is in place as a placeholder so
        nothing has to be restructured later.
      </EmptyState>
    </>
  );
}
