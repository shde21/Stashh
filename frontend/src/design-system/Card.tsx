import { forwardRef, type HTMLAttributes } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  as?: 'div' | 'article' | 'section'
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { size = 'md', interactive = false, as: Component = 'div', className = '', children, ...props },
  ref,
) {
  const classes = [
    'vl-card',
    size !== 'md' ? `vl-card-${size}` : '',
    interactive ? 'vl-card-interactive' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Component ref={ref} className={classes} {...props}>
      {children}
    </Component>
  )
})
