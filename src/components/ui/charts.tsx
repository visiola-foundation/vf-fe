import { Fragment } from 'react';
import { Legend, LegendSwatch } from './layout';

/* ── Hand-drawn SVG charts (no external libraries, works offline) ──────
   Ported verbatim from the original dashboard's layout maths. ───────── */

const GRID = '#E2E6DF';
const AXIS = '#6E7370';
const LABEL = '#3D3B3C';
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

export interface BarSeries {
  k: string;
  label: string;
  c: string;
}

export interface BarRow {
  [key: string]: string | number;
}

export function BarChart({
  rows,
  labelKey,
  series,
  height = 210,
}: {
  rows: BarRow[];
  labelKey: string;
  series: BarSeries[];
  height?: number;
}) {
  const w = 720;
  const pad = { l: 44, r: 12, t: 14, b: 34 };
  const max =
    Math.max(...rows.flatMap((r) => series.map((s) => Number(r[s.k]) || 0))) || 1;
  const iw = w - pad.l - pad.r;
  const ih = height - pad.t - pad.b;
  const bw = iw / rows.length;
  const gw = bw * 0.62;
  const sw = gw / series.length;

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${height}`} role="img" className="h-auto w-full">
        {Array.from({ length: 5 }, (_, i) => {
          const y = pad.t + ih - (ih * i) / 4;
          const v = Math.round((max * i) / 4);
          return (
            <Fragment key={i}>
              <line x1={pad.l} y1={y} x2={w - pad.r} y2={y} stroke={GRID} />
              <text
                x={pad.l - 7}
                y={y + 3.5}
                textAnchor="end"
                fontSize={10}
                fontFamily={MONO}
                fill={AXIS}
              >
                {v}
              </text>
            </Fragment>
          );
        })}
        {rows.map((r, i) => (
          <Fragment key={i}>
            {series.map((s, j) => {
              const v = Number(r[s.k]) || 0;
              const h = (ih * v) / max;
              const x = pad.l + i * bw + (bw - gw) / 2 + j * sw;
              return (
                <rect
                  key={s.k}
                  x={x}
                  y={pad.t + ih - h}
                  width={Math.max(sw - 2.5, 0)}
                  height={h}
                  fill={s.c}
                  rx={2}
                >
                  <title>{`${r[labelKey]} · ${s.label}: ${v}`}</title>
                </rect>
              );
            })}
            <text
              x={pad.l + i * bw + bw / 2}
              y={height - 11}
              textAnchor="middle"
              fontSize={10.5}
              fontFamily={MONO}
              fill={LABEL}
            >
              {r[labelKey]}
            </text>
          </Fragment>
        ))}
      </svg>
      <Legend>
        {series.map((s) => (
          <span key={s.k}>
            <LegendSwatch color={s.c} />
            {s.label}
          </span>
        ))}
      </Legend>
    </div>
  );
}

export function LineChart({
  pts,
  lo,
  hi,
  labels,
  height = 210,
}: {
  pts: number[];
  lo: number;
  hi: number;
  labels: string[];
  height?: number;
}) {
  const w = 720;
  const pad = { l: 44, r: 16, t: 16, b: 32 };
  const iw = w - pad.l - pad.r;
  const ih = height - pad.t - pad.b;
  const x = (i: number) => pad.l + (pts.length === 1 ? iw / 2 : (iw * i) / (pts.length - 1));
  const y = (v: number) => pad.t + ih - (ih * (v - lo)) / (hi - lo);

  return (
    <svg viewBox={`0 0 ${w} ${height}`} role="img" className="h-auto w-full">
      {Array.from({ length: 5 }, (_, i) => {
        const gy = pad.t + ih - (ih * i) / 4;
        const gv = (lo + ((hi - lo) * i) / 4).toFixed(1);
        return (
          <Fragment key={i}>
            <line x1={pad.l} y1={gy} x2={w - pad.r} y2={gy} stroke={GRID} />
            <text
              x={pad.l - 7}
              y={gy + 3.5}
              textAnchor="end"
              fontSize={10}
              fontFamily={MONO}
              fill={AXIS}
            >
              {gv}
            </text>
          </Fragment>
        );
      })}
      <polyline
        fill="none"
        stroke="#00A3DA"
        strokeWidth={2.5}
        strokeLinejoin="round"
        points={pts.map((p, i) => `${x(i)},${y(p)}`).join(' ')}
      />
      {pts.map((p, i) => (
        <Fragment key={i}>
          <circle cx={x(i)} cy={y(p)} r={5} fill="#fff" stroke="#00A3DA" strokeWidth={2.5} />
          <text
            x={x(i)}
            y={y(p) - 13}
            textAnchor="middle"
            fontSize={11.5}
            fontWeight={650}
            fontFamily={MONO}
            fill="#151314"
          >
            {p.toFixed(2)}
          </text>
          <text
            x={x(i)}
            y={height - 10}
            textAnchor="middle"
            fontSize={10.5}
            fontFamily={MONO}
            fill={LABEL}
          >
            {labels[i]}
          </text>
        </Fragment>
      ))}
    </svg>
  );
}

export interface StackSegment {
  label: string;
  v: number;
  c: string;
}

export function StackBar({
  segments,
  total,
}: {
  segments: StackSegment[];
  total: number;
}) {
  return (
    <div>
      <div className="flex h-[26px] overflow-hidden rounded-[6px] border border-line">
        {segments
          .filter((s) => s.v > 0)
          .map((s) => (
            <div
              key={s.label}
              style={{ width: `${((s.v / total) * 100).toFixed(2)}%`, background: s.c }}
              title={`${s.label}: ${s.v}`}
            />
          ))}
      </div>
      <Legend>
        {segments.map((s) => (
          <span key={s.label}>
            <LegendSwatch color={s.c} />
            {s.label} <b className="font-mono tabular-nums">{s.v}</b>
          </span>
        ))}
      </Legend>
    </div>
  );
}
