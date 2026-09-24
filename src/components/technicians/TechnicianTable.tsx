import { useState, type FC } from 'react'
import type { Technician, TechnicianAddress } from '../../types/technician'
import { EyeIcon, MapPinIcon, PencilIcon, TrashIcon, WrenchIcon } from '../icons'

interface TechnicianTableProps {
  technicians: Technician[]
  onViewTechnician: (tech: Technician) => void
  onUpdateAddress?: (tech: Technician, address: TechnicianAddress, label: string) => void
  onAddNewTechnician?: () => void
  onDeleteTechnician?: (tech: Technician) => Promise<void> | void
  onUpdateStatus?: (tech: Technician) => void
}

function formatDate(dateValue: string | Date | null | undefined): string {
  if (!dateValue) return '—'
  try {
    const d = new Date(dateValue)
    if (isNaN(d.getTime())) return '—'
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

export const TechnicianTable: FC<TechnicianTableProps> = ({
  technicians,
  onViewTechnician,
  onUpdateAddress,
  onAddNewTechnician,
  onDeleteTechnician,
  onUpdateStatus,
}) => {
  const [techToDelete, setTechToDelete] = useState<Technician | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirmDelete = async () => {
    if (!techToDelete || !onDeleteTechnician) return
    setIsDeleting(true)
    try {
      await onDeleteTechnician(techToDelete)
      setTechToDelete(null)
    } finally {
      setIsDeleting(false)
    }
  }

  if (technicians.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <WrenchIcon className="h-7 w-7" />
        </div>
        <h3 className="mt-3 text-base font-semibold text-slate-900">No technicians found</h3>
        <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
          No technicians match your search or none have been registered yet. Add employees as technicians to assign jobs and skills.
        </p>
        {onAddNewTechnician && (
          <div className="mt-4">
            <button
              type="button"
              onClick={onAddNewTechnician}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Register Technician
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs">
      {/* Table Delete Confirmation Alert Banner */}
      {techToDelete && (
        <div className="border-b border-rose-200 bg-rose-50 p-4 transition-all animate-in fade-in">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <TrashIcon className="h-4 w-4" />
              </div>
              <div className="text-xs text-rose-900">
                <p className="font-semibold">
                  Are you sure you want to delete &ldquo;
                  {techToDelete.employee
                    ? `${techToDelete.employee.firstName || ''} ${techToDelete.employee.lastName || ''}`.trim() || techToDelete.employee.email
                    : `Technician #${techToDelete.id}`}
                  &rdquo;?
                </p>
                <p className="text-rose-700">This action will remove the technician record and unassign related skills.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTechToDelete(null)}
                disabled={isDeleting}
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th scope="col" className="px-5 py-3.5">
                Technician / Employee
              </th>
              <th scope="col" className="px-4 py-3.5">
                Contact
              </th>
              <th scope="col" className="px-4 py-3.5">
                Status & Availability
              </th>
              <th scope="col" className="px-4 py-3.5">
                Current Address
              </th>
              <th scope="col" className="px-4 py-3.5">
                Registered
              </th>
              <th scope="col" className="px-5 py-3.5 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {technicians.map((tech) => {
              const emp = tech.employee
              const name =
                emp ? `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.email : `Technician #${tech.id}`
              const initials =
                (emp?.firstName?.[0] || emp?.email?.[0] || 'T').toUpperCase()

              const currentAddr =
                tech.currentAddress ||
                (tech as any)?.address ||
                (tech as any)?.dispatchAddress ||
                null
              const activeAddress = currentAddr || tech.homeAddress
              const activeAddressLabel = currentAddr ? 'Current Address' : 'Home Address'

              return (
                <tr
                  key={tech.id}
                  className="hover:bg-slate-50/60 transition-colors group cursor-pointer"
                  onClick={() => onViewTechnician(tech)}
                >
                  {/* Technician & Employee */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs shadow-2xs group-hover:scale-105 transition-transform">
                        {initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {name}
                          </span>
                          <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            #{tech.id}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          {emp?.employeeId !== undefined && emp?.employeeId !== null && (
                            <span className="font-mono text-slate-600 bg-slate-100 px-1 rounded">
                              {String(emp.employeeId)}
                            </span>
                          )}
                          {emp?.role && (
                            <span className="uppercase text-[10px] text-blue-600 font-medium">
                              {emp.role}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="text-slate-800 text-xs">{emp?.email || '—'}</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">{emp?.phone || '—'}</div>
                  </td>

                  {/* Status & Availability with Update Status Button */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            tech.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                              : tech.status === 'SUSPENDED'
                              ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20'
                              : 'bg-slate-100 text-slate-600 ring-1 ring-slate-600/10'
                          }`}
                        >
                          {tech.status}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            tech.availabilityStatus === 'AVAILABLE'
                              ? 'bg-teal-50 text-teal-700 ring-1 ring-teal-600/20'
                              : tech.availabilityStatus === 'ON_JOB'
                              ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20'
                              : tech.availabilityStatus === 'ON_BREAK'
                              ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20'
                              : 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20'
                          }`}
                        >
                          {tech.availabilityStatus}
                        </span>
                      </div>
                      {onUpdateStatus && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onUpdateStatus(tech)
                          }}
                          className="shrink-0 inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 transition-colors cursor-pointer"
                          title="Update Status"
                        >
                          <PencilIcon className="h-3 w-3" />
                          <span>Status</span>
                        </button>
                      )}
                    </div>
                  </td>

                  {/* Current Address with Update Address button */}
                  <td className="px-4 py-3.5 max-w-xs">
                    {activeAddress ? (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-start gap-1.5 text-xs text-slate-600 min-w-0">
                          <MapPinIcon className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="truncate">
                            {activeAddress.city}, {activeAddress.state}
                          </span>
                        </div>
                        {onUpdateAddress && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              onUpdateAddress(tech, activeAddress, activeAddressLabel)
                            }}
                            className="shrink-0 inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 transition-colors cursor-pointer"
                            title="Update Address"
                          >
                            <PencilIcon className="h-3 w-3" />
                            <span>Edit</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <span className="italic text-slate-400 text-xs">No address</span>
                        {onUpdateAddress && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              onUpdateAddress(
                                tech,
                                {
                                  addressLine1: '',
                                  city: '',
                                  state: '',
                                  postalCode: '',
                                  country: 'India',
                                },
                                'Current Address',
                              )
                            }}
                            className="shrink-0 inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                            title="Update Address"
                          >
                            <PencilIcon className="h-3 w-3" />
                            <span>Edit</span>
                          </button>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Registered */}
                  <td className="px-4 py-3.5 whitespace-nowrap text-slate-500 text-[11px]">
                    {formatDate(tech.createdAt)}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onViewTechnician(tech)
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        <EyeIcon className="h-3.5 w-3.5" />
                        <span>View & Skills</span>
                      </button>

                      {onDeleteTechnician && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setTechToDelete(tech)
                          }}
                          className="inline-flex items-center rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
                          title="Delete Technician"
                        >
                          <TrashIcon className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TechnicianTable
