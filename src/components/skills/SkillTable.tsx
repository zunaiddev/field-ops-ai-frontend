import { useState, type FC } from 'react'
import type { Skill } from '../../types/skill'
import { EyeIcon, PencilIcon, SkillsIcon, TrashIcon } from '../icons'

interface SkillTableProps {
  skills: Skill[]
  onViewSkill?: (skill: Skill) => void
  onEditSkill?: (skill: Skill) => void
  onDeleteSkill?: (skill: Skill) => Promise<void> | void
  onAddNewSkill?: () => void
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

export const SkillTable: FC<SkillTableProps> = ({
  skills,
  onViewSkill,
  onEditSkill,
  onDeleteSkill,
  onAddNewSkill,
}) => {
  const [skillToDelete, setSkillToDelete] = useState<Skill | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirmDelete = async () => {
    if (!skillToDelete || !onDeleteSkill) return
    setIsDeleting(true)
    try {
      await onDeleteSkill(skillToDelete)
      setSkillToDelete(null)
    } finally {
      setIsDeleting(false)
    }
  }

  if (skills.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <SkillsIcon className="h-7 w-7" />
        </div>
        <h3 className="mt-3 text-base font-semibold text-slate-900">No skills found</h3>
        <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
          No technician skills match your search or none have been created yet. Add new skills to assign to field technicians.
        </p>
        {onAddNewSkill && (
          <div className="mt-4">
            <button
              type="button"
              onClick={onAddNewSkill}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Add First Skill
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs">
      {/* Table Delete Confirmation Alert Banner */}
      {skillToDelete && (
        <div className="border-b border-rose-200 bg-rose-50 p-4 transition-all animate-in fade-in">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <TrashIcon className="h-4 w-4" />
              </div>
              <div className="text-xs text-rose-900">
                <p className="font-semibold">
                  Are you sure you want to delete &ldquo;{skillToDelete.name}&rdquo;?
                </p>
                <p className="text-rose-700">This action will permanently delete this skill.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSkillToDelete(null)}
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
                Skill Name
              </th>
              <th scope="col" className="px-4 py-3.5">
                Description
              </th>
              <th scope="col" className="px-4 py-3.5">
                Created Date
              </th>
              <th scope="col" className="px-5 py-3.5 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {skills.map((skill) => (
              <tr
                key={skill.id}
                className="hover:bg-slate-50/60 transition-colors group"
              >
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => onViewSkill?.(skill)}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-600/10 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <SkillsIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {skill.name}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        ID: #{skill.id}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3.5 max-w-md">
                  <p className="line-clamp-2 text-slate-600">
                    {skill.description || (
                      <span className="italic text-slate-400">No description</span>
                    )}
                  </p>
                </td>

                <td className="px-4 py-3.5 whitespace-nowrap text-slate-500 text-[11px]">
                  {formatDate(skill.createdAt)}
                </td>

                <td className="px-5 py-3.5 whitespace-nowrap text-right">
                  <div className="inline-flex items-center gap-1">
                    {onViewSkill && (
                      <button
                        type="button"
                        onClick={() => onViewSkill(skill)}
                        className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        title="View Skill Details"
                      >
                        <EyeIcon className="h-3.5 w-3.5" />
                        <span>View</span>
                      </button>
                    )}

                    {onEditSkill && (
                      <button
                        type="button"
                        onClick={() => onEditSkill(skill)}
                        className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        title="Edit Skill"
                      >
                        <PencilIcon className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </button>
                    )}

                    {onDeleteSkill && (
                      <button
                        type="button"
                        onClick={() => setSkillToDelete(skill)}
                        className="inline-flex items-center rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
                        title="Delete Skill"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SkillTable
