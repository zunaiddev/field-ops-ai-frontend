import { type FC, useEffect, useState } from 'react'
import { Button } from '../ui/Button'
import { CloseIcon, PencilIcon, SkillsIcon, TrashIcon } from '../icons'
import type { Skill } from '../../types/skill'
import skillService from '../../services/skillService'

interface SkillDetailsModalProps {
  isOpen: boolean
  skill: Skill | null
  onClose: () => void
  onEdit: (skill: Skill) => void
  onDelete: (skill: Skill) => Promise<void> | void
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

export const SkillDetailsModal: FC<SkillDetailsModalProps> = ({
  isOpen,
  skill,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [freshSkill, setFreshSkill] = useState<Skill | null>(null)
  const [loadingFresh, setLoadingFresh] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const currentSkill = freshSkill ?? skill

  useEffect(() => {
    if (!isOpen || !skill?.id) return

    let isMounted = true
    const fetchFresh = async () => {
      setLoadingFresh(true)
      try {
        const res = await skillService.getSkillById(skill.id)
        if (isMounted && res.success && res.payload) {
          setFreshSkill(res.payload)
        }
      } catch {
        // Keep currentSkill fallback if single get fails
      } finally {
        if (isMounted) setLoadingFresh(false)
      }
    }
    fetchFresh()

    return () => {
      isMounted = false
    }
  }, [isOpen, skill?.id])

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

  const handleClose = () => {
    setShowDeleteConfirm(false)
    setFreshSkill(null)
    onClose()
  }

  if (!isOpen || !currentSkill) return null

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(currentSkill)
      handleClose()
    } finally {
      setIsDeleting(false)
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
        onClick={handleClose}
      />

      <div className="relative z-10 w-full max-w-xl transform overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50/60 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm ring-4 ring-white">
              <SkillsIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold tracking-tight text-slate-900">
                  {currentSkill.name}
                </h3>
                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-mono font-medium text-blue-700 ring-1 ring-blue-700/10">
                  #{currentSkill.id}
                </span>
                {loadingFresh && (
                  <span className="text-[11px] text-slate-400 animate-pulse">refreshing...</span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-slate-500">Technician Technical Qualification</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Delete Confirmation Alert Banner */}
        {showDeleteConfirm && (
          <div className="border-b border-rose-200 bg-rose-50 p-4 transition-all animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <TrashIcon className="h-4 w-4" />
              </div>
              <div className="flex-1 text-xs">
                <p className="font-semibold text-rose-900">
                  Are you sure you want to delete this skill?
                </p>
                <p className="mt-0.5 text-rose-700">
                  This action cannot be undone. Skill &ldquo;{currentSkill.name}&rdquo; will be permanently removed.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isDeleting ? 'Deleting...' : 'Yes, Delete Skill'}
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

        {/* Modal Body */}
        <div className="max-h-[60vh] overflow-y-auto p-6 space-y-5">
          {/* Description Section */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Description & Scope
            </h4>
            <div className="mt-2 rounded-xl border border-slate-200/80 bg-slate-50/40 p-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              {currentSkill.description || (
                <span className="italic text-slate-400">No description provided for this skill.</span>
              )}
            </div>
          </div>

          {/* Metadata Section */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Record Information
            </h4>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                <span className="text-[11px] font-medium text-slate-400">Skill ID</span>
                <p className="mt-1 font-mono text-xs font-semibold text-slate-800">
                  #{currentSkill.id}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                <span className="text-[11px] font-medium text-slate-400">Created At</span>
                <p className="mt-1 text-xs font-semibold text-slate-800">
                  {formatDate(currentSkill.createdAt)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                <span className="text-[11px] font-medium text-slate-400">Updated At</span>
                <p className="mt-1 text-xs font-semibold text-slate-800">
                  {formatDate(currentSkill.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {!showDeleteConfirm && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
              >
                <TrashIcon className="h-4 w-4" />
                <span>Delete Skill</span>
              </button>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5">
            <Button variant="outline" size="sm" onClick={handleClose}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<PencilIcon className="h-3.5 w-3.5" />}
              onClick={() => {
                onEdit(currentSkill)
              }}
            >
              Edit Skill
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SkillDetailsModal
