import { useState, useEffect, useMemo, type FC } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import {
  CloseIcon,
  SearchIcon,
  SkillsIcon,
  UsersIcon,
  WrenchIcon,
  MapPinIcon,
} from '../icons'
import dashboardService from '../../services/dashboardService'
import skillService from '../../services/skillService'
import technicianService from '../../services/technicianService'
import type { Employee } from '../../types/organization'
import type { Skill } from '../../types/skill'
import type { CreateTechnicianDto, Technician } from '../../types/technician'

interface AddTechnicianModalProps {
  isOpen: boolean
  onClose: () => void
  onTechnicianCreated: (newTechnician: Technician) => void
}

interface AddressFields {
  homeAddressLine1: string
  homePostalCode: string
  homeCity: string
  homeState: string
  homeCountry: string
  homeLongitude: string
  homeLatitude: string

  currentAddressLine1: string
  currentPostalCode: string
  currentCity: string
  currentState: string
  currentCountry: string
  currentLongitude: string
  currentLatitude: string
}

export const AddTechnicianModal: FC<AddTechnicianModalProps> = ({
  isOpen,
  onClose,
  onTechnicianCreated,
}) => {
  // Remote Data State
  const [employees, setEmployees] = useState<Employee[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false)
  const [isLoadingSkills, setIsLoadingSkills] = useState(false)

  // Selection & Search State
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>([])
  const [skillSearch, setSkillSearch] = useState('')
  const [sameAsHomeAddress, setSameAsHomeAddress] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<AddressFields>({
    defaultValues: {
      homeAddressLine1: '',
      homePostalCode: '',
      homeCity: '',
      homeState: '',
      homeCountry: 'India',
      homeLongitude: '77.5040',
      homeLatitude: '28.4744',

      currentAddressLine1: '',
      currentPostalCode: '',
      currentCity: '',
      currentState: '',
      currentCountry: 'India',
      currentLongitude: '77.3910',
      currentLatitude: '28.5355',
    },
  })

  // Load Employees and Skills on Open
  useEffect(() => {
    if (!isOpen) return

    let isMounted = true

    const loadData = async () => {
      setIsLoadingEmployees(true)
      setIsLoadingSkills(true)

      try {
        const [empRes, skillRes] = await Promise.all([
          dashboardService.getEmployees(),
          skillService.getSkills(),
        ])

        if (isMounted) {
          if (empRes.success && empRes.payload?.employees) {
            setEmployees(empRes.payload.employees)
          }
          if (skillRes.success && skillRes.payload) {
            setSkills(skillRes.payload)
          }
        }
      } catch {
        toast.error('Failed to load initial employees or skills')
      } finally {
        if (isMounted) {
          setIsLoadingEmployees(false)
          setIsLoadingSkills(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [isOpen])

  // Reset modal state
  const handleClose = () => {
    reset()
    setSelectedEmployee(null)
    setEmployeeSearch('')
    setSelectedSkillIds([])
    setSkillSearch('')
    setSameAsHomeAddress(false)
    onClose()
  }

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Filtered employees for local search
  const filteredEmployees = useMemo(() => {
    const q = employeeSearch.toLowerCase().trim()
    if (!q) return employees
    return employees.filter(
      (emp) =>
        emp.firstName?.toLowerCase().includes(q) ||
        emp.lastName?.toLowerCase().includes(q) ||
        emp.email?.toLowerCase().includes(q) ||
        (emp.employeeId !== undefined &&
          emp.employeeId !== null &&
          String(emp.employeeId).toLowerCase().includes(q)) ||
        emp.phone?.toLowerCase().includes(q) ||
        emp.role?.toLowerCase().includes(q),
    )
  }, [employees, employeeSearch])

  // Filtered skills for local search
  const filteredSkills = useMemo(() => {
    const q = skillSearch.toLowerCase().trim()
    if (!q) return skills
    return skills.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q)),
    )
  }, [skills, skillSearch])

  // Toggle skill selection
  const handleToggleSkill = (skillId: number) => {
    setSelectedSkillIds((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId],
    )
  }

  // Handle "Same as Home Address" copy
  const handleToggleSameAddress = (checked: boolean) => {
    setSameAsHomeAddress(checked)
    if (checked) {
      const values = getValues()
      setValue('currentAddressLine1', values.homeAddressLine1)
      setValue('currentPostalCode', values.homePostalCode)
      setValue('currentCity', values.homeCity)
      setValue('currentState', values.homeState)
      setValue('currentCountry', values.homeCountry)
      setValue('currentLongitude', values.homeLongitude)
      setValue('currentLatitude', values.homeLatitude)
    }
  }

  // Submit Handler
  const onSubmit = async (values: AddressFields) => {
    if (!selectedEmployee) {
      toast.error('Please select an employee')
      return
    }

    if (selectedSkillIds.length === 0) {
      toast.error('Please select at least one skill for this technician')
      return
    }

    const payload: CreateTechnicianDto = {
      employeeId: Number(selectedEmployee.id),
      skills: selectedSkillIds,
      homeAddress: {
        addressLine1: values.homeAddressLine1.trim(),
        postalCode: values.homePostalCode.trim(),
        city: values.homeCity.trim(),
        state: values.homeState.trim(),
        country: values.homeCountry.trim(),
        longitude: values.homeLongitude.trim() || undefined,
        latitude: values.homeLatitude.trim() || undefined,
      },
      currentAddress: {
        addressLine1: (sameAsHomeAddress
          ? values.homeAddressLine1
          : values.currentAddressLine1
        ).trim(),
        postalCode: (sameAsHomeAddress
          ? values.homePostalCode
          : values.currentPostalCode
        ).trim(),
        city: (sameAsHomeAddress ? values.homeCity : values.currentCity).trim(),
        state: (sameAsHomeAddress ? values.homeState : values.currentState).trim(),
        country: (sameAsHomeAddress ? values.homeCountry : values.currentCountry).trim(),
        longitude: (sameAsHomeAddress
          ? values.homeLongitude
          : values.currentLongitude
        ).trim() || undefined,
        latitude: (sameAsHomeAddress
          ? values.homeLatitude
          : values.currentLatitude
        ).trim() || undefined,
      },
    }

    try {
      const res = await technicianService.createTechnician(payload)
      if (res.success && res.payload) {
        toast.success('Technician registered successfully!')
        onTechnicianCreated(res.payload)
        handleClose()
        return
      }
      toast.error(res.error?.message || 'Failed to create technician')
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'An error occurred while creating technician',
      )
    }
  }

  if (!isOpen) return null

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

      <div className="relative z-10 w-full max-w-3xl transform overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50/75 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm ring-4 ring-white">
              <WrenchIcon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight text-slate-900">
                Register New Technician
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Assign an employee to the field technician team, configure technical skills, and record addresses.
              </p>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto p-6 space-y-6 flex-1">
            {/* STEP 1: SELECT EMPLOYEE */}
            <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UsersIcon className="h-4 w-4 text-blue-600" />
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Step 1: Select Employee <span className="text-rose-500">*</span>
                  </label>
                </div>
                {selectedEmployee && (
                  <button
                    type="button"
                    onClick={() => setSelectedEmployee(null)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                  >
                    Change Employee
                  </button>
                )}
              </div>

              {!selectedEmployee ? (
                <div className="space-y-3">
                  <Input
                    placeholder="Search employee by name, email, employee ID, role..."
                    value={employeeSearch}
                    onChange={(e) => setEmployeeSearch(e.target.value)}
                    leftIcon={<SearchIcon className="h-4 w-4" />}
                  />

                  {isLoadingEmployees ? (
                    <div className="flex items-center justify-center p-6 text-xs text-slate-500">
                      <svg
                        className="h-5 w-5 animate-spin text-blue-600 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Loading employees list...
                    </div>
                  ) : filteredEmployees.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-200 bg-white p-4 text-center text-xs text-slate-500">
                      No employees found matching &ldquo;{employeeSearch}&rdquo;.
                    </div>
                  ) : (
                    <div className="max-h-48 overflow-y-auto space-y-1.5 rounded-lg border border-slate-200 bg-white p-2">
                      {filteredEmployees.map((emp) => {
                        const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.email
                        return (
                          <div
                            key={emp.id}
                            onClick={() => setSelectedEmployee(emp)}
                            className="flex items-center justify-between rounded-lg p-2.5 hover:bg-blue-50/70 border border-transparent hover:border-blue-200 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-semibold text-xs">
                                {(emp.firstName?.[0] || emp.email?.[0] || 'E').toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-900 truncate">
                                    {fullName}
                                  </span>
                                  {emp.employeeId !== undefined && emp.employeeId !== null && (
                                    <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                      {String(emp.employeeId)}
                                    </span>
                                  )}
                                  <span className="text-[10px] uppercase font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                    {emp.role}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                  {emp.email} {emp.phone ? `• ${emp.phone}` : ''}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              className="shrink-0 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 cursor-pointer"
                            >
                              Select
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* Selected Employee Card */
                <div className="flex items-center justify-between rounded-lg border border-teal-200 bg-teal-50/40 p-3.5 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-600 font-bold text-sm text-white">
                      {(selectedEmployee.firstName?.[0] || 'E').toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {selectedEmployee.firstName} {selectedEmployee.lastName}
                        </span>
                        {selectedEmployee.employeeId !== undefined && selectedEmployee.employeeId !== null && (
                          <span className="font-mono text-[10px] text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                            {String(selectedEmployee.employeeId)}
                          </span>
                        )}
                        <span className="font-mono text-[10px] text-teal-700 bg-teal-100 px-1.5 py-0.5 rounded">
                          Employee #{selectedEmployee.id}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {selectedEmployee.email} {selectedEmployee.phone ? `• ${selectedEmployee.phone}` : ''} • Role: {selectedEmployee.role}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* STEP 2: SELECT SKILLS */}
            <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SkillsIcon className="h-4 w-4 text-blue-600" />
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Step 2: Assign Skills <span className="text-rose-500">*</span>
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-800">
                    {selectedSkillIds.length} Selected
                  </span>
                  {selectedSkillIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedSkillIds([])}
                      className="text-xs font-medium text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <Input
                placeholder="Search skills by name or keyword..."
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                leftIcon={<SearchIcon className="h-4 w-4" />}
              />

              {isLoadingSkills ? (
                <div className="flex items-center justify-center p-6 text-xs text-slate-500">
                  <svg
                    className="h-5 w-5 animate-spin text-blue-600 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Loading available skills...
                </div>
              ) : filteredSkills.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 bg-white p-4 text-center text-xs text-slate-500">
                  No skills found matching &ldquo;{skillSearch}&rdquo;.
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-1.5 rounded-lg border border-slate-200 bg-white p-2">
                  {filteredSkills.map((skill) => {
                    const isSelected = selectedSkillIds.includes(skill.id)
                    return (
                      <div
                        key={skill.id}
                        onClick={() => handleToggleSkill(skill.id)}
                        className={`flex items-start gap-3 rounded-lg p-2.5 border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50/80 shadow-2xs'
                            : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">
                              {skill.name}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                              #{skill.id}
                            </span>
                          </div>
                          {skill.description && (
                            <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-500">
                              {skill.description}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* STEP 3: ADDRESSES */}
            <div className="space-y-4">
              {/* Home Address */}
              <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <MapPinIcon className="h-4 w-4 text-blue-600" />
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Step 3A: Home Address <span className="text-rose-500">*</span>
                  </label>
                </div>

                <div className="space-y-3">
                  <Input
                    label="Address Line 1"
                    placeholder="e.g. 123 Knowledge Park"
                    required="Home address line 1 is required"
                    error={errors.homeAddressLine1}
                    name="homeAddressLine1"
                    register={register}
                  />

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Input
                      label="City"
                      placeholder="e.g. Greater Noida"
                      required="City is required"
                      error={errors.homeCity}
                      name="homeCity"
                      register={register}
                    />
                    <Input
                      label="State"
                      placeholder="e.g. Uttar Pradesh"
                      required="State is required"
                      error={errors.homeState}
                      name="homeState"
                      register={register}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Input
                      label="Postal Code"
                      placeholder="e.g. 201310"
                      required="Postal code is required"
                      error={errors.homePostalCode}
                      name="homePostalCode"
                      register={register}
                    />
                    <Input
                      label="Country"
                      placeholder="e.g. India"
                      required="Country is required"
                      error={errors.homeCountry}
                      name="homeCountry"
                      register={register}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Input
                      label="Longitude"
                      placeholder="e.g. 77.5040"
                      name="homeLongitude"
                      register={register}
                    />
                    <Input
                      label="Latitude"
                      placeholder="e.g. 28.4744"
                      name="homeLatitude"
                      register={register}
                    />
                  </div>
                </div>
              </div>

              {/* Current Address */}
              <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4 text-indigo-600" />
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Step 3B: Current Address <span className="text-rose-500">*</span>
                    </label>
                  </div>

                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md hover:bg-blue-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={sameAsHomeAddress}
                      onChange={(e) => handleToggleSameAddress(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Same as Home Address</span>
                  </label>
                </div>

                {!sameAsHomeAddress && (
                  <div className="space-y-3 animate-in fade-in duration-150">
                    <Input
                      label="Address Line 1"
                      placeholder="e.g. 456 Sector 18"
                      required="Current address line 1 is required"
                      error={errors.currentAddressLine1}
                      name="currentAddressLine1"
                      register={register}
                    />

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Input
                        label="City"
                        placeholder="e.g. Noida"
                        required="City is required"
                        error={errors.currentCity}
                        name="currentCity"
                        register={register}
                      />
                      <Input
                        label="State"
                        placeholder="e.g. Uttar Pradesh"
                        required="State is required"
                        error={errors.currentState}
                        name="currentState"
                        register={register}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Input
                        label="Postal Code"
                        placeholder="e.g. 201320"
                        required="Postal code is required"
                        error={errors.currentPostalCode}
                        name="currentPostalCode"
                        register={register}
                      />
                      <Input
                        label="Country"
                        placeholder="e.g. India"
                        required="Country is required"
                        error={errors.currentCountry}
                        name="currentCountry"
                        register={register}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Input
                        label="Longitude"
                        placeholder="e.g. 77.3910"
                        name="currentLongitude"
                        register={register}
                      />
                      <Input
                        label="Latitude"
                        placeholder="e.g. 28.5355"
                        name="currentLatitude"
                        register={register}
                      />
                    </div>
                  </div>
                )}

                {sameAsHomeAddress && (
                  <p className="text-xs text-slate-500 italic bg-white p-3 rounded-lg border border-slate-200">
                    Current address will automatically copy the Home Address specified above.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50/75 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              disabled={!selectedEmployee || selectedSkillIds.length === 0}
            >
              Register Technician
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddTechnicianModal
