import { useState, type FC } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { AuthLayout } from '../layouts/AuthLayout'
import { Input } from '../components/ui/Input'
import { PasswordInput } from '../components/ui/PasswordInput'
import { Checkbox } from '../components/ui/Checkbox'
import { Button } from '../components/ui/Button'
import { AuthPrompt } from '../components/ui/AuthPrompt'
import { EmailVerificationModal } from '../components/ui/EmailVerificationModal'
import type { LoginFormValues } from '../types/auth'
import { EMAIL_REGEX } from '../constants/auth'
import authService from '../services/authService'
import customerPortalService from '../services/customerPortalService'
import toast from 'react-hot-toast'
import { HttpStatusCode } from 'axios'
import { useCurrentUser } from '../context/UserContext'

interface LoginProps {
  mode?: 'customer' | 'employee'
}

export const Login: FC<LoginProps> = ({ mode }) => {
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [unverifiedEmail, setUnverifiedEmail] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const { setUserFromAuth, setCustomerFromAuth } = useCurrentUser()

  const isEmployee = mode === 'employee' || location.pathname.includes('/employee')

  const {
    register,
    handleSubmit,
    setError,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  async function onSubmit(data: LoginFormValues): Promise<void> {
    const credentials = {
      ...data,
      email: data.email.trim(),
    }

    const { success, error, payload, status } = isEmployee
      ? await authService.employeeLogin(credentials)
      : await authService.customerLogin(credentials)

    if (success && payload) {
      localStorage.setItem('token', payload.accessToken)

      if (isEmployee) {
        try {
          const empRes = await authService.getEmployeeProfile()
          if (empRes.success && empRes.payload) {
            setUserFromAuth(payload, empRes.payload)
          } else {
            setUserFromAuth(payload, null)
          }
        } catch (err) {
          console.error('Error fetching employee details:', err)
          setUserFromAuth(payload, null)
        }
      } else {
        try {
          const custRes = await customerPortalService.getProfile()
          if (custRes.success && custRes.payload) {
            setCustomerFromAuth(payload, custRes.payload)
          } else {
            setCustomerFromAuth(payload, null)
          }
        } catch (err) {
          console.error('Error fetching customer profile:', err)
          setCustomerFromAuth(payload, null)
        }
      }

      toast.success('Logged in successfully!')
      navigate('/service-requests')
      return
    }

    const errorCode: string | undefined = error?.code

    if (errorCode === 'INVALID_EMAIL') {
      return setError('email', { message: 'Email is not registered!' })
    }

    if (errorCode === 'EMAIL_NOT_VERIFIED') {
      setUnverifiedEmail(data.email.trim())
      setShowVerificationModal(true)
      return
    }

    if (status === HttpStatusCode.Unauthorized) {
      toast.error('Invalid password!')
      resetField('password')
      setError('password', { message: 'Password is invalid!' })
      return
    }

    toast.error(error?.message || 'Login failed.')
  }

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return
    const res = await authService.resendVerificationEmail(unverifiedEmail)
    if (res.success) {
      toast.success('Verification email resent successfully!')
    } else {
      toast.error(res.error?.message || 'Failed to resend verification email.')
    }
  }

  return (
    <AuthLayout
      title={isEmployee ? 'Sign in to Employee Portal' : 'Sign in to Customer Portal'}
      subtitle={
        isEmployee
          ? 'Enter your credentials to access the FieldOps operations console'
          : 'Enter your credentials to manage your services and tickets'
      }
      cardMaxWidth="md"
      footer={
        <AuthPrompt
          prompt="Don't have an organization account?"
          linkText="Register Organization"
          to="/auth/signup"
        />
      }
    >
      {/* Switcher pill */}
      <div className="mb-6 flex justify-center">
        <div className="inline-flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200/80">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              !isEmployee
                ? 'bg-white text-blue-700 shadow-xs ring-1 ring-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Customer Portal
          </button>
          <button
            type="button"
            onClick={() => navigate('/login/employee')}
            className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              isEmployee
                ? 'bg-white text-blue-700 shadow-xs ring-1 ring-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Employee Access
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="name@company.com"
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

        <div>
          <div className="flex items-center justify-between">
            <PasswordInput
              label="Password"
              autoComplete="current-password"
              placeholder="••••••••"
              required="Password is required"
              containerClassName="w-full"
              error={errors.password}
              name="password"
              register={register}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <Checkbox
            id="rememberMe"
            label="Remember me"
            name="rememberMe"
            register={register}
          />

          <Link
            to="/auth/forgot-password"
            className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline sm:text-sm"
          >
            Forgot password?
          </Link>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            isLoading={isSubmitting}
          >
            {isEmployee ? 'Sign in as Employee' : 'Sign in as Customer'}
          </Button>
        </div>
      </form>

      <EmailVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        email={unverifiedEmail}
        title="Email Not Verified"
        description={
          <p>
            Your email is not verified. Please check your inbox and verify your account, or resend the verification link below.
          </p>
        }
        primaryActionText="Close"
        onPrimaryAction={() => setShowVerificationModal(false)}
        onResend={handleResendVerification}
      />
    </AuthLayout>
  )
}

export default Login
