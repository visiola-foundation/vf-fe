import type { MisData } from '../types/mis';
import { fmt } from '../lib/format';
import { Card, Kpi, Notice } from '../components/ui/primitives';
import {
  Eyebrow,
  Grid4,
  Lede,
  PageTitle,
  SectionHeading,
} from '../components/ui/layout';
import { BarChart } from '../components/ui/charts';
import { Table, TableWrap, Td, TdNum, Th, Tr } from '../components/ui/table';

export function Reach({ data }: { data: MisData }) {
  const T = data.totals;
  const rows = data.reach.map((r) => ({
    year: r.year_joined,
    n: r.new_students,
    r: r.returning,
    p: r.participations,
  }));
  const totalNew = rows.reduce((a, b) => a + b.n, 0);
  const totalRet = rows.reduce((a, b) => a + b.r, 0);
  const rows2025 = rows.find((r) => r.year === 2025);

  return (
    <>
      <Eyebrow>Indicator 1</Eyebrow>
      <PageTitle>Reach and enrolment</PageTitle>
      <Lede>
        A girl is counted once however many years or programmes she appears in. Within any
        single year she can only be enrolled once, so the split that carries information is
        first-time against returning.
      </Lede>

      <Grid4>
        <Kpi
          label="ASCG · unique students"
          value={fmt(T.unique_students)}
          sub="Since 2018"
          accent="blue"
        />
        <Kpi
          label="Total participations"
          value={fmt(T.enrolments)}
          sub={`${fmt(totalRet)} are a returning year`}
          accent="green"
        />
        <Kpi
          label="CBC · unique students"
          value={<span className="text-muted">0</span>}
          sub="No records supplied"
          accent="purple"
        />
        <Kpi
          label="Programme 3 · unique students"
          value={<span className="text-muted">0</span>}
          sub="Programme not yet named"
          accent="purple"
        />
      </Grid4>

      <SectionHeading>First-time and returning students by year</SectionHeading>
      <Card>
        <BarChart
          rows={rows}
          labelKey="year"
          series={[
            { k: 'n', label: 'Joined for the first time', c: '#00A3DA' },
            { k: 'r', label: 'Returning', c: '#958EB8' },
          ]}
        />
      </Card>

      <TableWrap className="mt-3.5">
        <Table>
          <thead>
            <tr>
              <Th>Year</Th>
              <Th align="right">First-time</Th>
              <Th align="right">Returning</Th>
              <Th align="right">Total enrolled</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <Tr key={r.year}>
                <Td className="font-mono tabular-nums">{r.year}</Td>
                <TdNum>{fmt(r.n)}</TdNum>
                <TdNum>{fmt(r.r)}</TdNum>
                <TdNum>{fmt(r.p)}</TdNum>
              </Tr>
            ))}
            <tr className="bg-paper font-bold">
              <Td>All years</Td>
              <TdNum>{fmt(totalNew)}</TdNum>
              <TdNum>{fmt(totalRet)}</TdNum>
              <TdNum>{fmt(T.enrolments)}</TdNum>
            </tr>
          </tbody>
        </Table>
      </TableWrap>

      <Notice variant="warn" className="mt-4" title="Returning students are almost certainly undercounted">
        <p>
          A returning girl can only be detected when her last name, date of birth and school
          all match a previous year. Anyone who changed school appears as a new student. The
          2025 Impact Report counts 823 returning students; this register detects{' '}
          {fmt(totalRet)} across all eight years, which points at the missing student ID
          rather than at the report.
        </p>
      </Notice>

      <Notice variant="warn" title="Reconcile before publishing a cumulative figure">
        <p>
          The 2025 Impact Report states 3,004 girls trained in 2025. This register holds{' '}
          {fmt(rows2025?.p)} records with a joining year of 2025. The two may be measuring
          different things — year of joining against year of training — and the definition
          needs settling before either is used externally.
        </p>
      </Notice>
    </>
  );
}
