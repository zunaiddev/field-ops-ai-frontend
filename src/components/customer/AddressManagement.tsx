import { useEffect, useState, type FC } from 'react'
import toast from 'react-hot-toast'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Checkbox } from '../ui/Checkbox'
import { MapPinIcon, PencilIcon, PlusIcon, TrashIcon } from '../icons'
import customerPortalService from '../../services/customerPortalService'
import { useAlertModal } from '../../context/AlertModalContext'
import type {
  CreateCustomerAddressDto,
  CustomerAddress,
  UpdateCustomerAddressDto,
} from '../../types/publicCustomer'

export const AddressManagement: FC = () => {
  const { showConfirm } = useAlertModal()
  const [addresses, setAddresses] = useState<CustomerAddress[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // Form State
  const [addressLine1, setAddressLine1] = useState('')
  const [addressLine2, setAddressLine2] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [country, setCountry] = useState('')
  const [isPrimary, setIsPrimary] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const fetchAddresses = async () => {
    setLoading(true)
    const res = await customerPortalService.getAddresses()
    if (res.success && res.payload) {
      setAddresses(res.payload)
    } else {
      toast.error(res.error?.message || 'Failed to load addresses')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAddresses()
  }, [])

  const resetForm = () => {
    setAddressLine1('')
    setAddressLine2('')
    setCity('')
    setState('')
    setPostalCode('')
    setCountry('')
    setIsPrimary(false)
    setFormErrors({})
    setEditingAddress(null)
  }

  const handleOpenAddModal = () => {
    resetForm()
    // If it's the first address, default to primary
    if (addresses.length === 0) {
      setIsPrimary(true)
    }
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (addr: CustomerAddress) => {
    setEditingAddress(addr)
    setAddressLine1(addr.addressLine1)
    setAddressLine2(addr.addressLine2 || '')
    setCity(addr.city)
    setState(addr.state)
    setPostalCode(addr.postalCode)
    setCountry(addr.country)
    setIsPrimary(addr.isPrimary)
    setFormErrors({})
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    resetForm()
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    if (!addressLine1.trim()) errors.addressLine1 = 'Address Line 1 is required'
    if (!city.trim()) errors.city = 'City is required'
    if (!state.trim()) errors.state = 'State / Province is required'
    if (!postalCode.trim()) errors.postalCode = 'Postal code is required'
    if (!country.trim()) errors.country = 'Country is required'

    if (addressLine1.trim().length > 100) errors.addressLine1 = 'Max 100 characters allowed'
    if (addressLine2.trim().length > 100) errors.addressLine2 = 'Max 100 characters allowed'
    if (city.trim().length > 100) errors.city = 'Max 100 characters allowed'
    if (state.trim().length > 100) errors.state = 'Max 100 characters allowed'
    if (postalCode.trim().length > 20) errors.postalCode = 'Max 20 characters allowed'
    if (country.trim().length > 100) errors.country = 'Max 100 characters allowed'

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setSubmitting(true)
    if (editingAddress) {
      const payload: UpdateCustomerAddressDto = {
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim() || undefined,
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
        country: country.trim(),
        isPrimary,
      }
      const res = await customerPortalService.updateAddress(editingAddress.id, payload)
      if (res.success) {
        toast.success('Address updated successfully!')
        handleCloseModal()
        fetchAddresses()
      } else {
        toast.error(res.error?.message || 'Failed to update address')
      }
    } else {
      const payload: CreateCustomerAddressDto = {
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim() || undefined,
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
        country: country.trim(),
        isPrimary,
      }
      const res = await customerPortalService.addAddress(payload)
      if (res.success) {
        toast.success('Address added successfully!')
        handleCloseModal()
        fetchAddresses()
      } else {
        toast.error(res.error?.message || 'Failed to add address')
      }
    }
    setSubmitting(false)
  }

  const handleDeleteAddress = async (id: number) => {
    const confirmed = await showConfirm({
      title: 'Delete Address',
      message: 'Are you sure you want to delete this address? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    })
    if (!confirmed) return

    setDeletingId(id)
    const res = await customerPortalService.deleteAddress(id)
    if (res.success) {
      toast.success('Address deleted successfully!')
      setAddresses((prev) => prev.filter((a) => a.id !== id))
    } else {
      toast.error(res.error?.message || 'Failed to delete address')
    }
    setDeletingId(null)
  }

  const handleSetPrimary = async (addr: CustomerAddress) => {
    if (addr.isPrimary) return
    const res = await customerPortalService.updateAddress(addr.id, { isPrimary: true })
    if (res.success) {
      toast.success('Primary address updated!')
      fetchAddresses()
    } else {
      toast.error(res.error?.message || 'Failed to set primary address')
    }
  }

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Address Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your service locations for technician visits and dispatch requests.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<PlusIcon className="h-4 w-4" />}
          onClick={handleOpenAddModal}
        >
          Add Address
        </Button>
      </div>

      {loading ? (
        <div className="flex min-h-40 items-center justify-center py-8">
          <svg
            className="h-6 w-6 animate-spin text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="ml-2 text-xs font-medium text-slate-500">Loading addresses...</span>
        </div>
      ) : addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 p-8 text-center my-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 mb-3">
            <MapPinIcon className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">No addresses saved</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            You have not registered any service addresses yet. Add an address so service requests can be dispatched accurately.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            leftIcon={<PlusIcon className="h-4 w-4" />}
            onClick={handleOpenAddModal}
          >
            Add Address
          </Button>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`relative flex flex-col justify-between rounded-xl border p-4 transition-all ${
                addr.isPrimary
                  ? 'border-blue-300 bg-blue-50/30 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <MapPinIcon
                      className={`h-4 w-4 shrink-0 ${
                        addr.isPrimary ? 'text-blue-600' : 'text-slate-400'
                      }`}
                    />
                    <span className="text-xs font-semibold text-slate-900">
                      {addr.addressLine1}
                    </span>
                  </div>
                  {addr.isPrimary && (
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                      Primary
                    </span>
                  )}
                </div>

                {addr.addressLine2 && (
                  <p className="mt-1 text-xs text-slate-600 pl-5.5">{addr.addressLine2}</p>
                )}

                <p className="mt-1 text-xs text-slate-500 pl-5.5">
                  {addr.city}, {addr.state} {addr.postalCode}
                </p>
                <p className="text-xs text-slate-500 pl-5.5">{addr.country}</p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                {!addr.isPrimary ? (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(addr)}
                    className="font-medium text-slate-500 hover:text-blue-600 cursor-pointer"
                  >
                    Set as Primary
                  </button>
                ) : (
                  <span className="text-slate-400 text-[11px]">Default Address</span>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(addr)}
                    className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                    title="Edit Address"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteAddress(addr.id)}
                    disabled={deletingId === addr.id}
                    className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer disabled:opacity-50"
                    title="Delete Address"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Address Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </h3>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <Input
                  label="Address Line 1 *"
                  placeholder="e.g. 102 Silver Oak Residency"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  error={formErrors.addressLine1}
                />
              </div>

              <div>
                <Input
                  label="Address Line 2 (Optional)"
                  placeholder="e.g. Apartment, Suite, Floor"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  error={formErrors.addressLine2}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input
                  label="City *"
                  placeholder="e.g. Bengaluru"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  error={formErrors.city}
                />
                <Input
                  label="State / Province *"
                  placeholder="e.g. Karnataka"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  error={formErrors.state}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input
                  label="Postal Code *"
                  placeholder="e.g. 560095"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  error={formErrors.postalCode}
                />
                <Input
                  label="Country *"
                  placeholder="e.g. India"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  error={formErrors.country}
                />
              </div>

              <div className="pt-1">
                <Checkbox
                  id="primaryAddressCheckbox"
                  label="Set as primary service address"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={handleCloseModal}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={submitting}
                >
                  {editingAddress ? 'Update Address' : 'Save Address'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AddressManagement
