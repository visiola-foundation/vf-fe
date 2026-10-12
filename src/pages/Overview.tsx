import type { MisData } from '../types/mis';
import { fmt } from '../lib/format';
import { Card, Gauge, Kpi, Notice } from '../components/ui/primitives';
import {
  Eyebrow,
  Grid2,
  Grid4,
  Lede,
  PageTitle,
  SectionHeading,
} from '../components/ui/layout';
import { StackBar } from '../components/ui/charts';

export function Overview({ data }: { data: MisData }) {
  const T = data.totals;

  return (
    <>
      <Eyebrow>Programme monitoring</Eyebrow>
      <PageTitle>Overview</PageTitle>
      <Lede>
        Every figure below is computed from the three spreadsheets supplied. Where a field
        was never collected it is shown hatched, not as zero.
      </Lede>

      <Notice variant="err" title="Corrected term order in use">
        <p>
          The source analysis sheet labelled term&nbsp;2 as “Phase&nbsp;1”, term&nbsp;3 as
          “Phase&nbsp;2” and term&nbsp;1 as “Phase&nbsp;3”, on all 498 rows. The order was
          verified against GPAs recomputed from the raw letter grades and corrected here.
          Figures on this dashboard will not match the 2025 ASCG Impact Report.
        </p>
      </Notice>

      <Grid4>
        <Kpi
          label="Unique students"
          value={fmt(T.unique_students)}
          sub={`From ${fmt(T.source_rows)} source rows · ASCG only`}
          accent="blue"
        />
        <Kpi
          label="Participations"
          value={fmt(T.enrolments)}
          sub={`${fmt(T.enrolments - T.unique_students)} returning-year records`}
          accent="green"
        />
        <Kpi
          label="Schools"
          value={fmt(T.schools)}
          sub="Federal Capital Territory"
          accent="purple"
        />
        <Kpi
          label="Open data errors"
          value={fmt(T.errors)}
          sub={`of ${fmt(T.issues)} logged issues`}
          accent="red"
        />
      </Grid4>

      <SectionHeading>Record linkage</SectionHeading>
      <Lede>
        The biographical export carries no student ID, so it can only be joined to academic
        records on last name and school. A link is accepted only when that pair is unique
        on both sides.
      </Lede>
      <Card>
        <StackBar
          total={T.unique_students}
          segments={[
            { label: 'Confirmed link', v: T.confirmed, c: '#9EC83E' },
            { label: 'Ambiguous — needs review', v: T.ambiguous, c: '#E0A93B' },
            { label: 'No academic record found', v: T.unmatched, c: '#D8232A' },
          ]}
        />
      </Card>

      <SectionHeading>Field completeness across the register</SectionHeading>
      <Lede>
        The gauge is the point of this screen: it shows how much of each field actually
        exists today, so data collection can be aimed where it is thinnest.
      </Lede>
      <Grid2>
        {data.completeness.map((c) => (
          <Card key={c.field}>
            <div className="flex justify-between gap-2.5">
              <b className="text-[13.5px]">{c.field}</b>
              <span
                className={`font-mono text-[13.5px] tabular-nums ${
                  c.pct > 0 ? 'text-ink' : 'text-vf-red'
                }`}
              >
                {c.pct}%
              </span>
            </div>
            <Gauge filled={c.filled} total={c.total} />
            <div className="mt-[5px] flex justify-between font-mono text-[10.5px] text-muted">
              <span>{fmt(c.filled)} recorded</span>
              <span>{fmt(c.total - c.filled)} blank</span>
            </div>
          </Card>
        ))}
      </Grid2>
    </>
  );
}
