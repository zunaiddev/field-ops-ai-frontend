import {useState} from 'react'
import {type SubmitHandler, useForm} from 'react-hook-form'
import {AuthLayout} from '../layouts'
import {AuthPrompt, Button, Input, PasswordInput, Select} from '../components/ui'
import {orgNameToSlug} from '../utils'
import type {OrganizationRegistrationForm} from '../types'
import {COMMON_CURRENCIES, COMMON_TIMEZONES, EMAIL_REGEX, SLUG_REGEX} from '../constants'

export default function Signup() {
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<OrganizationRegistrationForm>({
    mode: 'onTouched',
    defaultValues: {
      orgName: '',
      orgSlug: '',
      timezone: 'Australia/Sydney',
      currency: 'USD',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit: SubmitHandler<OrganizationRegistrationForm> = async (data) => {
    console.log('Organization registration submitted:', data);
  }

  return (
    <AuthLayout
      title="Register your organization"
      subtitle="Create a new organization workspace and initial administrator account"
      cardMaxWidth="xl"
      footer={
        <AuthPrompt
          prompt="Already have an account?"
          linkText="Sign in"
          to="/auth/login"
        />
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        <div>
          <div className="mb-3 border-b border-slate-200 pb-2">
            <h2 className="text-sm font-semibold tracking-tight text-slate-900">
              Organization Details
            </h2>
            <p className="text-xs text-slate-500">
              Configure your organization workspace profile and regional defaults.
            </p>
          </div>

          <div className="space-y-4">
            <Input
              label="Organization Name"
              placeholder="e.g. Bluehaven Maintenance"
              required="Organization name is required"
              error={errors.orgName}
              name="orgName"
              register={register}
              rules={{
                maxLength: {
                  value: 150,
                  message: 'Organization name cannot exceed 150 characters',
                },
              }}
              onChange={(e) => {
                if (!isSlugManuallyEdited) {
                  const autoSlug = orgNameToSlug(e.target.value)
                  setValue('orgSlug', autoSlug, { shouldValidate: true })
                }
              }}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Organization Slug"
                placeholder="e.g. bluehaven-maintenance"
                helperText="Optional URL identifier (lowercase letters, numbers, hyphens)"
                error={errors.orgSlug}
                name="orgSlug"
                register={register}
                rules={{
                  maxLength: {
                    value: 100,
                    message: 'Slug cannot exceed 100 characters',
                  },
                  validate: (value) => {
                    const trimmed = value?.trim() || ''
                    if (trimmed && !SLUG_REGEX.test(trimmed)) {
                      return 'Slug can contain only lowercase letters, numbers, and hyphens'
                    }
                    return true
                  },
                }}
                onChange={() => setIsSlugManuallyEdited(true)}
              />

              <Select
                label="Currency"
                options={COMMON_CURRENCIES}
                helperText="Operational billing & reporting currency"
                error={errors.currency}
                name="currency"
                register={register}
                rules={{
                  validate: (value) => {
                    const trimmed = value?.trim() || ''
                    if (trimmed && trimmed.length !== 3) {
                      return 'Currency must be a 3-character code (e.g. AUD)'
                    }
                    return true
                  },
                }}
              />
            </div>

            <Select
              label="Timezone"
              options={COMMON_TIMEZONES}
              helperText="Default timezone for scheduling and activity logs"
              error={errors.timezone}
              name="timezone"
              register={register}
            />
          </div>
        </div>

        {/* Section 2: Administrator Information */}
        <div>
          <div className="mb-3 border-b border-slate-200 pb-2">
            <h2 className="text-sm font-semibold tracking-tight text-slate-900">
              Administrator Account
            </h2>
            <p className="text-xs text-slate-500">
              This will be the primary administrator user for your organization.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="First Name"
                autoComplete="given-name"
                placeholder="Sofia"
                required="First name is required"
                error={errors.firstName}
                name="firstName"
                register={register}
                rules={{
                  maxLength: {
                    value: 100,
                    message: 'First name cannot exceed 100 characters',
                  },
                }}
              />

              <Input
                label="Last Name"
                autoComplete="family-name"
                placeholder="Bennett"
                required="Last name is required"
                error={errors.lastName}
                name="lastName"
                register={register}
                rules={{
                  maxLength: {
                    value: 100,
                    message: 'Last name cannot exceed 100 characters',
                  },
                }}
              />
            </div>

            <Input
              label="Work Email"
              type="email"
              autoComplete="email"
              placeholder="sofia.bennett@company.com"
              required="Email is required"
              error={errors.email}
              name="email"
              register={register}
              rules={{
                maxLength: {
                  value: 255,
                  message: 'Email cannot exceed 255 characters',
                },
                pattern: {
                  value: EMAIL_REGEX,
                  message: 'Please provide a valid email address',
                },
              }}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <PasswordInput
                label="Password"
                autoComplete="new-password"
                placeholder="••••••••"
                required="Password is required"
                error={errors.password}
                name="password"
                register={register}
                rules={{
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                  maxLength: {
                    value: 64,
                    message: 'Password cannot exceed 64 characters',
                  },
                  validate: (value) => {
                    const hasUpper = /[A-Z]/.test(value)
                    const hasLower = /[a-z]/.test(value)
                    const hasNumber = /[0-9]/.test(value)
                    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(value)

                    if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
                      return 'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character'
                    }
                    return true
                  },
                }}
                onChange={() => {
                  if (getValues('confirmPassword')) {
                    trigger('confirmPassword')
                  }
                }}
              />

              <PasswordInput
                label="Confirm Password"
                autoComplete="new-password"
                placeholder="••••••••"
                required="Please confirm your password"
                error={errors.confirmPassword}
                name="confirmPassword"
                register={register}
                rules={{
                  validate: (value) => {
                    if (value !== getValues('password')) {
                      return 'Passwords do not match'
                    }
                    return true
                  },
                }}
              />
            </div>

            <p className="text-xs text-slate-500">
              Must be at least 8 characters with at least 1 uppercase, 1 lowercase, 1 number, and 1 special character.
            </p>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            isLoading={isSubmitting}
          >
            Create Organization &amp; Account
          </Button>
        </div>
      </form>
    </AuthLayout>
  )
}
