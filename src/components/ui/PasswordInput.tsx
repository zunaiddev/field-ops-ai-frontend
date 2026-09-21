import { forwardRef, useState } from 'react'
import Input, { type InputProps } from './Input'

export interface PasswordInputProps extends Omit<InputProps, 'type' | 'rightIcon'> {
  showToggle?: boolean
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showToggle = true, ...props }, ref) => {
    const [isVisible, setIsVisible] = useState(false)

    const toggleVisibility = () => {
      setIsVisible((prev) => !prev)
    }

    const toggleButton = showToggle ? (
      <button
        type="button"
        onClick={toggleVisibility}
        className="rounded p-1 text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        aria-label={isVisible ? 'Hide password' : 'Show password'}
        tabIndex={0}
      >
        {isVisible ? (
          /* Eye Off Icon */
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        ) : (
          /* Eye Icon */
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
          </svg>
        )}
      </button>
    ) : undefined

    return (
      <Input
        ref={ref}
        type={isVisible ? 'text' : 'password'}
        rightIcon={toggleButton}
        {...props}
      />
    )
  },
)

PasswordInput.displayName = 'PasswordInput'

export default PasswordInput
