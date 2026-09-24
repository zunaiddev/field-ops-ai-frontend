import { useState, useEffect, useCallback, useMemo, type FC } from 'react'
import toast from 'react-hot-toast'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { PlusIcon, SearchIcon, SkillsIcon } from '../components/icons'
import { SkillTable } from '../components/skills/SkillTable'
import { AddSkillModal } from '../components/skills/AddSkillModal'
import { EditSkillModal } from '../components/skills/EditSkillModal'
import { SkillDetailsModal } from '../components/skills/SkillDetailsModal'
import skillService from '../services/skillService'
import type { Skill } from '../types/skill'

export const Skills: FC = () => {
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [skills, setSkills] = useState<Skill[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const fetchSkills = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await skillService.getSkills()
      if (response.success && response.payload) {
        setSkills(response.payload)
      } else {
        setError(response.error?.message || 'Failed to fetch skills')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSkills()
  }, [fetchSkills])

  // Filter skills by search query
  const filteredSkills = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return skills
    return skills.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q)),
    )
  }, [skills, searchQuery])

  // Add skill handler
  const handleSkillCreated = (newSkill: Skill) => {
    setSkills((prev) => [newSkill, ...prev])
  }

  // View skill details handler
  const handleViewSkill = (skill: Skill) => {
    setSelectedSkill(skill)
    setIsDetailsModalOpen(true)
  }

  // Edit skill handler
  const handleEditSkill = (skill: Skill) => {
    setSelectedSkill(skill)
    setIsEditModalOpen(true)
  }

  // Transition from details modal to edit modal
  const handleEditFromDetails = (skill: Skill) => {
    setSelectedSkill(skill)
    setIsDetailsModalOpen(false)
    setIsEditModalOpen(true)
  }

  // Update skill handler
  const handleSkillUpdated = (updatedSkill: Skill) => {
    setSkills((prev) =>
      prev.map((s) => (s.id === updatedSkill.id ? { ...s, ...updatedSkill } : s)),
    )
    if (selectedSkill?.id === updatedSkill.id) {
      setSelectedSkill(updatedSkill)
    }
  }

  // Delete skill handler
  const handleDeleteSkill = async (skill: Skill) => {
    try {
      const res = await skillService.deleteSkill(skill.id)
      if (res.success) {
        toast.success(`Skill "${skill.name}" deleted successfully`)
        setSkills((prev) => prev.filter((s) => s.id !== skill.id))
        if (selectedSkill?.id === skill.id) {
          setIsDetailsModalOpen(false)
          setSelectedSkill(null)
        }
      } else {
        toast.error(res.error?.message || 'Failed to delete skill')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred while deleting skill')
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
            <SkillsIcon className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Technician Skills
              </h1>
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-700/10">
                {skills.length} Total
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Configure technical skills, certifications, and competencies required for field service jobs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={fetchSkills}
            disabled={loading}
            title="Reload skills from server"
          >
            <svg
              className={`h-4 w-4 ${loading ? 'animate-spin text-blue-600' : 'text-slate-600'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            variant="primary"
            size="md"
            leftIcon={<PlusIcon className="h-4 w-4" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Skill
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              placeholder="Search skills by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<SearchIcon className="h-4 w-4" />}
            />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-900">{filteredSkills.length}</strong> of{' '}
            {skills.length} skills
          </span>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="font-medium text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
            >
              Clear search
            </button>
          )}
        </div>
      </div>

      {/* Loading Skeleton / State */}
      {loading && skills.length === 0 && (
        <div className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-slate-200/80 bg-white p-12 text-center shadow-xs">
          <svg
            className="h-9 w-9 animate-spin text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
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
          <p className="mt-4 text-sm font-medium text-slate-700">Loading technician skills...</p>
          <p className="mt-1 text-xs text-slate-400">Please wait while we retrieve skill records.</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-8 text-center shadow-xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <h3 className="mt-3 text-base font-semibold text-rose-950">Failed to load skills</h3>
          <p className="mx-auto mt-1 max-w-md text-xs text-rose-700 sm:text-sm">{error}</p>
          <div className="mt-5">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSkills}
              className="border-rose-300 bg-white text-rose-700 hover:bg-rose-50 hover:text-rose-800"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Skills Table List */}
      {!error && (skills.length > 0 || !loading) && (
        <SkillTable
          skills={filteredSkills}
          onViewSkill={handleViewSkill}
          onEditSkill={handleEditSkill}
          onDeleteSkill={handleDeleteSkill}
          onAddNewSkill={() => setIsAddModalOpen(true)}
        />
      )}

      {/* Add Skill Modal */}
      <AddSkillModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSkillCreated={handleSkillCreated}
      />

      {/* Edit Skill Modal */}
      <EditSkillModal
        isOpen={isEditModalOpen}
        skill={selectedSkill}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedSkill(null)
        }}
        onSkillUpdated={handleSkillUpdated}
      />

      {/* Skill Details Modal */}
      <SkillDetailsModal
        isOpen={isDetailsModalOpen}
        skill={selectedSkill}
        onClose={() => {
          setIsDetailsModalOpen(false)
          setSelectedSkill(null)
        }}
        onEdit={handleEditFromDetails}
        onDelete={handleDeleteSkill}
      />
    </div>
  )
}

export default Skills
