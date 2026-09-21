import { useEffect, useState, type FC } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { CloseIcon } from '../icons'
import type { Customer, CustomerStatus } from '../../types/app'

interface AddCustomerModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (newCustomer: Omit<Customer, 'id' | 'totalJobs' | 'lastServiceDate'>) => void
}

export const AddCustomerModal: FC<AddCustomerModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('NY')
  const [zipCode, setZipCode] = useState('')
  const [status, setStatus] = useState<CustomerStatus>('ACTIVE')

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

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !contactPerson || !email) return

    onAdd({
      name,
      contactPerson,
      email,
      phone: phone || '+1 (555) 000-0000',
      address: address || '100 Main St',
      city: city || 'New York',
      state: state || 'NY',
      zipCode: zipCode || '10001',
      status,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-lg transform overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-xl transition-all animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Add New Customer Account</h3>
            <p className="text-xs text-slate-500">Register facility, commercial client, or property account</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <Input
            label="Organization / Company Name"
            placeholder="e.g. Horizon Logistics Center"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Primary Contact Person"
              placeholder="e.g. Claire Davenport"
              required
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
            />
            <Input
              label="Contact Email"
              type="email"
              placeholder="contact@client.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Phone"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Select
              label="Account Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as CustomerStatus)}
              options={[
                { value: 'ACTIVE', label: 'Active Contract' },
                { value: 'PENDING', label: 'Pending Verification' },
                { value: 'INACTIVE', label: 'Inactive' },
              ]}
            />
          </div>

          <Input
            label="Street Address"
            placeholder="e.g. 8800 Industrial Parkway"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Input
                label="City"
                placeholder="Jersey City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div>
              <Input
                label="State"
                placeholder="NJ"
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
            </div>
            <div>
              <Input
                label="Zip Code"
                placeholder="07302"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <Button variant="outline" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit">
              Create Customer
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddCustomerModal
