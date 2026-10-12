import { Notice, Pill } from '../components/ui/primitives';
import { Eyebrow, Lede, PageTitle } from '../components/ui/layout';
import { Table, TableWrap, Td, Th, Tr } from '../components/ui/table';

const REC: Array<[string, string, string]> = [
  [
    'Cost per student, per programme',
    'Efficiency',
    'The core efficiency ratio. Needs annual programme spend, which no source file carries.',
  ],
  [
    'Cost per improved student',
    'Efficiency',
    'Spend divided by students whose GPA rose. Makes two programmes comparable even when they do different things.',
  ],
  [
    'Retention across terms',
    'Delivery',
    'Already computable: 307 of 498 in the 2025 cohort have all three terms. Track it as a rate, not a footnote.',
  ],
  [
    'STEM-CIS self-efficacy, pre and post',
    'Impact',
    "The Foundation's own report recommends it. GPA cannot show whether a girl believes she can do STEM.",
  ],
  [
    'School-level variance',
    'Delivery',
    'The report attributes some decline to teacher absence. Ranking schools by average change would confirm or rule that out.',
  ],
  [
    'Subject-specific improvement',
    'Impact',
    'Built and on the ASCG page. Maths and Chemistry are the declared difficult subjects and move differently from the rest.',
  ],
  [
    'Progression into STEM tertiary study',
    'Impact',
    'The outcome the ASCG exists for. Needs a school-leaver follow-up that does not currently happen.',
  ],
  [
    'CBC time to first role',
    'Impact',
    'Months from graduation to first paid work. More actionable than a placement rate alone.',
  ],
  [
    'CBC salary progression',
    'Impact',
    'Field already in cbc_outcome. Distinguishes a job from a living.',
  ],
  [
    'Survey response rate',
    'Data confidence',
    'Currently 21% for CBC. Publish it beside every outcome figure so the confidence interval is visible.',
  ],
  [
    'Consent coverage',
    'Compliance',
    'Percentage of students with consent on file. Currently zero. Should be on the Board dashboard permanently.',
  ],
  [
    'Open data errors',
    'Data confidence',
    'Unresolved items in the quality log. A rising count means the pipeline is degrading.',
  ],
  [
    'Cohort attribution caveat',
    'Method',
    'None of these metrics establish causation. Without a comparison group, improvement is an association with participation, not proof of it.',
  ],
];

export function Proposed() {
  return (
    <>
      <Eyebrow>Governance</Eyebrow>
      <PageTitle>Metrics to add</PageTitle>
      <Lede>
        The three indicators requested are built. These are what senior management and the
        Board should track alongside them, ordered by how much each would change a decision.
      </Lede>
      <TableWrap>
        <Table>
          <thead>
            <tr>
              <Th>Metric</Th>
              <Th>Type</Th>
              <Th>Why it earns a place</Th>
            </tr>
          </thead>
          <tbody>
            {REC.map((r) => (
              <Tr key={r[0]}>
                <Td>
                  <b>{r[0]}</b>
                </Td>
                <Td>
                  <Pill variant="flat">{r[1]}</Pill>
                </Td>
                <td
                  className="whitespace-normal border-b border-line px-[11px] py-2 align-top"
                  style={{ maxWidth: 560 }}
                >
                  {r[2]}
                </td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </TableWrap>

      <Notice
        variant="info"
        className="mt-[18px]"
        title="On measuring programme efficiency"
      >
        <p>
          Efficiency cannot be computed from anything supplied. It needs annual spend per
          programme, which appears in no file. Once loaded, the view{' '}
          <span className="font-mono">vf_reporting.v_programme_efficiency</span> produces
          cost per student and cost per outcome without further work.
        </p>
      </Notice>
    </>
  );
}
