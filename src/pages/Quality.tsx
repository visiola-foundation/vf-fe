import type { ReactNode } from 'react';
import type { MisData } from '../types/mis';
import { fmt } from '../lib/format';
import { Kpi, Pill } from '../components/ui/primitives';
import { Eyebrow, Grid4, Lede, PageTitle, SectionHeading } from '../components/ui/layout';
import { Table, TableWrap, Td, TdNum, Th, Tr } from '../components/ui/table';

function WrapTd({ children, maxWidth }: { children: ReactNode; maxWidth: number }) {
  return (
    <td
      className="whitespace-normal border-b border-line px-[11px] py-2 align-top"
      style={{ maxWidth }}
    >
      {children}
    </td>
  );
}

export function Quality({ data }: { data: MisData }) {
  const T = data.totals;

  return (
    <>
      <Eyebrow>Records</Eyebrow>
      <PageTitle>Data quality</PageTitle>
      <Lede>
        Every cleaning decision made during loading was written to a log rather than applied
        silently. Nothing was deleted; rows that failed validation were kept and excluded
        from the affected calculation only.
      </Lede>

      <Grid4>
        <Kpi label="Issues logged" value={fmt(T.issues)} sub="Across all three files" accent="blue" />
        <Kpi label="Errors" value={fmt(T.errors)} sub="Block a calculation" accent="red" />
        <Kpi label="Warnings" value={fmt(T.issues - T.errors)} sub="Recorded, not blocking" accent="purple" />
        <Kpi label="Ambiguous links" value={fmt(T.ambiguous)} sub="Need manual resolution" accent="red" />
      </Grid4>

      <SectionHeading>Where the problems are</SectionHeading>
      <TableWrap>
        <Table>
          <thead>
            <tr>
              <Th>Field</Th>
              <Th>Severity</Th>
              <Th align="right">Count</Th>
            </tr>
          </thead>
          <tbody>
            {data.issueSummary.map((r) => (
              <Tr key={`${r.field}-${r.severity}`}>
                <Td>{r.field}</Td>
                <Td>
                  <Pill variant={r.severity === 'error' ? 'no' : 'amb'}>{r.severity}</Pill>
                </Td>
                <TdNum>{fmt(r.n)}</TdNum>
              </Tr>
            ))}
          </tbody>
        </Table>
      </TableWrap>

      <SectionHeading>Issue log</SectionHeading>
      <Lede>
        First 400 entries. The full log is in data_quality_log.csv and loads into the table{' '}
        <span className="font-mono">vf.data_quality_issue</span>, where each item can be
        marked resolved.
      </Lede>
      <TableWrap className="max-h-[52vh]">
        <Table>
          <thead>
            <tr>
              <Th>Entity</Th>
              <Th>Reference</Th>
              <Th>Field</Th>
              <Th>Issue</Th>
              <Th>Action taken</Th>
            </tr>
          </thead>
          <tbody>
            {data.issues.map((i) => (
              <Tr key={`${i.entity}-${i.ref}-${i.field}`}>
                <Td>{i.entity}</Td>
                <Td className="font-mono text-[11.5px] tabular-nums">{i.ref}</Td>
                <Td>{i.field}</Td>
                <WrapTd maxWidth={380}>{i.issue}</WrapTd>
                <WrapTd maxWidth={280}>
                  <span className="text-muted">{i.action}</span>
                </WrapTd>
              </Tr>
            ))}
          </tbody>
        </Table>
      </TableWrap>
    </>
  );
}
