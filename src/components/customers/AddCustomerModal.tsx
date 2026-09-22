import {useForm} from 'react-hook-form'
import toast from 'react-hot-toast'
import {HttpStatusCode} from 'axios'
import {Button} from '../ui/Button'
import {Input} from '../ui/Input'
import {Select} from '../ui/Select'
import {CloseIcon} from '../icons'
import type {CreateCustomerDto, Customer} from '../../types/customer'
import {EMAIL_REGEX, PHONE_REGEX} from '../../constants/auth'
import customerService from '../../services/customerService'

interface AddCustomerModalProps {
  isOpen: boolean
  onClose: () => void
  addCustomer: (customer: Customer) => void
}

const CUSTOMER_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active Contract' },
  { value: 'PENDING', label: 'Pending Verification' },
  { value: 'INACTIVE', label: 'Inactive' },
]

export function AddCustomerModal({ isOpen, onClose, addCustomer }: AddCustomerModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateCustomerDto>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      externalReference: '',
      status: 'ACTIVE',
    },
  });

  const handleClose = () => {
    reset()
    onClose()
  }

  if (!isOpen) return null

  const onSubmit = async (data: CreateCustomerDto) => {
    try {
      const response = await customerService.addCustomer({
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        externalReference: data.externalReference?.trim() || undefined,
        status: data.status,
      })

      if (response.success && response.payload) {
        toast.success('Customer added successfully')
        addCustomer(response.payload)
        handleClose()
        return
      }

      if (
        response.status === HttpStatusCode.Conflict ||
        response.error?.code === 'USER_ALREADY_EXISTS' ||
        response.error?.code === 'CUSTOMER_ALREADY_EXISTS'
      ) {
        setError('email', { message: 'Email is already registered' })
        toast.error('Customer already exists with email')
        return
      }

      toast.error(response.error?.message || 'Failed to add customer')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred while adding customer')
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
            <h3 className="text-lg font-bold text-slate-900">Add New Customer Account</h3>
            <p className="text-xs text-slate-500">Register facility, commercial client, or property account</p>
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
          <Input
            label="Organization / Company Name"
            placeholder="e.g. Horizon Logistics Center"
            required="Customer name is required"
            error={errors.name}
            name="name"
            register={register}
            rules={{
              maxLength: {
                value: 150,
                message: 'Name cannot exceed 150 characters',
              },
            }}
          />

          <Input
            label="Contact Email"
            type="email"
            placeholder="contact@client.com"
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="External Reference (optional)"
              placeholder="e.g. EXT-1001"
              error={errors.externalReference}
              name="externalReference"
              register={register}
              rules={{
                maxLength: {
                  value: 100,
                  message: 'External reference cannot exceed 100 characters',
                },
              }}
            />

            <Select
              label="Account Status"
              required="Status is required"
              error={errors.status}
              name="status"
              register={register}
              options={CUSTOMER_STATUS_OPTIONS}
            />
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <Button variant="outline" size="md" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" isLoading={isSubmitting}>
              Create Customer
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddCustomerModal
