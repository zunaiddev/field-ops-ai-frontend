import { useEffect, useState, type ReactNode } from 'react'
import { Button } from './Button'

export interface EmailVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  email?: string
  title?: ReactNode
  description?: ReactNode
  icon?: ReactNode
  primaryActionText?: string
  onPrimaryAction?: () => void
  showPrimaryAction?: boolean
  onResend?: () => Promise<void> | void
  showResend?: boolean
  resendCooldown?: number
  footerText?: ReactNode
  allowCloseOnBackdrop?: boolean
  showCloseButton?: boolean
  children?: ReactNode
  className?: string
}

export function EmailVerificationModal({
  isOpen,
  onClose,
  email,
  title = 'Verify your email address',
  description,
  icon,
  primaryActionText = 'Back to Sign In',
  onPrimaryAction,
  showPrimaryAction = true,
  onResend,
  showResend = true,
  resendCooldown = 60,
  footerText,
  allowCloseOnBackdrop = true,
  showCloseButton = true,
  children,
  className = '',
}: EmailVerificationModalProps) {
  const [cooldown, setCooldown] = useState(0)
  const [isResending, setIsResending] = useState(false)

  // Handle ESC key press
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && allowCloseOnBackdrop) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, allowCloseOnBackdrop, onClose])

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return

    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [cooldown])

  if (!isOpen) return null

  const handleResend = async () => {
    if (cooldown > 0 || isResending || !onResend) return

    try {
      setIsResending(true)
      await onResend()
      setCooldown(resendCooldown)
    } finally {
      setIsResending(false)
    }
  }

  const handlePrimaryClick = () => {
    if (onPrimaryAction) {
      onPrimaryAction()
    } else {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={allowCloseOnBackdrop ? onClose : undefined}
      />

      {/* Modal Container */}
      <div
        className={`relative z-10 w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 sm:p-8 text-center shadow-2xl transition-all animate-in zoom-in-95 duration-200 border border-slate-100 ${className}`}
      >
        {/* Close Button */}
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Modal Icon */}
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-8 ring-blue-50/50">
          {icon || (
            <svg
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="1.8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
              />
            </svg>
          )}
        </div>

        {/* Modal Title */}
        <h3 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          {title}
        </h3>

        {/* Modal Description */}
        <div className="mt-3 text-sm text-slate-600 leading-relaxed">
          {description || (
            <p>
              We have sent a verification email to{' '}
              {email ? (
                <span className="font-semibold text-slate-900 break-all">{email}</span>
              ) : (
                'your inbox'
              )}
              . Please check your inbox and click the verification link to activate your account.
            </p>
          )}
        </div>

        {/* Custom Children / Extra content */}
        {children && <div className="mt-4">{children}</div>}

        {/* Actions */}
        <div className="mt-6 space-y-3">
          {showPrimaryAction && (
            <Button
              type="button"
              variant="primary"
              size="md"
              fullWidth
              onClick={handlePrimaryClick}
            >
              {primaryActionText}
            </Button>
          )}

          {/* Resend option */}
          {showResend && onResend && (
            <div className="text-xs text-slate-500 pt-1">
              {footerText || "Didn't receive an email? Check your spam folder or"}{' '}
              <button
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0 || isResending}
                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isResending
                  ? 'Sending...'
                  : cooldown > 0
                    ? `Resend in ${cooldown}s`
                    : 'Click to resend'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EmailVerificationModal
