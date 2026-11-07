import { useEffect, useRef, type ReactNode } from 'react'

export interface SpotlightWrapperProps {
  children: ReactNode
  className?: string
}

/**
 * Ambient, interactive cursor-following radial spotlight glow.
 * Operates purely on CSS variables updated via requestAnimationFrame for 60fps+ performance
 * with zero React state re-render penalty.
 */
export function SpotlightWrapper({ children, className = '' }: SpotlightWrapperProps) {
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
      latestMouseRef.current = { x: event.clientX, y: event.clientY }
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

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseenter', handleMouseEnter)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
    }
  }, [])

  return (
    <div ref={containerRef} className={`spotlight-wrapper ${className}`}>
      {/* Background radial spotlight glow layer (fixed, pointer-events: none, z-index: 0) */}
      <div className="spotlight-glow" aria-hidden="true" />
      {/* Interactive content layer (relative, z-index: 1) */}
      <div className="spotlight-content">
        {children}
      </div>
    </div>
  )
}
