import type { MisData } from '../types/mis';
import { pct } from '../lib/format';
import { Card, Kpi, Notice, Pill } from '../components/ui/primitives';
import {
  Eyebrow,
  Grid4,
  Lede,
  Legend,
  PageTitle,
  SectionHeading,
} from '../components/ui/layout';
import { BarChart, LineChart, StackBar } from '../components/ui/charts';
import { Table, TableWrap, Td, TdNum, Th, Tr } from '../components/ui/table';

export function Ascg({ data }: { data: MisData }) {
  const t = data.terms;
  const p = data.progress;
  const vals = t.map((x) => x.mean);
  const lo = Math.floor(Math.min(...vals) * 10) / 10 - 0.2;
  const hi = Math.ceil(Math.max(...vals) * 10) / 10 + 0.2;
  const net = t[2].mean - t[0].mean;
  const bandRows = [1, 2, 3].map((i) => {
    const b = data.bandByTerm[`term${i}` as 'term1' | 'term2' | 'term3'];
    return { term: `Term ${i}`, ...b };
  });

  return (
    <>
      <Eyebrow>Indicator 2 · 2025 cohort, n={p.cohort}</Eyebrow>
      <PageTitle>ASCG academic performance</PageTitle>
      <Lede>
        Grades are held as letters and converted on a 5.0 scale (A=5 to F=0). That scale
        was confirmed against the Foundation&rsquo;s own term averages before being applied,
        not assumed.
      </Lede>

      <Grid4>
        <Kpi
          label="Improved"
          value={pct((p.improved / p.assessed) * 100)}
          sub={`${p.improved} of ${p.assessed} with both term 1 and term 3`}
          accent="green"
        />
        <Kpi
          label="Stable"
          value={pct((p.stable / p.assessed) * 100)}
          sub={`${p.stable} within ±0.10 GPA`}
          accent="purple"
        />
        <Kpi
          label="Declined"
          value={pct((p.declined / p.assessed) * 100)}
          sub={`${p.declined} students`}
          accent="red"
        />
        <Kpi
          label="Net GPA change, term 1 to 3"
          value={`${net >= 0 ? '+' : ''}${net.toFixed(2)}`}
          sub={`${t[0].mean.toFixed(2)} → ${t[2].mean.toFixed(2)} out of 5.00`}
          accent="blue"
        />
      </Grid4>

      <SectionHeading>Average GPA by term</SectionHeading>
      <Card>
        <LineChart pts={vals} lo={lo} hi={hi} labels={['Term 1', 'Term 2', 'Term 3']} />
        <Legend>
          {t.map((x) => (
            <span key={x.term}>
              <b className="font-mono tabular-nums">Term {x.term}</b> · {x.n} records ·{' '}
              {x.completeness}% complete
            </span>
          ))}
        </Legend>
      </Card>

      <Notice variant="warn" className="mt-3.5" title="Term 3 is the thin one">
        <p>
          Only {t[2].completeness}% of the cohort has a term 3 GPA, against{' '}
          {t[0].completeness}% and {t[1].completeness}% for terms 1 and 2. Because the gap
          falls at the end of the year rather than the middle, end-of-year reporting
          drop-off cannot be ruled out as the cause, and the term 3 average may not
          represent the whole cohort.
        </p>
      </Notice>

      <SectionHeading>Progress classification</SectionHeading>
      <Card>
        <StackBar
          total={p.assessed}
          segments={[
            { label: 'Improved (>+0.10)', v: p.improved, c: '#9EC83E' },
            { label: 'Stable (±0.10)', v: p.stable, c: '#958EB8' },
            { label: 'Declined (<−0.10)', v: p.declined, c: '#D8232A' },
          ]}
        />
        <p className="mb-0 mt-2.5 text-[12.5px] text-muted">
          {p.cohort - p.assessed} of {p.cohort} students are missing a term 1 or term 3 GPA
          and cannot be classified.
        </p>
      </Card>
      <SectionHeading>Movement by subject</SectionHeading>
      <TableWrap>
        <Table>
          <thead>
            <tr>
              <Th>Subject</Th>
              <Th align="right">Paired</Th>
              <Th align="right">Term 1</Th>
              <Th align="right">Term 2</Th>
              <Th align="right">Term 3</Th>
              <Th align="right">Improved</Th>
              <Th align="right">Stable</Th>
              <Th align="right">Declined</Th>
              <Th align="right">% improved</Th>
            </tr>
          </thead>
          <tbody>
            {data.subjects.map((s) =>
              s.n === 0 ? (
                <Tr key={s.subject}>
                  <Td>
                    <b>{s.subject}</b>
                  </Td>
                  <Td colSpan={8} className="text-vf-red">
                    No such column exists in the grade export — field created and left empty
                  </Td>
                </Tr>
              ) : (
                <Tr key={s.subject}>
                  <Td>
                    <b>{s.subject}</b>
                  </Td>
                  <TdNum>{s.n}</TdNum>
                  <TdNum>{s.term1?.toFixed(2)}</TdNum>
                  <TdNum>{s.term2?.toFixed(2)}</TdNum>
                  <TdNum>{s.term3?.toFixed(2)}</TdNum>
                  <TdNum>{s.improved}</TdNum>
                  <TdNum>{s.stable}</TdNum>
                  <TdNum>{s.declined}</TdNum>
                  <TdNum>
                    <Pill variant={(s.pct_improved ?? 0) >= 30 ? 'up' : 'flat'}>
                      {s.pct_improved}%
                    </Pill>
                  </TdNum>
                </Tr>
              ),
            )}
          </tbody>
        </Table>
      </TableWrap>

      <SectionHeading>Performance bands by term</SectionHeading>
      <Card>
        <BarChart
          rows={bandRows}
          labelKey="term"
          series={[
            { k: 'excellent', label: 'Excellent (4.0–5.0)', c: '#9EC83E' },
            { k: 'good', label: 'Good (3.0–3.9)', c: '#00A3DA' },
            { k: 'fair', label: 'Fair (2.0–2.9)', c: '#958EB8' },
            { k: 'poor', label: 'Poor (below 2.0)', c: '#D8232A' },
          ]}
        />
        <p className="mb-0 mt-2 text-[12.5px] text-muted">
          Band counts are not comparable across terms while term 3 is only{' '}
          {t[2].completeness}% complete.
        </p>
      </Card>
    </>
  );
}
