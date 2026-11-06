import { Link } from 'react-router-dom'
import { Button, Card } from '../design-system'
import { ArrowRight, ShieldAlert } from 'lucide-react'

export default function ForbiddenPage() {
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
            backgroundColor: 'var(--warning-subtle)',
            color: 'var(--warning-text)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--space-4) auto',
          }}
          aria-hidden="true"
        >
          <ShieldAlert size={24} strokeWidth={1.75} />
        </div>
        <span className="eyebrow">403 · Restricted Access</span>
        <h1 style={{ fontSize: 'var(--font-h2)', margin: 'var(--space-2) 0 var(--space-3) 0' }}>
          This door is not part of your role.
        </h1>
        <p style={{ fontSize: 'var(--font-small)', color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
          Stashh isolates startup, investor, and administrator permissions. Return to your designated workspace or visit the public overview.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-3)' }}>
          <Link to="/app">
            <Button variant="primary" size="md" rightIcon={<ArrowRight size={14} strokeWidth={1.75} />}>
              Go to my workspace
            </Button>
          </Link>
          <Link to="/">
            <Button variant="secondary" size="md">
              Home
            </Button>
          </Link>
        </div>
      </Card>
    </main>
  )
}
