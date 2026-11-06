import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { ThemeProvider } from './ThemeContext'
import { useTheme } from './useTheme'
import { ThemeToggle } from './ThemeToggle'

afterEach(() => {
  cleanup()
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
})

function ThemeConsumer() {
  const { theme } = useTheme()
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <ThemeToggle />
    </div>
  )
}

describe('ThemeContext & ThemeToggle', () => {
  it('defaults to light theme and toggles to dark theme', async () => {
    const user = userEvent.setup()
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    )

    expect(screen.getByTestId('current-theme')).toHaveTextContent('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')

    const toggleBtn = screen.getByRole('button', { name: /switch to dark mode/i })
    await user.click(toggleBtn)

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(localStorage.getItem('vl-theme')).toBe('dark')

    // Toggle back to light
    const switchBackBtn = screen.getByRole('button', { name: /switch to light mode/i })
    await user.click(switchBackBtn)

    expect(screen.getByTestId('current-theme')).toHaveTextContent('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(localStorage.getItem('vl-theme')).toBe('light')
  })
})
