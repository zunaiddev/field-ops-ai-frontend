import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { HttpStatusCode } from 'axios'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { PasswordInput } from '../ui/PasswordInput'
import { Select } from '../ui/Select'
import { CloseIcon } from '../icons'
import type { Employee, UpdateMemberDto } from '../../types/organization'
import {
  ADD_MEMBER_ROLE_OPTIONS,
  EMPLOYEE_ROLE_OPTIONS,
  EMPLOYEE_STATUS_OPTIONS,
} from '../../constants/employee'
import { EMAIL_REGEX, PHONE_REGEX } from '../../constants/auth'
import dashboardService from '../../services/dashboardService'

interface EditEmployeeFormValues {
  firstName: string
  lastName: string
  email: string
  phone: string
  password?: string
  role: string
  status: string
}

interface EditEmployeeModalProps {
  isOpen: boolean
  employee: Employee | null
  onClose: () => void
  updateEmployee: (employee: Employee) => void
}

export function EditEmployeeModal({
  isOpen,
  employee,
  onClose,
  updateEmployee,
}: EditEmployeeModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EditEmployeeFormValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      role: 'TECHNICIAN',
      status: 'ACTIVE',
    },
  })

  useEffect(() => {
    if (employee && isOpen) {
      reset({
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        email: employee.email || '',
        phone: employee.phone || '',
        password: '',
        role: employee.role || 'TECHNICIAN',
        status: employee.status || 'ACTIVE',
      })
    }
  }, [employee, isOpen, reset])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleClose = () => {
    reset()
    onClose()
  }

  if (!isOpen || !employee) return null

  const isOwner = employee.role === 'ORG_OWNER' || employee.role === 'OWNER'

  const roleOptions = isOwner
    ? [...EMPLOYEE_ROLE_OPTIONS]
    : [...ADD_MEMBER_ROLE_OPTIONS]

  const onSubmit = async (data: EditEmployeeFormValues) => {
    const updatePayload: UpdateMemberDto = {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      role: data.role,
      status: data.status,
      ...(data.password ? { password: data.password } : {}),
    }

    try {
      const response = await dashboardService.updateMember(employee.id, updatePayload)

      if (response.success && response.payload) {
        toast.success('Member updated successfully')
        updateEmployee(response.payload)
        handleClose()
        return
      }

      if (response.status === HttpStatusCode.Conflict || response.error?.code === 'USER_ALREADY_EXISTS') {
        setError('email', { message: 'Email is already registered' })
        toast.error('User already exists with email')
        return
      }

      toast.error(response.error?.message || 'Failed to update member')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred while updating member')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={handleClose}
      />

      <div className="relative z-10 w-full max-w-lg transform overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-xl transition-all animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Edit Member Details</h3>
            <p className="text-xs text-slate-500">Update staff information, status, and role credentials</p>
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
            label="Email Address"
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
            label="Reset Password (optional)"
            placeholder="Leave blank to keep unchanged"
            error={errors.password}
            helperText="8+ chars with uppercase, lowercase, number & symbol"
            name="password"
            register={register}
            rules={{
              validate: (value) => {
                if (!value) return true
                if (value.length < 8) {
                  return 'Password must be at least 8 characters long'
                }
                if (value.length > 64) {
                  return 'Password cannot exceed 64 characters'
                }
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Role"
              required="Role is required"
              error={errors.role}
              name="role"
              register={register}
              rules={{
                validate: (value) => {
                  if (!isOwner && value === 'ORG_OWNER') {
                    return 'Role cannot be owner'
                  }
                  return true
                },
              }}
              options={roleOptions}
            />

            <Select
              label="Status"
              required="Status is required"
              error={errors.status}
              name="status"
              register={register}
              options={[...EMPLOYEE_STATUS_OPTIONS]}
            />
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <Button variant="outline" size="md" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" isLoading={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditEmployeeModal
