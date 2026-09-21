import { useForm, type SubmitHandler } from 'react-hook-form'
import { AuthLayout } from '../layouts'
import { Input, PasswordInput, Checkbox, Button, AuthPrompt } from '../components/ui'
import type { LoginFormValues } from '../types'
import { EMAIL_REGEX } from '../constants'

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    mode: 'onTouched',
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    // Form is valid - print typed data to console (no API call per requirements)
    const sanitizedData: LoginFormValues = {
      email: data.email.trim(),
      password: data.password,
      rememberMe: data.rememberMe,
    }

    console.log('Login submitted:', sanitizedData)
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

          <a
            href="#forgot-password"
            onClick={(e) => {
              e.preventDefault()
              alert('Password reset functionality will be available in future releases.')
            }}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline sm:text-sm"
          >
            Forgot password?
          </a>
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
    </AuthLayout>
  )
}
