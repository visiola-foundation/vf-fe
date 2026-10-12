import { Blank, EmptyState, Kpi, Notice, Pill } from '../components/ui/primitives';
import {
  Eyebrow,
  Grid4,
  Lede,
  PageTitle,
  SectionHeading,
} from '../components/ui/layout';
import { Table, TableWrap, Td, Th, Tr } from '../components/ui/table';

const FIELDS: Array<[string, string, string]> = [
  ['Prior tech education', 'cbc_profile.prior_tech_education', 'Awaiting data'],
  ['Prior tech experience', 'cbc_profile.prior_tech_experience', 'Awaiting data'],
  ['Track (full-stack, data, UI/UX)', 'cbc_profile.track', 'Awaiting data'],
  ['Completed programme', 'cbc_profile.completed_programme', 'Awaiting data'],
  ['Outcome at 6 months', 'cbc_outcome.outcome (months_after=6)', 'Awaiting data'],
  ['Outcome at 12 months', 'cbc_outcome.outcome (months_after=12)', 'Awaiting data'],
  ['Role title', 'cbc_outcome.role_title', 'Awaiting data'],
  ['Company', 'cbc_outcome.company', 'Awaiting data'],
  ['Industry', 'cbc_outcome.industry', 'Awaiting data'],
  ['Tech engagement level', 'cbc_outcome.tech_engagement', 'Awaiting data'],
];

export function Cbc() {
  return (
    <>
      <Eyebrow>Indicator 3</Eyebrow>
      <PageTitle>Coding Boot Camp</PageTitle>
      <Lede>
        The structure below is live and will populate the moment graduate records are
        loaded. No CBC data was supplied, so every figure is empty rather than carried over
        from the Impact Data Brief.
      </Lede>

      <EmptyState className="mb-5" title="No Coding Boot Camp records loaded">
        The database tables <span className="font-mono">cbc_profile</span> and{' '}
        <span className="font-mono">cbc_outcome</span> exist and are ready. Load graduate
        records to fill this page.
      </EmptyState>

      <Grid4>
        <Kpi label="Completed the programme" value={<Blank />} sub="Of those enrolled" />
        <Kpi
          label="Employed at 6 months"
          value={<Blank />}
          sub="Full-time, part-time, freelance or internship"
        />
        <Kpi
          label="Employed at 12 months"
          value={<Blank />}
          sub="Full-time, part-time, freelance or internship"
        />
        <Kpi
          label="Unemployed at 12 months"
          value={<Blank />}
          sub="The Board-facing figure"
          accent="red"
        />
        <Kpi
          label="In further education"
          value={<Blank />}
          sub="Measured at both points"
        />
        <Kpi
          label="Fully engaged in tech"
          value={<Blank />}
          sub="Tech Engagement Framework"
        />
        <Kpi
          label="Partially engaged in tech"
          value={<Blank />}
          sub="Tech-enabled and hybrid roles"
        />
        <Kpi
          label="Median time to first role"
          value={<Blank />}
          sub="Months from graduation"
        />
      </Grid4>

      <SectionHeading>What each graduate record needs to carry</SectionHeading>
      <TableWrap>
        <Table>
          <thead>
            <tr>
              <Th>Field</Th>
              <Th>Held in</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {FIELDS.map((r) => (
              <Tr key={r[0]}>
                <Td>
                  <b>{r[0]}</b>
                </Td>
                <Td className="font-mono text-[12px]">{r[1]}</Td>
                <Td>
                  <Pill variant="amb">{r[2]}</Pill>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </TableWrap>

      <Notice variant="info" className="mt-4" title="One caution carried over from the brief">
        <p>
          The published CBC outcomes rest on 138 responses from 653 graduates, a 21%
          response rate, and graduates who found work are more likely to answer a survey
          than those who did not. Recording the response rate alongside every outcome
          figure keeps that visible; the field is built into the outcome table.
        </p>
      </Notice>
    </>
  );
}
