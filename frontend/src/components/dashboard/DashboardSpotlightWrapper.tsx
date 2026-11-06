import { useEffect, useRef, type ReactNode } from 'react'

export interface DashboardSpotlightWrapperProps {
  children: ReactNode
  className?: string
}

/**
 * Ambient, interactive cursor-following radial spotlight glow exclusively for the Dashboard.
 * Operates purely on CSS variables updated via requestAnimationFrame for 60fps+ performance
 * with zero React state re-render penalty.
 */
export function DashboardSpotlightWrapper({ children, className = '' }: DashboardSpotlightWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rafIdRef = useRef<number | null>(null)
  const latestMouseRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

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

      container.style.setProperty('--spotlight-opacity', '1')

      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(updatePosition)
      }
    }

    const handleMouseLeave = () => {
      container.style.setProperty('--spotlight-opacity', '0')
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
    }

    const handleMouseEnter = () => {
      container.style.setProperty('--spotlight-opacity', '1')
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

  return (
    <div
      ref={containerRef}
      className={`dashboard-spotlight-wrapper ${className}`}
    >
      {/* Background radial spotlight glow layer (pointer-events: none, z-index: 0) */}
      <div
        className="dashboard-spotlight-glow"
        aria-hidden="true"
      />
      {/* Interactive dashboard content layer (relative, z-index: 1) */}
      <div className="dashboard-spotlight-content">
        {children}
      </div>
    </div>
  )
}
