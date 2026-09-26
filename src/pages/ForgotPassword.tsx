import { useState, useEffect, type FC } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { AuthLayout } from '../layouts/AuthLayout'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { AuthPrompt } from '../components/ui/AuthPrompt'
import { EMAIL_REGEX } from '../constants/auth'
import authService from '../services/authService'
import { MailIcon } from '../components/icons'

interface ForgotPasswordFormValues {
  email: string
}

export const ForgotPassword: FC = () => {
  const location = useLocation()
  const [isCustomer, setIsCustomer] = useState(
    location.pathname.includes('/customer') || location.search.includes('type=customer'),
  )
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    defaultValues: {
      email: '',
    },
  })

  // Decrement cooldown timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldownSeconds])

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    const email = data.email.trim()
    try {
      const res = await authService.forgotPassword(email, isCustomer)

      if (res.success) {
        setSubmittedEmail(email)
        setCooldownSeconds(180) // 3-minute cooldown
        toast.success('Password reset link sent! Check your inbox.')
        return
      }

      const status = res.status
      const errorCode = res.error?.code || res.error?.errorCode

      if (status === 429 || errorCode === 'TOO_MANY_REQUESTS') {
        setCooldownSeconds(180)
        toast.error('Too many requests. Please wait before trying again.')
        setError('email', {
          message: 'Rate limit active. Please wait 3 minutes before requesting another link.',
        })
        return
      }

      if (status === 404 || errorCode === 'USER_NOT_FOUND' || errorCode === 'CUSTOMER_NOT_FOUND') {
        setError('email', {
          message: isCustomer
            ? 'No customer account registered with this email address.'
            : 'No user account registered with this email address.',
        })
        return
      }

      toast.error(res.error?.message || 'Failed to send password reset link.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An unexpected error occurred.')
    }
  }

  const handleResend = async () => {
    if (!submittedEmail || cooldownSeconds > 0) return
    try {
      const res = await authService.forgotPassword(submittedEmail, isCustomer)
      if (res.success) {
        setCooldownSeconds(180)
        toast.success('New password reset link sent!')
      } else {
        toast.error(res.error?.message || 'Failed to resend reset link.')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred.')
    }
  }

  const formatCooldown = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const rem = secs % 60
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`
  }

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle={
        isCustomer
          ? 'Enter your customer account email to receive a password reset link'
          : 'Enter your organization email to receive a password reset link'
      }
      cardMaxWidth="md"
      footer={
        <AuthPrompt
          prompt="Remember your password?"
          linkText="Sign in"
          to={isCustomer ? '/auth/login' : '/login/employee'}
        />
      }
    >
      {/* Portal Switcher */}
      <div className="mb-6 flex justify-center">
        <div className="inline-flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200/80">
          <button
            type="button"
            onClick={() => {
              setIsCustomer(false)
              setSubmittedEmail(null)
            }}
            className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              !isCustomer
                ? 'bg-white text-blue-700 shadow-xs ring-1 ring-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Employee / Staff
          </button>
          <button
            type="button"
            onClick={() => {
              setIsCustomer(true)
              setSubmittedEmail(null)
            }}
            className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              isCustomer
                ? 'bg-white text-blue-700 shadow-xs ring-1 ring-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Customer Portal
          </button>
        </div>
      </div>

      {submittedEmail ? (
        /* Sent Confirmation State */
        <div className="space-y-5 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-8 ring-blue-50/50">
            <MailIcon className="h-7 w-7" />
          </div>

          <div>
            <h3 className="text-base font-semibold text-slate-900">Check your inbox</h3>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              We sent a password reset link to{' '}
              <strong className="text-slate-800 font-semibold">{submittedEmail}</strong>
            </p>
            <p className="mt-2 text-xs text-slate-400">
              The link is valid for 12 hours. If you don't see it, check your spam or junk folder.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="md"
              fullWidth
              onClick={handleResend}
              disabled={cooldownSeconds > 0}
            >
              {cooldownSeconds > 0
                ? `Resend available in ${formatCooldown(cooldownSeconds)}`
                : 'Resend Reset Link'}
            </Button>

            <button
              type="button"
              onClick={() => setSubmittedEmail(null)}
              className="text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Try a different email address
            </button>
          </div>
        </div>
      ) : (
        /* Email Request Form */
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input
            label="Account Email"
            type="email"
            autoComplete="email"
            placeholder={isCustomer ? 'customer@example.com' : 'employee@company.com'}
            required="Email is required"
            error={errors.email}
            name="email"
            register={register}
            rules={{
              pattern: {
                value: EMAIL_REGEX,
                message: 'Please provide a valid email address',
              },
            }}
          />

          {cooldownSeconds > 0 && (
            <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200">
              Please wait <strong>{formatCooldown(cooldownSeconds)}</strong> before requesting another link.
            </div>
          )}

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              isLoading={isSubmitting}
              disabled={cooldownSeconds > 0}
            >
              Send Password Reset Link
            </Button>
          </div>

          <div className="text-center pt-2">
            <Link
              to={isCustomer ? '/auth/login' : '/login/employee'}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              &larr; Back to sign in
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  )
}

export default ForgotPassword
