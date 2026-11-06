import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Button } from './Button'
import { Field } from './Field'
import { Input } from './Input'
import { StatusPill } from './StatusPill'
import { ProgressBar } from './ProgressBar'
import { Modal } from './Modal'
import { SegmentedControl } from './Tabs'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('Design System Primitives', () => {
  describe('Button', () => {
    it('renders with children and handles clicks', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      render(<Button onClick={handleClick}>Click me</Button>)
      await user.click(screen.getByRole('button', { name: /click me/i }))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('displays loading indicator and is disabled when loading', () => {
      render(<Button loading>Submit</Button>)
      const btn = screen.getByRole('button', { name: /submit/i })
      expect(btn).toBeDisabled()
      expect(btn).toHaveAttribute('aria-busy', 'true')
    })
  })

  describe('Field & Input', () => {
    it('associates label with input and provides aria-describedby for errors', () => {
      render(
        <Field label="Email" htmlFor="email-test" error="Email is invalid">
          {(fieldProps) => <Input {...fieldProps} type="email" />}
        </Field>,
      )
      const input = screen.getByLabelText(/email/i)
      expect(input).toHaveAttribute('id', 'email-test')
      expect(input).toHaveAttribute('aria-invalid', 'true')
      expect(input).toHaveAttribute('aria-describedby', 'email-test-error')
      expect(screen.getByText('Email is invalid')).toBeInTheDocument()
    })
  })

  describe('StatusPill', () => {
    it('renders correct label and status variant', () => {
      const { rerender } = render(<StatusPill status="APPROVED" />)
      expect(screen.getByText('Approved')).toBeInTheDocument()

      rerender(<StatusPill status="CHANGES_REQUESTED" />)
      expect(screen.getByText('Changes Requested')).toBeInTheDocument()
    })
  })

  describe('ProgressBar', () => {
    it('clamps values between 0 and 100 with accessible attributes', () => {
      render(<ProgressBar value={120} label="Overfilled" />)
      const bar = screen.getByRole('progressbar', { name: /overfilled/i })
      expect(bar).toHaveAttribute('aria-valuenow', '100')
      expect(bar).toHaveAttribute('aria-valuemin', '0')
      expect(bar).toHaveAttribute('aria-valuemax', '100')
    })
  })

  describe('Modal', () => {
    it('renders modal dialog when open and triggers onClose on escape', async () => {
      const handleClose = vi.fn()
      const user = userEvent.setup()
      render(
        <Modal isOpen={true} onClose={handleClose} title="Dialog Title" description="Dialog Desc">
          <p>Dialog Content</p>
        </Modal>,
      )
      expect(screen.getByRole('dialog', { name: /dialog title/i })).toBeInTheDocument()
      expect(screen.getByText('Dialog Content')).toBeInTheDocument()

      await user.keyboard('{Escape}')
      expect(handleClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('SegmentedControl', () => {
    it('handles tab selection', async () => {
      const handleChange = vi.fn()
      const user = userEvent.setup()
      render(
        <SegmentedControl
          value="A"
          onChange={handleChange}
          options={[
            { id: 'A', label: 'Option A' },
            { id: 'B', label: 'Option B' },
          ]}
        />,
      )
      await user.click(screen.getByRole('tab', { name: /option b/i }))
      expect(handleChange).toHaveBeenCalledWith('B')
    })
  })
})
