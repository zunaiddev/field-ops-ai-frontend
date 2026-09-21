import {type FC, useEffect, useState} from 'react'
import {Button} from '../ui/Button'
import {Input} from '../ui/Input'
import {PasswordInput} from '../ui/PasswordInput'
import {Select} from '../ui/Select'
import {CloseIcon} from '../icons'
import type {AddMemberDto} from '../../types/organization'
import {ADD_MEMBER_ROLE_OPTIONS} from '../../constants/employee'
import {EMAIL_REGEX} from '../../constants/auth'

interface AddEmployeeModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (newEmployee: AddMemberDto) => Promise<boolean | void> | void
}

export const AddEmployeeModal: FC<AddEmployeeModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<string>('TECHNICIAN')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

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

  const resetForm = () => {
    setFirstName('')
    setLastName('')
    setEmail('')
    setPassword('')
    setRole('TECHNICIAN')
    setErrors({})
    setIsSubmitting(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    const cleanFirst = firstName.trim()
    if (!cleanFirst) {
      newErrors.firstName = 'First name is required'
    } else if (cleanFirst.length > 100) {
      newErrors.firstName = 'First name cannot exceed 100 characters'
    }

    const cleanLast = lastName.trim()
    if (!cleanLast) {
      newErrors.lastName = 'Last name is required'
    } else if (cleanLast.length > 100) {
      newErrors.lastName = 'Last name cannot exceed 100 characters'
    }

    const cleanEmail = email.trim()
    if (!cleanEmail) {
      newErrors.email = 'Email is required'
    } else if (!EMAIL_REGEX.test(cleanEmail)) {
      newErrors.email = 'Please provide a valid email address'
    } else if (cleanEmail.length > 255) {
      newErrors.email = 'Email cannot exceed 255 characters'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long'
    } else if (password.length > 64) {
      newErrors.password = 'Password cannot exceed 64 characters'
    } else {
      const hasUpper = /[A-Z]/.test(password)
      const hasLower = /[a-z]/.test(password)
      const hasNumber = /[0-9]/.test(password)
      const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password)

      if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
        newErrors.password =
          'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character'
      }
    }

    if (!role || role === 'ORG_OWNER') {
      newErrors.role = 'Role cannot be owner'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const success = await onAdd({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        role,
      })

      if (success) handleClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4" noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="First Name"
              placeholder="e.g. Liam"
              required="First name is required"
              value={firstName}
              error={errors.firstName ? { type: 'manual', message: errors.firstName } : undefined}
              onChange={(e) => {
                setFirstName(e.target.value)
                if (errors.firstName) setErrors((prev) => ({ ...prev, firstName: '' }))
              }}
            />
            <Input
              label="Last Name"
              placeholder="e.g. Vance"
              required="Last name is required"
              value={lastName}
              error={errors.lastName ? { type: 'manual', message: errors.lastName } : undefined}
              onChange={(e) => {
                setLastName(e.target.value)
                if (errors.lastName) setErrors((prev) => ({ ...prev, lastName: '' }))
              }}
            />
          </div>

          <Input
            label="Work Email Address"
            type="email"
            placeholder="colleague@company.com"
            required="Email is required"
            value={email}
            error={errors.email ? { type: 'manual', message: errors.email } : undefined}
            onChange={(e) => {
              setEmail(e.target.value)
              if (errors.email) setErrors((prev) => ({ ...prev, email: '' }))
            }}
          />

          <PasswordInput
            label="Initial Password"
            placeholder="••••••••"
            required="Password is required"
            value={password}
            error={errors.password ? { type: 'manual', message: errors.password } : undefined}
            helperText="Must be at least 8 chars with uppercase, lowercase, number & symbol"
            onChange={(e) => {
              setPassword(e.target.value)
              if (errors.password) setErrors((prev) => ({ ...prev, password: '' }))
            }}
          />

          <div>
            <Select
              label="Organization Role"
              value={role}
              error={errors.role ? { type: 'manual', message: errors.role } : undefined}
              onChange={(e) => {
                setRole(e.target.value)
                if (errors.role) setErrors((prev) => ({ ...prev, role: '' }))
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
