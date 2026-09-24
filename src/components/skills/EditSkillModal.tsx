import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { CloseIcon, PencilIcon } from '../icons'
import type { Skill, UpdateSkillDto } from '../../types/skill'
import skillService from '../../services/skillService'

interface EditSkillModalProps {
  isOpen: boolean
  skill: Skill | null
  onClose: () => void
  onSkillUpdated: (updatedSkill: Skill) => void
}

interface FormValues {
  name: string
  description: string
}

export function EditSkillModal({
  isOpen,
  skill,
  onClose,
  onSkillUpdated,
}: EditSkillModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      description: '',
    },
  })

  useEffect(() => {
    if (skill && isOpen) {
      reset({
        name: skill.name || '',
        description: skill.description || '',
      })
    }
  }, [skill, isOpen, reset])

  const handleClose = () => {
    reset()
    onClose()
  }

  if (!isOpen || !skill) return null

  const onSubmit = async (values: FormValues) => {
    const payload: UpdateSkillDto = {
      name: values.name.trim(),
      description: values.description.trim(),
    }

    try {
      const response = await skillService.updateSkill(skill.id, payload)
      if (response.success && response.payload) {
        toast.success('Skill updated successfully!')
        onSkillUpdated(response.payload)
        handleClose()
        return
      }
      toast.error(response.error?.message || 'Failed to update skill')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred while updating skill')
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

      <div className="relative z-10 w-full max-w-lg transform overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
              <PencilIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Edit Skill</h3>
              <p className="text-xs text-slate-500">Update technical skill definition and description</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4" noValidate>
          <Input
            label="Skill Name"
            placeholder="e.g. HVAC Maintenance & Heat Pump Repair"
            required="Skill name is required"
            error={errors.name}
            name="name"
            register={register}
            rules={{
              maxLength: {
                value: 120,
                message: 'Skill name cannot exceed 120 characters',
              },
            }}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 sm:text-sm mb-1.5">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="e.g. Comprehensive inspection, refrigerant charging, and compressor diagnostics for heating and cooling systems."
              className={`block w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                errors.description
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-slate-300 focus:border-blue-600 focus:ring-blue-600/20'
              }`}
              {...register('description', {
                required: 'Skill description is required',
                validate: (value) =>
                  value.trim().length > 0 || 'Skill description cannot be empty',
                maxLength: {
                  value: 500,
                  message: 'Description cannot exceed 500 characters',
                },
              })}
            />
            {errors.description && (
              <p className="mt-1.5 text-xs text-red-600" role="alert">
                {errors.description.message}
              </p>
            )}
            <p className="mt-1 text-[11px] text-slate-400 text-right">Max 500 characters</p>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <Button variant="outline" size="md" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" isLoading={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditSkillModal
