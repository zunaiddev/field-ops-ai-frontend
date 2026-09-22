import {useForm} from 'react-hook-form'
import toast from 'react-hot-toast'
import {HttpStatusCode} from 'axios'
import {Button} from '../ui/Button'
import {Input} from '../ui/Input'
import {PasswordInput} from '../ui/PasswordInput'
import {Select} from '../ui/Select'
import {CloseIcon} from '../icons'
import type {AddMemberDto, Employee} from '../../types/organization'
import {ADD_MEMBER_ROLE_OPTIONS} from '../../constants/employee'
import {EMAIL_REGEX, PHONE_REGEX} from '../../constants/auth'
import dashboardService from '../../services/dashboardService'

interface AddEmployeeModalProps {
  isOpen: boolean
  onClose: () => void
  addEmployee: (employee: Employee) => void
}

export function AddEmployeeModal({ isOpen, onClose, addEmployee }: AddEmployeeModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AddMemberDto>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      role: 'TECHNICIAN',
    },
  });

  const handleClose = () => {
    reset()
    onClose()
  }

  if (!isOpen) return null

  const onSubmit = async (data: AddMemberDto) => {
    try {
      const response = await dashboardService.addMember({
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim(),
        phone: data.phone?.trim() || undefined,
        password: data.password,
        role: data.role,
      })

      if (response.success && response.payload) {
        toast.success('Member added successfully')
        addEmployee(response.payload)
        handleClose()
        return
      }

      if (response.status === HttpStatusCode.Conflict) {
        setError('email', { message: 'User already exists with email' })
        return
      }

      toast.error(response.error?.message || 'Failed to add member')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred while adding member')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={handleClose}
      />

      <div className="relative z-10 w-full max-w-lg transform overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-xl transition-all animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Add New Team Member</h3>
            <p className="text-xs text-slate-500">Provide staff credentials and operational role assignment</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4" noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="First Name"
              placeholder="e.g. Liam"
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
              placeholder="e.g. Vance"
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
            label="Work Email Address"
            type="email"
            placeholder="colleague@company.com"
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

          <Input
            label="Phone Number"
            type="tel"
            placeholder="e.g. +91 98765 43210"
            required="Phone number is required"
            error={errors.phone}
            name="phone"
            register={register}
            rules={{
              validate: (value) => {
                const trimmed = (value || '').trim()
                if (!trimmed) {
                  return 'Phone number is required'
                }
                const digitsOnly = trimmed.replace(/\D/g, '')
                if (!PHONE_REGEX.test(trimmed) || digitsOnly.length < 7 || digitsOnly.length > 15) {
                  return 'Please provide a valid phone number'
                }
                return true
              },
            }}
          />

          <PasswordInput
            label="Initial Password"
            placeholder="••••••••"
            required="Password is required"
            error={errors.password}
            helperText="Must be at least 8 chars with uppercase, lowercase, number & symbol"
            name="password"
            register={register}
            rules={{
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters long',
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
          />

          <div>
            <Select
              label="Organization Role"
              error={errors.role}
              name="role"
              register={register}
              rules={{
                validate: (value) => {
                  if (!value || value === 'ORG_OWNER') {
                    return 'Role cannot be owner'
                  }
                  return true
                },
              }}
              options={[...ADD_MEMBER_ROLE_OPTIONS]}
            />
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <Button variant="outline" size="md" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" isLoading={isSubmitting}>
              Save Member
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddEmployeeModal
