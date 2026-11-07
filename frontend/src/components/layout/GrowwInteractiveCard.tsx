import { forwardRef, type HTMLAttributes, type ReactNode, type CSSProperties } from 'react'

export interface GrowwInteractiveCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className?: string
  contentClassName?: string
  contentStyle?: CSSProperties
  enableTilt?: boolean
  enableGlare?: boolean
}

/**
 * Groww-inspired interactive card with 3D cursor-tracking tilt and radial spotlight glare.
 * Strictly uses CSS custom properties and transform without React state re-renders.
 */
export const GrowwInteractiveCard = forwardRef<HTMLDivElement, GrowwInteractiveCardProps>(
  function GrowwInteractiveCard(
    {
      children,
      className = '',
      contentClassName = '',
      contentStyle,
      enableTilt = true,
      enableGlare = true,
      style,
      ...props
    },
    ref,
  ) {
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const ratioX = x / rect.width
      const ratioY = y / rect.height

      e.currentTarget.style.setProperty('--x', `${(ratioX * 100).toFixed(2)}%`)
      e.currentTarget.style.setProperty('--y', `${(ratioY * 100).toFixed(2)}%`)

      if (enableTilt) {
        const rotX = ((0.5 - ratioY) * 10).toFixed(2)
        const rotY = ((ratioX - 0.5) * 10).toFixed(2)
        e.currentTarget.style.transform = `scale(1.015) perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg)`
      }
    }

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
      if (enableTilt) {
        e.currentTarget.style.transform = 'perspective(1000px) scale(1) rotateX(0deg) rotateY(0deg)'
      }
    }

    return (
      <div
        ref={ref}
        className={`groww-tilt-card ${className}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          position: 'relative',
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color var(--transition-fast), box-shadow var(--transition-fast)',
          willChange: 'transform',
          ...style,
        }}
        {...props}
      >
        {enableGlare && <div className="groww-glare-effect" aria-hidden="true" />}
        <div
          className={contentClassName}
          style={{ position: 'relative', zIndex: 1, height: '100%', width: '100%', ...contentStyle }}
        >
          {children}
        </div>
      </div>
    )
  },
)
