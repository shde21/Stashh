import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useAuth } from '../../auth/useAuth'
import { fetchPublicStartups, fetchReviewQueue, fetchStartupProfile } from '../../startup/startup.api'
import type { StartupProfile } from '../../startup/startup.types'

export interface DashboardTorchRevealProps {
  children: ReactNode
  className?: string
}

/**
 * 8 Sleek Minimalist Geometric Fintech Insignias
 * Rendered with refined 1.75px stroke geometry, subtle emerald fill opacity (0.12 - 0.25),
 * and styled as bespoke fintech marks for registered companies.
 */
function InsigniaHexPrism() {
  return (
    <svg width="36" height="36" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path d="M20 5 L32 12 L32 28 L20 35 L8 28 L8 12 Z" stroke="#00D09C" strokeWidth="1.75" fill="rgba(0, 208, 156, 0.15)" strokeLinejoin="round" />
      <path d="M20 5 L20 35 M8 12 L20 20 L32 12 M8 28 L20 20 L32 28" stroke="#00D09C" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  )
}

function InsigniaOrbitalRing() {
  return (
    <svg width="36" height="36" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="4" fill="#00D09C" fillOpacity="0.3" stroke="#00D09C" strokeWidth="1.75" />
      <ellipse cx="20" cy="20" rx="14" ry="5.5" stroke="#00D09C" strokeWidth="1.75" transform="rotate(-30 20 20)" />
      <ellipse cx="20" cy="20" rx="14" ry="5.5" stroke="#00D09C" strokeWidth="1.75" transform="rotate(30 20 20)" />
    </svg>
  )
}

function InsigniaDeltaShield() {
  return (
    <svg width="36" height="36" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path d="M20 6 L32 11 V22 C32 29 20 35 20 35 C20 35 8 29 8 22 V11 Z" stroke="#00D09C" strokeWidth="1.75" fill="rgba(0, 208, 156, 0.12)" strokeLinejoin="round" />
      <path d="M20 13 L26 22 H14 Z" stroke="#00D09C" strokeWidth="1.75" fill="#00D09C" fillOpacity="0.3" strokeLinejoin="round" />
    </svg>
  )
}

function InsigniaNexusLoop() {
  return (
    <svg width="36" height="36" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path d="M13 14 C8 14 6 18 6 20 C6 22 8 26 13 26 C18 26 22 14 27 14 C32 14 34 18 34 20 C34 22 32 26 27 26 C22 26 18 14 13 14 Z" stroke="#00D09C" strokeWidth="1.75" fill="rgba(0, 208, 156, 0.15)" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="13" cy="20" r="2.5" fill="#00D09C" />
      <circle cx="27" cy="20" r="2.5" fill="#00D09C" />
    </svg>
  )
}

function InsigniaNetworkMatrix() {
  return (
    <svg width="36" height="36" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <polygon points="20,8 32,30 8,30" stroke="#00D09C" strokeWidth="1.75" fill="rgba(0, 208, 156, 0.1)" strokeLinejoin="round" />
      <line x1="20" y1="8" x2="20" y2="22" stroke="#00D09C" strokeWidth="1.5" strokeDasharray="2 2" />
      <line x1="8" y1="30" x2="20" y2="22" stroke="#00D09C" strokeWidth="1.5" strokeDasharray="2 2" />
      <line x1="32" y1="30" x2="20" y2="22" stroke="#00D09C" strokeWidth="1.5" strokeDasharray="2 2" />
      <circle cx="20" cy="8" r="3.5" fill="#00D09C" fillOpacity="0.3" stroke="#00D09C" strokeWidth="1.75" />
      <circle cx="8" cy="30" r="3.5" fill="#00D09C" fillOpacity="0.3" stroke="#00D09C" strokeWidth="1.75" />
      <circle cx="32" cy="30" r="3.5" fill="#00D09C" fillOpacity="0.3" stroke="#00D09C" strokeWidth="1.75" />
      <circle cx="20" cy="22" r="2.5" fill="#00D09C" />
    </svg>
  )
}

function InsigniaWireframeCube() {
  return (
    <svg width="36" height="36" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path d="M20 7 L32 14 L20 21 L8 14 Z" stroke="#00D09C" strokeWidth="1.75" fill="rgba(0, 208, 156, 0.2)" strokeLinejoin="round" />
      <path d="M8 14 L20 21 L20 34 L8 27 Z" stroke="#00D09C" strokeWidth="1.75" fill="rgba(0, 208, 156, 0.12)" strokeLinejoin="round" />
      <path d="M32 14 L20 21 L20 34 L32 27 Z" stroke="#00D09C" strokeWidth="1.75" fill="rgba(0, 208, 156, 0.06)" strokeLinejoin="round" />
    </svg>
  )
}

function InsigniaPulseSpark() {
  return (
    <svg width="36" height="36" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path d="M20 6 C20 14 26 20 34 20 C26 20 20 26 20 34 C20 26 14 20 6 20 C14 20 20 14 20 6 Z" stroke="#00D09C" strokeWidth="1.75" fill="rgba(0, 208, 156, 0.22)" strokeLinejoin="round" />
      <circle cx="20" cy="20" r="3" fill="#00D09C" />
    </svg>
  )
}

function InsigniaAscentVector() {
  return (
    <svg width="36" height="36" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <rect x="7" y="7" width="26" height="26" rx="6" stroke="#00D09C" strokeWidth="1.75" fill="rgba(0, 208, 156, 0.08)" />
      <path d="M12 28 L17 23 L22 26 L28 15" stroke="#00D09C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M24 15 H28 V19" stroke="#00D09C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const INSIGNIA_COMPONENTS = [
  InsigniaHexPrism,
  InsigniaOrbitalRing,
  InsigniaDeltaShield,
  InsigniaNexusLoop,
  InsigniaNetworkMatrix,
  InsigniaWireframeCube,
  InsigniaPulseSpark,
  InsigniaAscentVector,
]

function getInsigniaIndex(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) % INSIGNIA_COMPONENTS.length
}

interface RegisteredCompanyItem {
  id: number
  companyName: string
  sector?: string | null
  logoUrl?: string | null
}

export function DashboardTorchReveal({ children, className = '' }: DashboardTorchRevealProps) {
  const { user } = useAuth()
  const containerRef = useRef<HTMLDivElement>(null)
  const rafIdRef = useRef<number | null>(null)
  const latestMouseRef = useRef<{ x: number; y: number } | null>(null)
  const [companies, setCompanies] = useState<RegisteredCompanyItem[]>([])

  // Dynamically load registered companies strictly from platform database/API
  useEffect(() => {
    let active = true

    async function loadCompanies() {
      try {
        if (!user) return

        let list: RegisteredCompanyItem[] = []
        if (user.role === 'INVESTOR') {
          const res = await fetchPublicStartups().catch(() => [])
          list = res.map((p) => ({ id: p.id, companyName: p.companyName, sector: p.sector, logoUrl: p.pitchUrl }))
        } else if (user.role === 'ADMIN') {
          const res = await fetchReviewQueue().catch(() => [])
          list = res.map((p) => ({ id: p.id, companyName: p.companyName, sector: p.sector }))
        } else if (user.role === 'STARTUP') {
          const p = await fetchStartupProfile().catch(() => undefined)
          if (p && p.companyName) {
            list = [{ id: p.id, companyName: p.companyName, sector: p.sector }]
          }
        }

        if (active) {
          setCompanies(list)
        }
      } catch {
        if (active) setCompanies([])
      }
    }

    loadCompanies()
    return () => {
      active = false
    }
  }, [user])

  // Mouse interaction: starts at center-top coordinates with immediate visibility
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Initialize at center-top coordinates so hero glow and logos greet user immediately
    container.style.setProperty('--mouse-x', '50%')
    container.style.setProperty('--mouse-y', '180px')
    container.style.setProperty('--torch-opacity', '1')

    const updatePosition = () => {
      if (latestMouseRef.current && container) {
        container.style.setProperty('--mouse-x', `${latestMouseRef.current.x}px`)
        container.style.setProperty('--mouse-y', `${latestMouseRef.current.y}px`)
      }
      rafIdRef.current = null
    }

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      latestMouseRef.current = { x, y }
      container.style.setProperty('--torch-opacity', '1')

      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(updatePosition)
      }
    }

    const handleMouseLeave = () => {
      // Gracefully fade opacity down on exit
      container.style.setProperty('--torch-opacity', '0.25')
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
    }

    const handleMouseEnter = () => {
      container.style.setProperty('--torch-opacity', '1')
    }

    container.addEventListener('mousemove', handleMouseMove, { passive: true })
    container.addEventListener('mouseleave', handleMouseLeave)
    container.addEventListener('mouseenter', handleMouseEnter)

    return () => {
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseleave', handleMouseLeave)
      container.removeEventListener('mouseenter', handleMouseEnter)
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
    }
  }, [])

  // If there are registered companies, tile them if count is small to form an ambient field
  const displayItems =
    companies.length > 0 && companies.length < 12
      ? Array.from({ length: 12 }, (_, i) => companies[i % companies.length])
      : companies

  return (
    <div
      ref={containerRef}
      className={`dashboard-torch-wrapper ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100%',
        overflow: 'hidden',
      }}
    >
      {/* LAYER 0 (Bottom): Masked registered company logo grid */}
      {displayItems.length > 0 && (
        <div
          className="dashboard-torch-logos"
          aria-hidden="true"
        >
          <div className="dashboard-torch-grid">
            {displayItems.map((company, index) => {
              const Insignia = INSIGNIA_COMPONENTS[getInsigniaIndex(`${company.companyName}-${company.id}-${index}`)]
              return (
                <div key={`${company.id}-${index}`} className="dashboard-torch-item">
                  <div className="dashboard-torch-insignia">
                    <Insignia />
                  </div>
                  <span className="dashboard-torch-name">{company.companyName}</span>
                  {company.sector && <span className="dashboard-torch-sector">{company.sector}</span>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* LAYER 1 (Middle): Ambient emerald torch glow */}
      <div className="dashboard-torch-glow" aria-hidden="true" />

      {/* LAYER 2 (Top, z-index: 10): Existing dashboard tables, metrics, cards, buttons */}
      <div className="dashboard-torch-content">
        {children}
      </div>
    </div>
  )
}
