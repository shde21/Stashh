import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import type { UserRole } from '../../auth/auth.types'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'

export type AuthModalMode = 'login' | 'register'

export interface AuthModalProps {
  mode: AuthModalMode | null
  initialRole?: UserRole
  redirectTo?: string
  onClose: () => void
  onSwitchMode: (nextMode: AuthModalMode) => void
}

const SHOWCASE_PILLARS = [
  'Verified Startups',
  'Cap Table Rigor',
  'Direct Equity Shares',
  'Admin Due Diligence',
]

export function AuthModal({
  mode,
  initialRole = 'STARTUP',
  redirectTo = '/app',
  onClose,
  onSwitchMode,
}: AuthModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const isOpen = mode !== null
  const [pillarIndex, setPillarIndex] = useState(0)

  useEffect(() => {
    if (!isOpen) return
    const interval = window.setInterval(() => {
      setPillarIndex((prev) => (prev + 1) % SHOWCASE_PILLARS.length)
    }, 3500)
    return () => window.clearInterval(interval)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onCloseRef.current()
        return
      }

      if (event.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        if (focusableElements.length === 0) return

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (event.shiftKey && document.activeElement === firstElement) {
          lastElement.focus()
          event.preventDefault()
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          firstElement.focus()
          event.preventDefault()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    const prevActiveElement = document.activeElement as HTMLElement | null

    if (modalRef.current && !modalRef.current.contains(document.activeElement)) {
      const preferred = modalRef.current.querySelector<HTMLElement>(
        'input:not([type="radio"]), input[type="radio"]:checked, select, textarea',
      )
      preferred?.focus()
    }

    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
      prevActiveElement?.focus()
    }
  }, [isOpen, mode])

  if (!mode) return null

  const isLogin = mode === 'login'

  return (
    <div
      className="vl-modal-backdrop auth-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="vl-modal-content auth-modal-content"
      >
        {/* Left Visual Panel: Dark Forest Green with Subtle Topographic Contours */}
        <div className="auth-modal-visual">
          <svg
            className="auth-modal-topo"
            viewBox="0 0 400 500"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <path d="M-40,70 C70,40 120,140 240,95 C330,60 360,10 440,35" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <path d="M-40,120 C85,85 140,185 265,135 C355,100 375,45 450,75" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <path d="M-30,175 C95,140 165,235 285,180 C370,140 390,90 455,120" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <path d="M10,275 C65,205 185,200 240,260 C295,320 205,390 120,375 C35,360 -25,320 10,275 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <path d="M45,285 C85,235 170,235 205,275 C240,315 185,355 125,345 C65,335 25,310 45,285 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <path d="M-40,405 C80,370 175,445 295,400 C375,370 405,325 455,345" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <path d="M-40,455 C90,420 185,495 310,450 C390,420 415,375 460,395" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="320" cy="245" r="78" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="320" cy="245" r="46" fill="none" stroke="currentColor" strokeWidth="1.2" />
          </svg>

          <div className="auth-modal-visual-top">
            <button
              type="button"
              className="auth-modal-visual-brand"
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
              aria-label="Back to Stashh landing page"
            >
              <span className="brand-mark" aria-hidden="true">S</span>
              <span>Stashh</span>
            </button>
            <p className="auth-modal-visual-headline">
              Invest &amp; raise with precision.
            </p>
          </div>

          <div className="auth-modal-visual-bottom">
            <div className="auth-modal-indicator-bar" aria-hidden="true" />
            <span className="auth-modal-pillar-label">
              {SHOWCASE_PILLARS[pillarIndex]}
            </span>
          </div>
        </div>

        {/* Right Form Panel: Elevated Charcoal / Clean White Surface */}
        <div className="auth-modal-form-pane">
          <button
            type="button"
            className="vl-btn vl-btn-ghost vl-btn-sm auth-modal-close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} strokeWidth={1.75} aria-hidden="true" />
          </button>

          <div className="auth-modal-form-header">
            <span className="section-tag">
              {isLogin ? 'Account access' : 'Get started'}
            </span>
            <h2 id="auth-modal-title">
              {isLogin ? 'Sign in to Stashh' : 'Create your account'}
            </h2>
            <p className="auth-modal-subtitle">
              {isLogin
                ? 'Enter your credentials to access your workspace.'
                : 'Choose your account role to set up your simulated workspace.'}
            </p>
          </div>

          <div className="auth-modal-form-content">
            {isLogin ? (
              <LoginForm redirectTo={redirectTo} />
            ) : (
              <RegisterForm initialRole={initialRole} />
            )}
          </div>

          <div className="auth-footer">
            {isLogin ? (
              <span>
                Don’t have an account?{' '}
                <button
                  type="button"
                  className="auth-switch-link"
                  onClick={() => onSwitchMode('register')}
                >
                  Create an account
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  className="auth-switch-link"
                  onClick={() => onSwitchMode('login')}
                >
                  Sign in
                </button>
              </span>
            )}
            <p className="auth-modal-legal">
              Role-governed startup equity &amp; capitalization simulation.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

