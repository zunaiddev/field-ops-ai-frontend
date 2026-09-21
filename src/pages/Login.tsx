import {useState} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import {useForm} from 'react-hook-form'
import {AuthLayout} from '../layouts/AuthLayout'
import {Input} from '../components/ui/Input'
import {PasswordInput} from '../components/ui/PasswordInput'
import {Checkbox} from '../components/ui/Checkbox'
import {Button} from '../components/ui/Button'
import {AuthPrompt} from '../components/ui/AuthPrompt'
import {EmailVerificationModal} from '../components/ui/EmailVerificationModal'
import type {LoginFormValues} from '../types/auth'
import {EMAIL_REGEX} from '../constants/auth'
import authService from '../services/authService.ts'
import toast from 'react-hot-toast'
import {HttpStatusCode} from 'axios'

export default function Login() {
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [unverifiedEmail, setUnverifiedEmail] = useState('')
  const navigate = useNavigate();

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
    const { success, error, payload, status } = await authService.orgLogin({
      ...data,
      email: data.email.trim(),
    })

    if (success) {
      localStorage.setItem("token", payload?.accessToken as string);
      toast.success('Login successfully!');
      navigate('/dashboard')
      return;
    }

    const errorCode: string | undefined = error?.code;

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
      title="Sign in to your account"
      subtitle="Enter your credentials to access the FieldOps platform"
      cardMaxWidth="md"
      footer={
        <AuthPrompt
          prompt="Don't have an organization account?"
          linkText="Register Organization"
          to="/auth/signup"
        />
      }
    >
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
            to="/forgot-password"
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
            Sign in
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
