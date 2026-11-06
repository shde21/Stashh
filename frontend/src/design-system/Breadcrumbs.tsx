import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  to?: string
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumbs" style={{ marginBottom: 'var(--space-3)' }}>
      <ol
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          listStyle: 'none',
          padding: 0,
          margin: 0,
          fontSize: 'var(--font-caption)',
          color: 'var(--text-secondary)',
        }}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li
              key={index}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
            >
              {index > 0 && <ChevronRight size={12} strokeWidth={1.75} aria-hidden="true" />}
              {isLast || !item.to ? (
                <span aria-current={isLast ? 'page' : undefined} style={{ color: isLast ? 'var(--text)' : undefined, fontWeight: isLast ? 'var(--weight-medium)' : undefined }}>
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.to}
                  style={{
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    transition: 'color var(--transition-fast)',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.color = 'var(--text)')}
                  onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
