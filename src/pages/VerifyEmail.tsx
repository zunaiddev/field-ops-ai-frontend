import { useEffect, useState, type FC } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AuthLayout } from '../layouts/AuthLayout'
import authService from '../services/authService'

export const VerifyEmail: FC = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [isVerifying, setIsVerifying] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setIsVerifying(false)
      setIsSuccess(false)
      setErrorMessage('Missing verification token in URL.')
      return
    }

    let isMounted = true

    const verify = async () => {
      try {
        const res = await authService.verifyEmail(token)
        if (!isMounted) return

        if (res.success) {
          setIsSuccess(true)
        } else {
          setIsSuccess(false)
          setErrorMessage(res.error?.message || 'Verification link is invalid or has expired.')
        }
      } catch (err) {
        if (!isMounted) return
        setIsSuccess(false)
        setErrorMessage(
          err instanceof Error
            ? err.message
            : 'Unable to verify email. Please try again or request a new link.',
        )
      } finally {
        if (isMounted) {
          setIsVerifying(false)
        }
      }
    }

    verify()

    return () => {
      isMounted = false
    }
  }, [token])

  if (isVerifying) {
    return (
      <AuthLayout title="Verifying Email" subtitle="Confirming your email address...">
        <div className="flex flex-col items-center justify-center py-10 space-y-4">
          <div className="h-9 w-9 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
          <p className="text-xs text-slate-500 font-medium">Please wait a moment...</p>
        </div>
      </AuthLayout>
    )
  }

  if (isSuccess) {
    return (
      <AuthLayout
        title="Email Verified!"
        subtitle="Your email address has been confirmed successfully"
      >
        <div className="space-y-4 text-center py-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <p className="text-xs text-slate-600 sm:text-sm">
            Your account is now fully active. You can proceed to sign in to the operations console.
          </p>

          <div className="pt-2">
            <Link
              to="/login/employee"
              className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
            >
              Sign In to Account
            </Link>
          </div>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Verification Failed"
      subtitle="We could not verify your email address"
    >
      <div className="space-y-4 text-center py-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600 ring-8 ring-rose-50/50">
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <p className="text-xs text-slate-600 sm:text-sm">
          {errorMessage || 'This verification link is invalid or has expired.'}
        </p>

        <p className="text-xs text-slate-400">
          Verification links expire for security reasons. You can sign in and request a new verification link.
        </p>

        <div className="pt-2">
          <Link
            to="/login/employee"
            className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}

export default VerifyEmail
