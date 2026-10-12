import type { ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react';

type Align = 'left' | 'right';


/** Scroll container that frames every table, with an optional max height. */
export function TableWrap({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`overflow-auto rounded-card border border-line bg-card ${className ?? ''}`}
    >
      {children}
    </div>
  );
}

export function Table({ children }: { children: ReactNode }) {
  return <table className="w-full border-collapse text-[13px]">{children}</table>;
}

export function Th({
  children,
  className,
  align = 'left',
  ...rest
}: ThHTMLAttributes<HTMLTableCellElement> & { align?: Align }) {
  return (
    <th
      {...rest}
      className={`sticky top-0 whitespace-nowrap border-b border-line bg-paper px-[11px] py-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted ${
        align === 'right' ? 'text-right' : 'text-left'
      } ${className ?? ''}`}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  className,
  align = 'left',
  ...rest
}: TdHTMLAttributes<HTMLTableCellElement> & { align?: Align }) {
  return (
    <td
      {...rest}
      className={`whitespace-nowrap border-b border-line px-[11px] py-2 align-top ${
        align === 'right' ? 'text-right' : 'text-left'
      } ${className ?? ''}`}
    >
      {children}
    </td>
  );
}

export function TdNum({
  children,
  className,
  ...rest
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      {...rest}
      className={`whitespace-nowrap border-b border-line px-[11px] py-2 text-right font-mono tabular-nums ${className ?? ''}`}
    >
      {children}
    </td>
  );
}

export function Tr({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr {...rest} className={`hover:bg-[#FAFBF9] ${className ?? ''}`}>
      {children}
    </tr>
  );
}
