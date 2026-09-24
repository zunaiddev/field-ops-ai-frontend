import { useState, useEffect, useMemo, type FC } from 'react'
import toast from 'react-hot-toast'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { CloseIcon, PlusIcon, SearchIcon, SkillsIcon } from '../icons'
import skillService from '../../services/skillService'
import technicianService from '../../services/technicianService'
import type { Skill } from '../../types/skill'

interface AssignSkillModalProps {
  isOpen: boolean
  technicianId: number | string
  alreadyAssignedSkillIds: (number | string)[]
  onClose: () => void
  onSkillAssigned: (skill: Skill) => void
}

export const AssignSkillModal: FC<AssignSkillModalProps> = ({
  isOpen,
  technicianId,
  alreadyAssignedSkillIds,
  onClose,
  onSkillAssigned,
}) => {
  const [allSkills, setAllSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSkillId, setSelectedSkillId] = useState<number | null>(null)

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('')
      setSelectedSkillId(null)
      return
    }

    const loadAllSkills = async () => {
      setLoading(true)
      try {
        const res = await skillService.getSkills()
        if (res.success && res.payload) {
          setAllSkills(res.payload)
        } else {
          toast.error(res.error?.message || 'Failed to load organization skills')
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Error fetching skills')
      } finally {
        setLoading(false)
      }
    }

    loadAllSkills()
  }, [isOpen])

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

  // Filter skills excluding already assigned ones and matching search
  const availableSkills = useMemo(() => {
    const assignedSet = new Set(alreadyAssignedSkillIds.map((id) => Number(id)))
    return allSkills.filter((s) => !assignedSet.has(Number(s.id)))
  }, [allSkills, alreadyAssignedSkillIds])

  const filteredSkills = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return availableSkills
    return availableSkills.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q)),
    )
  }, [availableSkills, searchQuery])

  if (!isOpen) return null

  const handleAssign = async () => {
    if (!selectedSkillId) {
      toast.error('Please select a skill to assign')
      return
    }

    setSubmitting(true)
    try {
      const res = await technicianService.assignSkillToTechnician(
        technicianId,
        selectedSkillId,
      )

      if (res.success && res.payload) {
        toast.success(`Skill "${res.payload.name}" assigned successfully!`)
        onSkillAssigned(res.payload)
        onClose()
        return
      }

      toast.error(res.error?.message || 'Failed to assign skill to technician')
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'An error occurred while assigning skill',
      )
    } finally {
      setSubmitting(false)
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

      <div className="relative z-10 w-full max-w-lg transform overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50/75 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <SkillsIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-slate-900">
                Assign Skill to Technician
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Technician #{technicianId} • Select from organization skill registry
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

        {/* Search */}
        <div className="border-b border-slate-100 p-4">
          <Input
            placeholder="Search available skills by name or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<SearchIcon className="h-4 w-4" />}
          />
        </div>

        {/* Skill list */}
        <div className="overflow-y-auto p-4 space-y-2 flex-1 max-h-80">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <svg className="h-6 w-6 animate-spin text-blue-600 mb-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-xs">Loading available skills...</span>
            </div>
          ) : filteredSkills.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              {availableSkills.length === 0
                ? 'All organization skills are already assigned to this technician.'
                : 'No unassigned skills match your search query.'}
            </div>
          ) : (
            filteredSkills.map((skill) => {
              const isSelected = selectedSkillId === skill.id
              return (
                <div
                  key={skill.id}
                  onClick={() => setSelectedSkillId(skill.id)}
                  className={`flex items-start justify-between gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{skill.name}</span>
                      <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        #{skill.id}
                      </span>
                    </div>
                    {skill.description && (
                      <p className="mt-1 text-[11px] text-slate-500 line-clamp-2">
                        {skill.description}
                      </p>
                    )}
                  </div>
                  <div className="pt-0.5 shrink-0">
                    <input
                      type="radio"
                      name="selected_skill"
                      checked={isSelected}
                      onChange={() => setSelectedSkillId(skill.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/75 px-5 py-3.5">
          <span className="text-xs text-slate-500">
            {selectedSkillId ? (
              <span className="text-blue-700 font-medium">1 skill selected</span>
            ) : (
              'Select a skill to assign'
            )}
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              leftIcon={<PlusIcon className="h-3.5 w-3.5" />}
              onClick={handleAssign}
              isLoading={submitting}
              disabled={!selectedSkillId}
            >
              Assign Skill
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssignSkillModal
