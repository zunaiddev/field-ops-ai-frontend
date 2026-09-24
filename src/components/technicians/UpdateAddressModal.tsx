import { useEffect, type FC } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { CloseIcon, MapPinIcon } from '../icons'
import technicianService from '../../services/technicianService'
import type { TechnicianAddress, UpdateTechnicianAddressDto } from '../../types/technician'

interface UpdateAddressModalProps {
  isOpen: boolean
  technicianId: number | string
  address: TechnicianAddress | null
  addressTypeLabel?: string // e.g. "Home Address" or "Current Address"
  onClose: () => void
  onAddressUpdated: (updatedAddress: TechnicianAddress) => void
}

interface AddressFormFields {
  addressId?: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  postalCode: string
  country: string
  longitude: string
  latitude: string
}

export const UpdateAddressModal: FC<UpdateAddressModalProps> = ({
  isOpen,
  technicianId,
  address,
  addressTypeLabel = 'Current Address',
  onClose,
  onAddressUpdated,
}) => {
  const effectiveAddressId = address?.id || (address as any)?.addressId

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormFields>({
    defaultValues: {
      addressId: effectiveAddressId ? String(effectiveAddressId) : '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      longitude: '',
      latitude: '',
    },
  })

  // Populate form with current address data whenever address changes
  useEffect(() => {
    if (address && isOpen) {
      reset({
        addressId: effectiveAddressId ? String(effectiveAddressId) : '',
        addressLine1: address.addressLine1 || '',
        addressLine2: address.addressLine2 || '',
        city: address.city || '',
        state: address.state || '',
        postalCode: address.postalCode || '',
        country: address.country || 'India',
        longitude:
          address.longitude !== null && address.longitude !== undefined
            ? String(address.longitude)
            : '',
        latitude:
          address.latitude !== null && address.latitude !== undefined
            ? String(address.latitude)
            : '',
      })
    }
  }, [address, effectiveAddressId, isOpen, reset])

  // Escape key listener
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen || !address) return null

  const onSubmit = async (values: AddressFormFields) => {
    const targetId = effectiveAddressId || (values.addressId ? Number(values.addressId) : null)

    if (!targetId) {
      toast.error('Please specify the Address ID to update')
      return
    }

    const payload: UpdateTechnicianAddressDto = {
      addressLine1: values.addressLine1.trim(),
      addressLine2: values.addressLine2.trim() || undefined,
      city: values.city.trim(),
      state: values.state.trim(),
      postalCode: values.postalCode.trim(),
      country: values.country.trim(),
      longitude: values.longitude.trim() || undefined,
      latitude: values.latitude.trim() || undefined,
    }

    try {
      const res = await technicianService.updateTechnicianAddress(
        technicianId,
        targetId,
        payload,
      )

      if (res.success && res.payload) {
        toast.success(`${addressTypeLabel} updated successfully!`)
        onAddressUpdated(res.payload)
        onClose()
        return
      }

      toast.error(res.error?.message || 'Failed to update address')
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'An error occurred while updating address',
      )
    }
  }

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-lg transform overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50/75 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <MapPinIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight text-slate-900">
                  Update {addressTypeLabel}
                </h3>
                {effectiveAddressId && (
                  <span className="font-mono text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                    Address #{effectiveAddressId}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                Updating location details for Technician #{technicianId}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto p-5 space-y-4 flex-1">
            {!effectiveAddressId && (
              <Input
                label="Address ID *"
                placeholder="e.g. 17"
                required="Address ID is required"
                error={errors.addressId}
                name="addressId"
                register={register}
              />
            )}

            <Input
              label="Address Line 1"
              placeholder="e.g. 123 Knowledge Park"
              required="Address Line 1 is required"
              error={errors.addressLine1}
              name="addressLine1"
              register={register}
            />

            <Input
              label="Address Line 2 (Optional)"
              placeholder="e.g. Apt 4B, Sector 2, Landmark"
              name="addressLine2"
              register={register}
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                label="City"
                placeholder="e.g. Greater Noida"
                required="City is required"
                error={errors.city}
                name="city"
                register={register}
              />
              <Input
                label="State"
                placeholder="e.g. Uttar Pradesh"
                required="State is required"
                error={errors.state}
                name="state"
                register={register}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                label="Postal Code"
                placeholder="e.g. 201310"
                required="Postal code is required"
                error={errors.postalCode}
                name="postalCode"
                register={register}
              />
              <Input
                label="Country"
                placeholder="e.g. India"
                required="Country is required"
                error={errors.country}
                name="country"
                register={register}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                label="Longitude (Optional)"
                placeholder="e.g. 77.5040"
                name="longitude"
                register={register}
              />
              <Input
                label="Latitude (Optional)"
                placeholder="e.g. 28.4744"
                name="latitude"
                register={register}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50/75 px-5 py-3.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
            >
              Save Address Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UpdateAddressModal
