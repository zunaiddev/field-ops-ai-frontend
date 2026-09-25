import { useEffect, useMemo, useState, type FC } from 'react'
import toast from 'react-hot-toast'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { useCurrentUser } from '../context/UserContext'
import { EMPLOYEE_ROLE_OPTIONS } from '../constants/employee'
import customerPortalService from '../services/customerPortalService'
import organizationService from '../services/organizationService'
import AddressManagement from '../components/customer/AddressManagement'
import type { CurrentUser } from '../types/app'
import type { UpdateOrganizationDto } from '../types/organization'

const TIMEZONE_OPTIONS = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'America/New_York (Eastern Time)' },
  { value: 'America/Chicago', label: 'America/Chicago (Central Time)' },
  { value: 'America/Denver', label: 'America/Denver (Mountain Time)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (Pacific Time)' },
  { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Europe/Berlin (CET/CEST)' },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST +5:30)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST +4:00)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT +8:00)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST +9:00)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST/AEDT)' },
]

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD ($) - US Dollar' },
  { value: 'EUR', label: 'EUR (€) - Euro' },
  { value: 'GBP', label: 'GBP (£) - British Pound' },
  { value: 'INR', label: 'INR (₹) - Indian Rupee' },
  { value: 'AUD', label: 'AUD ($) - Australian Dollar' },
  { value: 'CAD', label: 'CAD ($) - Canadian Dollar' },
  { value: 'SGD', label: 'SGD ($) - Singapore Dollar' },
  { value: 'JPY', label: 'JPY (¥) - Japanese Yen' },
  { value: 'AED', label: 'AED (د.إ) - UAE Dirham' },
]

export const Settings: FC = () => {
  const { currentUser, setCurrentUser } = useCurrentUser()
  const isCustomer = currentUser.role === 'CUSTOMER'

  // Permission: only OWNER and ADMIN can update organization
  const canManageOrg =
    currentUser.role === 'ORG_OWNER' ||
    currentUser.role === 'ORG_ADMIN' ||
    currentUser.role === 'OWNER' ||
    currentUser.role === 'ADMIN'

  // Customer Profile State
  const [customerName, setCustomerName] = useState(currentUser.name || '')
  const [customerPhone, setCustomerPhone] = useState(currentUser.phone || '')
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({})

  // Organization Settings State
  const [orgName, setOrgName] = useState(currentUser.organizationName || '')
  const [orgSlug, setOrgSlug] = useState(currentUser.organizationSlug || '')
  const [orgTimezone, setOrgTimezone] = useState(currentUser.timezone || 'UTC')
  const [orgCurrency, setOrgCurrency] = useState(currentUser.currency || 'USD')
  const [isUpdatingOrg, setIsUpdatingOrg] = useState(false)
  const [orgErrors, setOrgErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (currentUser) {
      setOrgName(currentUser.organizationName || '')
      setOrgSlug(currentUser.organizationSlug || '')
      setOrgTimezone(currentUser.timezone || 'UTC')
      setOrgCurrency(currentUser.currency || 'USD')
    }
  }, [
    currentUser.organizationName,
    currentUser.organizationSlug,
    currentUser.timezone,
    currentUser.currency,
  ])

  const timezoneOptions = useMemo(() => {
    const list = [...TIMEZONE_OPTIONS]
    if (currentUser.timezone && !list.some((o) => o.value === currentUser.timezone)) {
      list.unshift({ value: currentUser.timezone, label: currentUser.timezone })
    }
    return list
  }, [currentUser.timezone])

  const currencyOptions = useMemo(() => {
    const list = [...CURRENCY_OPTIONS]
    if (currentUser.currency && !list.some((o) => o.value === currentUser.currency)) {
      list.unshift({ value: currentUser.currency, label: currentUser.currency })
    }
    return list
  }, [currentUser.currency])

  const handleUpdateCustomerProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    const errors: Record<string, string> = {}
    if (!customerName.trim()) {
      errors.name = 'Full name is required'
    } else if (customerName.trim().length > 150) {
      errors.name = 'Name cannot exceed 150 characters'
    }

    if (customerPhone && customerPhone.trim().length > 30) {
      errors.phone = 'Phone number cannot exceed 30 characters'
    }

    setProfileErrors(errors)
    if (Object.keys(errors).length > 0) return

    setIsUpdatingProfile(true)
    const res = await customerPortalService.updateProfile({
      name: customerName.trim(),
      phone: customerPhone.trim() || undefined,
    })

    if (res.success && res.payload) {
      const updatedProfile = res.payload
      setCurrentUser((prev) => {
        const next = {
          ...prev,
          name: updatedProfile.name,
          phone: updatedProfile.phone ?? null,
        }
        localStorage.setItem('user', JSON.stringify(next))
        return next
      })
      toast.success('Profile updated successfully!')
    } else {
      toast.error(res.error?.message || 'Failed to update profile')
    }
    setIsUpdatingProfile(false)
  }

  const validateOrgForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (orgName.trim() && orgName.trim().length > 150) {
      errors.name = 'Organization name cannot exceed 150 characters'
    }

    if (orgSlug.trim()) {
      const slugRegex = /^[a-z0-9-]+$/
      if (!slugRegex.test(orgSlug.trim())) {
        errors.slug = 'Slug must be lowercase alphanumeric characters and hyphens only (e.g., acme-corp)'
      }
    }

    if (orgCurrency.trim() && orgCurrency.trim().length !== 3) {
      errors.currency = 'Currency must be an exact 3-character ISO 4217 code (e.g., USD, EUR)'
    }

    setOrgErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleUpdateOrganization = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!canManageOrg) {
      toast.error('Only Organization Owners and Admins have permission to update organization settings.')
      return
    }

    if (!validateOrgForm()) return

    setIsUpdatingOrg(true)
    const payload: UpdateOrganizationDto = {}
    if (orgName.trim()) payload.name = orgName.trim()
    if (orgSlug.trim()) payload.slug = orgSlug.trim().toLowerCase()
    if (orgTimezone) payload.timezone = orgTimezone
    if (orgCurrency.trim()) payload.currency = orgCurrency.trim().toUpperCase()

    const res = await organizationService.updateCurrentOrganization(payload)

    if (res.success && res.payload) {
      const updatedOrg = res.payload
      toast.success('Organization updated successfully!')

      setCurrentUser((prev) => {
        const updated: CurrentUser = {
          ...prev,
          organizationName: updatedOrg.name,
          organizationSlug: updatedOrg.slug,
          timezone: updatedOrg.timezone,
          currency: updatedOrg.currency,
          ...(updatedOrg.user
            ? {
                name:
                  `${updatedOrg.user.firstName || ''} ${updatedOrg.user.lastName || ''}`.trim() ||
                  prev.name,
                firstName: updatedOrg.user.firstName || prev.firstName,
                lastName: updatedOrg.user.lastName || prev.lastName,
                email: updatedOrg.user.email || prev.email,
                phone: updatedOrg.user.phone ?? prev.phone,
                role: (updatedOrg.user.role as CurrentUser['role']) || prev.role,
              }
            : {}),
        }
        localStorage.setItem('user', JSON.stringify(updated))
        return updated
      })
    } else {
      const errCode = res.error?.errorCode
      const errMsg = res.error?.message || 'Failed to update organization'
      if (errCode === 'SLUG_ALREADY_EXISTS' || errMsg.toLowerCase().includes('slug already exists')) {
        setOrgErrors((prev) => ({
          ...prev,
          slug: 'This slug is already taken. Please choose another unique slug.',
        }))
        toast.error('Slug already exists. Please choose another unique slug.')
      } else if (res.status === 403) {
        toast.error('Forbidden: You must be an ORG_OWNER or ORG_ADMIN to update organization.')
      } else {
        toast.error(errMsg)
      }
    }
    setIsUpdatingOrg(false)
  }

  // If customer, show ONLY Profile Update (Name & Phone) + Address Management
  if (isCustomer) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Account Settings
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Manage your personal profile details and saved service addresses.
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Information: Update Name and Phone ONLY */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
              Personal Profile
            </h2>

            <form onSubmit={handleUpdateCustomerProfile} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Full Name *"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  error={profileErrors.name}
                  placeholder="e.g. Ricky Martin"
                />
                <Input
                  label="Phone Number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  error={profileErrors.phone}
                  placeholder="e.g. +1 555-0199 or 9876543210"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Email Address"
                  value={currentUser.email}
                  disabled
                  helperText="Email address cannot be changed."
                />
                <Input
                  label="Service Provider / Organization"
                  value={currentUser.organizationName}
                  disabled
                  helperText="Associated service organization."
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isUpdatingProfile}
                >
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </div>

          {/* Customer Address Management */}
          <AddressManagement />
        </div>
      </div>
    )
  }

  // Employee / Admin Settings View
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          Account & Organization Settings
        </h1>
        <p className="mt-1 text-xs text-slate-500 sm:text-sm">
          Manage your organization profile, field operations preferences, and user credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* User Profile Information (Left Column) */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-semibold text-slate-900">
                User Profile
              </h2>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-600/20">
                {currentUser.role}
              </span>
            </div>

            <div className="mt-4 space-y-4">
              <Input label="Full Name" defaultValue={currentUser.name} disabled />
              <Input label="Email Address" defaultValue={currentUser.email} type="email" disabled />

              <Select
                label="Role Assignment"
                value={currentUser.role}
                disabled
                options={EMPLOYEE_ROLE_OPTIONS.map((opt) => ({
                  value: opt.value,
                  label: opt.label,
                }))}
              />

              {currentUser.employeeId && (
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Employee ID" defaultValue={currentUser.employeeId} disabled />
                  <Input label="Status" defaultValue={currentUser.status || 'ACTIVE'} disabled />
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-slate-50 p-3.5 text-xs text-slate-600 ring-1 ring-slate-200/70">
            <p className="font-semibold text-slate-800">Account Credentials</p>
            <p className="mt-1">
              User identity and assigned system privileges are governed by organization administrators.
            </p>
          </div>
        </div>

        {/* Organization Settings Card (Right Column - Span 2) */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs lg:col-span-2">
          <div className="flex flex-col gap-2 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Organization Details
              </h2>
              <p className="text-xs text-slate-500">
                Configure your organization profile, URL slug, and regional operations telemetry.
              </p>
            </div>
            {canManageOrg ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/20 self-start sm:self-auto">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                Admin Access
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-600/20 self-start sm:self-auto">
                Read-Only (Requires OWNER / ADMIN)
              </span>
            )}
          </div>

          {!canManageOrg && (
            <div className="mt-4 rounded-lg bg-amber-50/70 p-3.5 text-xs text-amber-900 ring-1 ring-amber-700/10 flex items-start gap-2.5">
              <svg
                className="h-4 w-4 shrink-0 text-amber-600 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <p className="font-semibold">Restricted Settings</p>
                <p className="mt-0.5 text-amber-800">
                  You are signed in as <strong>{currentUser.role}</strong>. Only users with{' '}
                  <strong>ORG_OWNER</strong> or <strong>ORG_ADMIN</strong> roles can update organization settings.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleUpdateOrganization} className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Organization Name"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                error={orgErrors.name}
                disabled={!canManageOrg || isUpdatingOrg}
                placeholder="e.g. Acme Corporation"
                helperText="Max 150 characters"
              />
              <Input
                label="Organization Slug"
                value={orgSlug}
                onChange={(e) => setOrgSlug(e.target.value.toLowerCase())}
                error={orgErrors.slug}
                disabled={!canManageOrg || isUpdatingOrg}
                placeholder="e.g. acme-corp"
                helperText="Lowercase alphanumeric & hyphens only (/^[a-z0-9-]+$/)"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                label="Default Timezone"
                value={orgTimezone}
                onChange={(e) => setOrgTimezone(e.target.value)}
                disabled={!canManageOrg || isUpdatingOrg}
                options={timezoneOptions}
              />
              <Select
                label="Currency (ISO 4217)"
                value={orgCurrency}
                onChange={(e) => setOrgCurrency(e.target.value)}
                disabled={!canManageOrg || isUpdatingOrg}
                options={currencyOptions}
              />
            </div>

            {canManageOrg && (
              <div className="flex justify-end pt-3 border-t border-slate-100">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isUpdatingOrg}
                >
                  Save Organization Changes
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

export default Settings
