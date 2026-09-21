import type { FC } from 'react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { useCurrentUser } from '../context/UserContext'

export const Settings: FC = () => {
  const { currentUser } = useCurrentUser()

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
        {/* Profile Details */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs lg:col-span-2">
          <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
            Profile Information
          </h2>

          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Full Name" defaultValue={currentUser.name} />
              <Input label="Email Address" defaultValue={currentUser.email} type="email" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Organization" defaultValue={currentUser.organizationName} disabled />
              <Select
                label="Role Assignment"
                value={currentUser.role}
                disabled
                options={[
                  { value: 'OWNER', label: 'Owner' },
                  { value: 'ADMIN', label: 'Administrator' },
                  { value: 'MANAGER', label: 'Field Ops Manager' },
                  { value: 'EMPLOYEE', label: 'Field Employee' },
                ]}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="primary" size="md">
                Save Changes
              </Button>
            </div>
          </div>
        </div>

        {/* Operational Preferences */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs lg:col-span-1">
          <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
            Regional Telemetry
          </h2>

          <div className="mt-4 space-y-4">
            <Select
              label="Default Timezone"
              defaultValue="America/New_York"
              options={[
                { value: 'America/New_York', label: 'Eastern Time (US/Eastern)' },
                { value: 'America/Chicago', label: 'Central Time (US/Central)' },
                { value: 'America/Denver', label: 'Mountain Time (US/Mountain)' },
                { value: 'America/Los_Angeles', label: 'Pacific Time (US/Pacific)' },
              ]}
            />

            <Select
              label="Currency"
              defaultValue="USD"
              options={[
                { value: 'USD', label: 'USD ($) - US Dollar' },
                { value: 'EUR', label: 'EUR (€) - Euro' },
                { value: 'GBP', label: 'GBP (£) - British Pound' },
                { value: 'CAD', label: 'CAD ($) - Canadian Dollar' },
              ]}
            />

            <div className="rounded-lg bg-blue-50/70 p-3.5 text-xs text-blue-900 ring-1 ring-blue-700/10">
              <p className="font-semibold">Role-based Access Control Active</p>
              <p className="mt-1 text-blue-800">
                You are currently previewing permissions as <strong>{currentUser.role}</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
