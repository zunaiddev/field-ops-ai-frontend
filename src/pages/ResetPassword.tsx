import { useEffect, useState, type FC } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { AuthLayout } from '../layouts/AuthLayout'
import { PasswordInput } from '../components/ui/PasswordInput'
import { Button } from '../components/ui/Button'
import authService from '../services/authService'
import type { UserType } from '../types/auth'

interface ResetPasswordFormData {
  password: string
  confirmPassword: string
}

export const ResetPassword: FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''

  const [isVerifying, setIsVerifying] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [userType, setUserType] = useState<UserType>('EMPLOYEE')
  const [verifyError, setVerifyError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const passwordValue = watch('password')

  // Verify token on mount
  useEffect(() => {
    if (!token) {
      setIsVerifying(false)
      setTokenValid(false)
      setVerifyError('Missing password reset token in URL.')
      return
    }

    let isMounted = true

    const verify = async () => {
      try {
        const res = await authService.verifyResetPasswordToken(token)
        if (!isMounted) return

        if (res.success && res.payload?.valid) {
          setTokenValid(true)
          setUserEmail(res.payload.email)
          setUserType(res.payload.userType || 'EMPLOYEE')
        } else {
          setTokenValid(false)
          setVerifyError(
            res.error?.message ||
              'This password reset link is invalid, has expired, or has already been used.',
          )
        }
      } catch (err) {
        if (!isMounted) return
        setTokenValid(false)
        setVerifyError(
          err instanceof Error
            ? err.message
            : 'Unable to verify reset link. Please request a new one.',
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

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error('Missing reset token.')
      return
    }

    try {
      const res = await authService.resetPassword({
        token,
        password: data.password,
      })

      if (res.success) {
        setIsSuccess(true)
        toast.success('Password updated successfully!')
        const redirectPath = userType === 'CUSTOMER' ? '/auth/login' : '/login/employee'
        setTimeout(() => {
          navigate(redirectPath)
        }, 2000)
      } else {
        toast.error(res.error?.message || 'Failed to reset password.')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred.')
    }
  }

  // 1. Verifying Token State
  if (isVerifying) {
    return (
      <AuthLayout title="Verifying Link" subtitle="Validating your password reset token...">
        <div className="flex flex-col items-center justify-center py-10 space-y-4">
          <div className="h-9 w-9 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
          <p className="text-xs text-slate-500 font-medium">Please wait a moment...</p>
        </div>
      </AuthLayout>
    )
  }

  // 2. Invalid or Expired Token State
  if (!tokenValid) {
    return (
      <AuthLayout
        title="Invalid or Expired Link"
        subtitle="We could not verify your password reset request"
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
            {verifyError || 'This password reset link is invalid or has expired.'}
          </p>

          <p className="text-xs text-slate-400">
            Reset links expire after 12 hours and can only be used once for security reasons.
          </p>

          <div className="pt-3">
            <Link
              to="/auth/forgot-password"
              className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
            >
              Request a New Reset Link
            </Link>
          </div>

          <div className="pt-1">
            <Link
              to="/login"
              className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              &larr; Back to sign in
            </Link>
          </div>
        </div>
      </AuthLayout>
    )
  }

  // 3. Success State
  if (isSuccess) {
    return (
      <AuthLayout
        title="Password Reset Successful"
        subtitle="Your password has been changed securely"
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
            You can now sign in with your new password.
          </p>

          <div className="pt-2">
            <Link
              to={userType === 'CUSTOMER' ? '/auth/login' : '/login/employee'}
              className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
            >
              Proceed to Sign In
            </Link>
          </div>
        </div>
      </AuthLayout>
    )
  }

  // 4. Form State (Valid Token)
  return (
    <AuthLayout
      title="Create New Password"
      subtitle="Enter a new secure password for your account"
      cardMaxWidth="md"
    >
      <div className="mb-4 rounded-lg bg-slate-50 p-3 border border-slate-200/80 flex items-center justify-between text-xs">
        <div>
          <span className="text-slate-500">Resetting password for:</span>
          <p className="font-semibold text-slate-900 mt-0.5">{userEmail}</p>
        </div>
        <span
          className={`rounded-md px-2 py-0.5 font-medium text-[11px] ring-1 ${
            userType === 'CUSTOMER'
              ? 'bg-teal-50 text-teal-700 ring-teal-600/20'
              : 'bg-blue-50 text-blue-700 ring-blue-600/20'
          }`}
        >
          {userType === 'CUSTOMER' ? 'Customer' : 'Employee'}
        </span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <PasswordInput
          label="New Password"
          autoComplete="new-password"
          placeholder="••••••••"
          required="New password is required"
          error={errors.password}
          name="password"
          register={register}
          rules={{
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters long',
            },
          }}
        />

        <PasswordInput
          label="Confirm New Password"
          autoComplete="new-password"
          placeholder="••••••••"
          required="Please confirm your new password"
          error={errors.confirmPassword}
          name="confirmPassword"
          register={register}
          rules={{
            validate: (value) => {
              if (value !== passwordValue) {
                return 'Passwords do not match'
              }
              return true
            },
          }}
        />

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            isLoading={isSubmitting}
          >
            Update Password
          </Button>
        </div>

        <div className="text-center pt-2">
          <Link
            to={userType === 'CUSTOMER' ? '/auth/login' : '/login/employee'}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            &larr; Back to sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}

export default ResetPassword
