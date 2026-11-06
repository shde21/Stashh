import { Link } from 'react-router-dom'
import { Button, Card } from '../design-system'
import { ArrowRight, Compass } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-subtle)',
        padding: 'var(--space-6)',
      }}
    >
      <Card style={{ maxWidth: '480px', width: '100%', textAlign: 'center', padding: 'var(--space-10) var(--space-8)' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-subtle)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--space-4) auto',
            border: '1px solid var(--border)',
          }}
          aria-hidden="true"
        >
          <Compass size={24} strokeWidth={1.75} />
        </div>
        <span className="eyebrow">404 · Page Not Found</span>
        <h1 style={{ fontSize: 'var(--font-h2)', margin: 'var(--space-2) 0 var(--space-3) 0' }}>
          This page does not exist.
        </h1>
        <p style={{ fontSize: 'var(--font-small)', color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
          The link you followed may be expired or incorrect. Return to stashh to continue navigating.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Link to="/">
            <Button variant="primary" size="md" rightIcon={<ArrowRight size={14} strokeWidth={1.75} />}>
              Back to stashh
            </Button>
          </Link>
        </div>
      </Card>
    </main>
  )
}
