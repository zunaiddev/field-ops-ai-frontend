import { useState, useEffect, type FC } from 'react'
import toast from 'react-hot-toast'
import { Button } from '../ui/Button'
import {
  CloseIcon,
  MapPinIcon,
  PencilIcon,
  PlusIcon,
  SkillsIcon,
  TrashIcon,
  UsersIcon,
  WrenchIcon,
} from '../icons'
import type { Technician, TechnicianAddress } from '../../types/technician'
import type { Skill } from '../../types/skill'
import technicianService from '../../services/technicianService'
import { UpdateAddressModal } from './UpdateAddressModal'
import { AssignSkillModal } from './AssignSkillModal'

interface TechnicianDetailsModalProps {
  isOpen: boolean
  technician: Technician | null
  onClose: () => void
  onAddressUpdated?: (technicianId: number, updatedAddress: TechnicianAddress) => void
}

function formatDate(dateValue: string | Date | null | undefined): string {
  if (!dateValue) return '—'
  try {
    const d = new Date(dateValue)
    if (isNaN(d.getTime())) return '—'
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

export const TechnicianDetailsModal: FC<TechnicianDetailsModalProps> = ({
  isOpen,
  technician,
  onClose,
  onAddressUpdated,
}) => {
  const [skills, setSkills] = useState<Skill[]>([])
  const [isLoadingSkills, setIsLoadingSkills] = useState(false)
  const [skillsLoaded, setSkillsLoaded] = useState(false)
  const [skillsError, setSkillsError] = useState<string | null>(null)
  const [isAssignSkillOpen, setIsAssignSkillOpen] = useState(false)
  const [removingSkillId, setRemovingSkillId] = useState<number | null>(null)

  // Active address being edited in the modal
  const [activeAddressToEdit, setActiveAddressToEdit] = useState<{
    address: TechnicianAddress
    label: string
  } | null>(null)

  // Reset skills view when technician changes or modal opens
  useEffect(() => {
    if (!isOpen) {
      setSkills([])
      setSkillsLoaded(false)
      setSkillsError(null)
      setIsLoadingSkills(false)
      setActiveAddressToEdit(null)
      setIsAssignSkillOpen(false)
      setRemovingSkillId(null)
    }
  }, [isOpen, technician?.id])

  // Escape key handler
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

  if (!isOpen || !technician) return null

  // Fetch technician skills on demand
  const handleLoadSkills = async () => {
    setIsLoadingSkills(true)
    setSkillsError(null)
    try {
      const res = await technicianService.getTechnicianSkills(technician.id)
      if (res.success && res.payload) {
        setSkills(res.payload)
        setSkillsLoaded(true)
      } else {
        setSkillsError(res.error?.message || 'Failed to load technician skills')
      }
    } catch (err) {
      setSkillsError(
        err instanceof Error ? err.message : 'An error occurred while fetching skills',
      )
    } finally {
      setIsLoadingSkills(false)
    }
  }

  // Handle skill assigned via PATCH /technicians/:id/skills/:skillId
  const handleSkillAssigned = (newSkill: Skill) => {
    setSkills((prev) => {
      if (prev.some((s) => s.id === newSkill.id)) return prev
      return [...prev, newSkill]
    })
    setSkillsLoaded(true)
  }

  // Handle remove skill via DELETE /technicians/:id/skills/:skillId
  const handleRemoveSkill = async (skill: Skill) => {
    if (
      !window.confirm(
        `Are you sure you want to remove "${skill.name}" from this technician?`,
      )
    ) {
      return
    }

    setRemovingSkillId(skill.id)
    try {
      const res = await technicianService.removeSkillFromTechnician(
        technician.id,
        skill.id,
      )

      if (res.success) {
        toast.success(`Skill "${skill.name}" removed`)
        setSkills((prev) => prev.filter((s) => s.id !== skill.id))
      } else {
        toast.error(res.error?.message || 'Failed to remove skill')
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'An error occurred while removing skill',
      )
    } finally {
      setRemovingSkillId(null)
    }
  }

  const handleAddressSaved = (updatedAddress: TechnicianAddress) => {
    if (onAddressUpdated && technician) {
      onAddressUpdated(technician.id, updatedAddress)
    }
    setActiveAddressToEdit(null)
  }

  const employee = technician.employee
  const employeeName =
    employee
      ? `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.email
      : `Technician #${technician.id}`

  const homeAddr = technician.homeAddress || null
  const homeAddrId = homeAddr?.id || (homeAddr as any)?.addressId

  const currentAddr =
    technician.currentAddress ||
    (technician as any)?.address ||
    (technician as any)?.dispatchAddress ||
    null
  const currentAddrId = currentAddr?.id || (currentAddr as any)?.addressId

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        role="dialog"
        aria-modal="true"
      >
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          onClick={onClose}
        />

        <div className="relative z-10 w-full max-w-2xl transform overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50/75 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm ring-4 ring-white">
                <WrenchIcon className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold tracking-tight text-slate-900">
                    {employeeName}
                  </h3>
                  <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Tech #{technician.id}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      technician.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                        : 'bg-slate-100 text-slate-600 ring-1 ring-slate-600/10'
                    }`}
                  >
                    {technician.status}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      technician.availabilityStatus === 'AVAILABLE'
                        ? 'bg-teal-50 text-teal-700 ring-1 ring-teal-600/20'
                        : technician.availabilityStatus === 'ON_JOB'
                        ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20'
                        : 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20'
                    }`}
                  >
                    {technician.availabilityStatus}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  Organization #{technician.organizationId} • Joined {formatDate(technician.createdAt)}
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

          {/* Content Body */}
          <div className="overflow-y-auto p-6 space-y-6 flex-1">
            {/* Employee Card */}
            {employee && (
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <UsersIcon className="h-4 w-4 text-blue-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Associated Employee Record
                  </h4>
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <span className="text-[11px] font-medium text-slate-400">Full Name</span>
                      <p className="text-xs font-bold text-slate-900 mt-0.5">
                        {employee.firstName} {employee.lastName}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] font-medium text-slate-400">Employee ID</span>
                      <p className="font-mono text-xs font-semibold text-slate-800 mt-0.5">
                        {employee.employeeId !== undefined && employee.employeeId !== null
                          ? String(employee.employeeId)
                          : `EMP-${employee.id}`}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] font-medium text-slate-400">Email Address</span>
                      <p className="text-xs text-slate-800 mt-0.5 font-medium">{employee.email}</p>
                    </div>

                    <div>
                      <span className="text-[11px] font-medium text-slate-400">Phone</span>
                      <p className="text-xs text-slate-800 mt-0.5 font-medium">
                        {employee.phone || '—'}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] font-medium text-slate-400">System Role</span>
                      <p className="text-xs text-blue-700 font-semibold mt-0.5 uppercase">
                        {employee.role}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] font-medium text-slate-400">Account Status</span>
                      <p className="text-xs text-emerald-700 font-semibold mt-0.5">
                        {employee.status}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Addresses Section */}
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <MapPinIcon className="h-4 w-4 text-blue-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Technician Addresses
                </h4>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Home Address */}
                <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-800">Home Address</span>
                      {homeAddrId && (
                        <span className="font-mono text-[10px] text-slate-400">
                          ID #{homeAddrId}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setActiveAddressToEdit({
                          address: homeAddr || {
                            addressLine1: '',
                            city: '',
                            state: '',
                            postalCode: '',
                            country: 'India',
                          },
                          label: 'Home Address',
                        })
                      }
                      className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                      title="Update Home Address"
                    >
                      <PencilIcon className="h-3 w-3" />
                      <span>Update Address</span>
                    </button>
                  </div>

                  {homeAddr ? (
                    <div className="text-xs text-slate-600 space-y-1">
                      <p className="font-semibold text-slate-900">
                        {homeAddr.addressLine1}
                      </p>
                      {homeAddr.addressLine2 && (
                        <p>{homeAddr.addressLine2}</p>
                      )}
                      <p>
                        {homeAddr.city}, {homeAddr.state} {homeAddr.postalCode}
                      </p>
                      <p>{homeAddr.country}</p>
                      {(homeAddr.longitude || homeAddr.latitude) && (
                        <p className="font-mono text-[11px] text-slate-400 pt-1">
                          GPS: {homeAddr.latitude}, {homeAddr.longitude}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs italic text-slate-400">No home address recorded.</p>
                  )}
                </div>

                {/* Current Address */}
                <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-800">Current Address</span>
                      {currentAddrId && (
                        <span className="font-mono text-[10px] text-slate-400">
                          ID #{currentAddrId}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setActiveAddressToEdit({
                          address: currentAddr || {
                            addressLine1: '',
                            city: '',
                            state: '',
                            postalCode: '',
                            country: 'India',
                          },
                          label: 'Current Address',
                        })
                      }
                      className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                      title="Update Current Address"
                    >
                      <PencilIcon className="h-3 w-3" />
                      <span>Update Address</span>
                    </button>
                  </div>

                  {currentAddr ? (
                    <div className="text-xs text-slate-600 space-y-1">
                      <p className="font-semibold text-slate-900">
                        {currentAddr.addressLine1}
                      </p>
                      {currentAddr.addressLine2 && (
                        <p>{currentAddr.addressLine2}</p>
                      )}
                      <p>
                        {currentAddr.city}, {currentAddr.state} {currentAddr.postalCode}
                      </p>
                      <p>{currentAddr.country}</p>
                      {(currentAddr.longitude || currentAddr.latitude) && (
                        <p className="font-mono text-[11px] text-slate-400 pt-1">
                          GPS: {currentAddr.latitude}, {currentAddr.longitude}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs italic text-slate-400">No current address recorded.</p>
                  )}
                </div>
              </div>
            </div>

            {/* TECHNICIAN SKILLS SECTION with ASSIGN and REMOVE capabilities */}
            <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4.5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                    <SkillsIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Technician Skills & Qualifications
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Technical proficiencies assigned to this technician
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    leftIcon={<PlusIcon className="h-3.5 w-3.5" />}
                    onClick={() => setIsAssignSkillOpen(true)}
                  >
                    Assign Skill
                  </Button>

                  <Button
                    type="button"
                    variant={skillsLoaded ? 'outline' : 'primary'}
                    size="sm"
                    leftIcon={<SkillsIcon className="h-3.5 w-3.5" />}
                    onClick={handleLoadSkills}
                    isLoading={isLoadingSkills}
                  >
                    {skillsLoaded ? 'Refresh Skills' : 'Show Skills'}
                  </Button>
                </div>
              </div>

              {/* Loading state for skills */}
              {isLoadingSkills && (
                <div className="flex items-center justify-center py-6 text-xs text-blue-700 bg-white rounded-lg border border-blue-200">
                  <svg
                    className="h-5 w-5 animate-spin mr-2 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Fetching technician skills from server...
                </div>
              )}

              {/* Error state */}
              {!isLoadingSkills && skillsError && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                  {skillsError}
                </div>
              )}

              {/* Skills List */}
              {!isLoadingSkills && skillsLoaded && (
                <div className="space-y-2 pt-1 animate-in fade-in duration-200">
                  {skills.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-center text-xs text-slate-500">
                      No skills currently recorded for this technician. Click "Assign Skill" to add one.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Assigned Skills ({skills.length}):
                      </p>
                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                        {skills.map((skill) => (
                          <div
                            key={skill.id}
                            className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xs hover:border-blue-300 transition-colors flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-bold text-slate-900">
                                  {skill.name}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                                    #{skill.id}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSkill(skill)}
                                    disabled={removingSkillId === skill.id}
                                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                    title="Remove skill from technician"
                                  >
                                    {removingSkillId === skill.id ? (
                                      <svg
                                        className="h-3.5 w-3.5 animate-spin text-rose-600"
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
                                    ) : (
                                      <TrashIcon className="h-3.5 w-3.5" />
                                    )}
                                  </button>
                                </div>
                              </div>
                              {skill.description && (
                                <p className="mt-1 text-[11px] text-slate-600 line-clamp-2">
                                  {skill.description}
                                </p>
                              )}
                            </div>
                            <p className="mt-2 text-[10px] text-slate-400 border-t border-slate-100 pt-1.5">
                              Added: {formatDate(skill.createdAt)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50/75 px-6 py-4">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>

      {/* Single reusable Update Address Modal */}
      {activeAddressToEdit && (
        <UpdateAddressModal
          isOpen={Boolean(activeAddressToEdit)}
          technicianId={technician.id}
          address={activeAddressToEdit.address}
          addressTypeLabel={activeAddressToEdit.label}
          onClose={() => setActiveAddressToEdit(null)}
          onAddressUpdated={handleAddressSaved}
        />
      )}

      {/* Assign Skill Modal (PATCH /technicians/:id/skills/:skillId) */}
      {isAssignSkillOpen && (
        <AssignSkillModal
          isOpen={isAssignSkillOpen}
          technicianId={technician.id}
          alreadyAssignedSkillIds={skills.map((s) => s.id)}
          onClose={() => setIsAssignSkillOpen(false)}
          onSkillAssigned={handleSkillAssigned}
        />
      )}
    </>
  )
}

export default TechnicianDetailsModal
