import type { HTMLAttributes, TableHTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from 'react'

export function TableWrapper({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`vl-table-wrapper ${className}`} {...props}>
      {children}
    </div>
  )
}

export function Table({ className = '', children, ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <table className={`vl-table ${className}`} {...props}>
      {children}
    </table>
  )
}

export function Th({
  numeric = false,
  className = '',
  children,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement> & { numeric?: boolean }) {
  return (
    <th className={`${numeric ? 'vl-table-numeric' : ''} ${className}`} {...props}>
      {children}
    </th>
  )
}

export function Td({
  numeric = false,
  className = '',
  children,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement> & { numeric?: boolean }) {
  return (
    <td className={`${numeric ? 'vl-table-numeric' : ''} ${className}`} {...props}>
      {children}
    </td>
  )
}
