import { type FC, useEffect, useState } from 'react'
import { Button } from '../ui/Button'
import { CloseIcon } from '../icons'
import type { Employee } from '../../types/organization'

interface EmployeeDetailsModalProps {
  isOpen: boolean
  employee: Employee | null
  onClose: () => void
  onEdit: (employee: Employee) => void
  onDelete: (employee: Employee) => Promise<void> | void
}

const roleBadgeStyles: Record<string, { bg: string; text: string; label: string }> = {
  OWNER: { bg: 'bg-blue-50 text-blue-700 ring-blue-700/20', label: 'Owner', text: 'text-blue-700' },
  ORG_OWNER: { bg: 'bg-blue-50 text-blue-700 ring-blue-700/20', label: 'Owner', text: 'text-blue-700' },
  ADMIN: { bg: 'bg-indigo-50 text-indigo-700 ring-indigo-700/20', label: 'Admin', text: 'text-indigo-700' },
  ORG_ADMIN: { bg: 'bg-indigo-50 text-indigo-700 ring-indigo-700/20', label: 'Admin', text: 'text-indigo-700' },
  MANAGER: { bg: 'bg-violet-50 text-violet-700 ring-violet-700/20', label: 'Manager', text: 'text-violet-700' },
  EMPLOYEE: { bg: 'bg-slate-100 text-slate-700 ring-slate-600/20', label: 'Field Tech', text: 'text-slate-700' },
  TECHNICIAN: { bg: 'bg-emerald-50 text-emerald-700 ring-emerald-700/20', label: 'Technician', text: 'text-emerald-700' },
  DISPATCHER: { bg: 'bg-cyan-50 text-cyan-700 ring-cyan-700/20', label: 'Dispatcher', text: 'text-cyan-700' },
  INVENTORY_MANAGER: { bg: 'bg-amber-50 text-amber-700 ring-amber-700/20', label: 'Inventory Manager', text: 'text-amber-700' },
  FINANCE: { bg: 'bg-teal-50 text-teal-700 ring-teal-700/20', label: 'Finance', text: 'text-teal-700' },
  VIEWER: { bg: 'bg-slate-100 text-slate-700 ring-slate-600/20', label: 'Viewer', text: 'text-slate-700' },
}

const statusBadgeStyles: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  ACTIVE: {
    bg: 'bg-emerald-50 ring-emerald-600/20',
    text: 'text-emerald-700',
    dot: 'bg-emerald-600',
    label: 'Active',
  },
  ON_LEAVE: {
    bg: 'bg-amber-50 ring-amber-600/20',
    text: 'text-amber-700',
    dot: 'bg-amber-600',
    label: 'On Leave',
  },
  INACTIVE: {
    bg: 'bg-slate-100 ring-slate-500/20',
    text: 'text-slate-600',
    dot: 'bg-slate-500',
    label: 'Inactive',
  },
}

function formatDate(dateValue: string | Date | null | undefined): string {
  if (!dateValue) return 'Never'
  try {
    const d = new Date(dateValue)
    if (isNaN(d.getTime())) return 'Invalid date'
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return 'Invalid date'
  }
}

export const EmployeeDetailsModal: FC<EmployeeDetailsModalProps> = ({
  isOpen,
  employee,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showDeleteConfirm) {
          setShowDeleteConfirm(false)
        } else {
          onClose()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, showDeleteConfirm, onClose])

  useEffect(() => {
    if (isOpen) {
      setShowDeleteConfirm(false)
      setIsDeleting(false)
    }
  }, [isOpen])

  if (!isOpen || !employee) return null

  const isOwner = employee.role === 'ORG_OWNER' || employee.role === 'OWNER'

  const roleCfg = roleBadgeStyles[employee.role] ?? {
    bg: 'bg-slate-100 text-slate-700 ring-slate-600/20',
    label: employee.role || 'Member',
    text: 'text-slate-700',
  }
  const statusCfg = statusBadgeStyles[employee.status] ?? {
    bg: 'bg-slate-100 ring-slate-500/20',
    text: 'text-slate-600',
    dot: 'bg-slate-500',
    label: employee.status || 'Unknown',
  }

  const fullName: string =
    `${employee.firstName || ''} ${employee.lastName || ''}`.trim() ||
    'Unnamed Employee'
  const firstInitial: string = (employee.firstName?.[0] || fullName[0] || 'U').toUpperCase()
  const lastInitial: string = (employee.lastName?.[0] || '').toUpperCase()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(employee)
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
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
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-2xl transform overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50/50 p-6">
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-lg font-bold text-white shadow-sm ring-4 ring-white"
            >
              {firstInitial}
              {lastInitial}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-bold tracking-tight text-slate-900">{fullName}</h3>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${statusCfg.bg} ${statusCfg.text}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
                  {statusCfg.label}
                </span>
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ${roleCfg.bg}`}
                >
                  {roleCfg.label}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">{employee.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Delete Confirmation Alert Banner */}
        {showDeleteConfirm && (
          <div className="border-b border-rose-200 bg-rose-50 p-4 transition-all animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div className="flex-1 text-xs">
                <p className="font-semibold text-rose-900">Are you sure you want to remove this member?</p>
                <p className="mt-0.5 text-rose-700">
                  This will remove <strong>{fullName}</strong> from the organization directory.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Details Grid */}
        <div className="max-h-[60vh] overflow-y-auto p-6 space-y-5">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Personal & Contact Information
            </h4>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                <span className="text-[11px] font-medium text-slate-400">First Name</span>
                <p className="mt-1 text-sm font-semibold text-slate-800">{employee.firstName || '—'}</p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                <span className="text-[11px] font-medium text-slate-400">Last Name</span>
                <p className="mt-1 text-sm font-semibold text-slate-800">{employee.lastName || '—'}</p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                <span className="text-[11px] font-medium text-slate-400">Email Address</span>
                <p className="mt-1 text-sm font-semibold text-slate-800 break-all">{employee.email}</p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                <span className="text-[11px] font-medium text-slate-400">Phone Number</span>
                <p className="mt-1 text-sm font-semibold text-slate-800">{employee.phone || '—'}</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Role & Operational Status
            </h4>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                <span className="text-[11px] font-medium text-slate-400">Email Verification</span>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {employee.emailVerifiedAt ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      Verified
                    </span>
                  ) : (
                    <span className="text-amber-600">Pending</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Activity & System Records
            </h4>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                <span className="text-[11px] font-medium text-slate-400">Employee ID</span>
                <p className="mt-1 font-mono text-xs font-semibold text-slate-700 truncate" title={employee.id}>
                  {employee.id}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                <span className="text-[11px] font-medium text-slate-400">Last Login</span>
                <p className="mt-1 text-xs font-semibold text-slate-700">
                  {formatDate(employee.lastLoginAt)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                <span className="text-[11px] font-medium text-slate-400">Created At</span>
                <p className="mt-1 text-xs font-semibold text-slate-700">
                  {formatDate(employee.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {!isOwner && !showDeleteConfirm && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                Delete Member
              </button>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              }
              onClick={() => onEdit(employee)}
            >
              Edit Member
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmployeeDetailsModal
