import { forwardRef, useId, type ReactNode, type SelectHTMLAttributes } from 'react'
import {
  type FormIntegrationProps,
  type FormFieldError,
  getErrorMessage,
  buildFieldRules,
  mergeRefs,
} from './formUtils'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'error' | 'required'>,
    FormIntegrationProps {
  label?: string
  helperText?: string
  error?: FormFieldError
  required?: boolean | string
  options?: SelectOption[]
  containerClassName?: string
  placeholder?: string
  children?: ReactNode
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helperText,
      error,
      id,
      name: nameProp,
      register,
      rules,
      registration,
      trim = true,
      options = [],
      placeholder,
      children,
      className = '',
      containerClassName = '',
      required,
      disabled,
      onChange,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId()
    const selectId = id || generatedId
    const errorId = `${selectId}-error`
    const helperId = `${selectId}-helper`

    const resolvedRules = buildFieldRules(rules, required, trim, label || nameProp)
    const formRegistration =
      registration || (register && nameProp ? register(nameProp, resolvedRules) : undefined)

    const isRequired = Boolean(required || rules?.required || formRegistration?.required)
    const errorMessage = getErrorMessage(error)
    const isInvalid = Boolean(errorMessage)

    const selectName = formRegistration?.name || nameProp

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label
            htmlFor={selectId}
            className="mb-1.5 block text-xs font-medium text-slate-700 sm:text-sm"
          >
            {label}
            {isRequired && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        <div className="relative rounded-lg shadow-xs">
          <select
            id={selectId}
            name={selectName}
            disabled={disabled}
            aria-invalid={isInvalid}
            aria-describedby={isInvalid ? errorId : helperText ? helperId : undefined}
            className={`block w-full appearance-none rounded-lg border bg-white px-3.5 py-2 pr-9 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${
              isInvalid
                ? 'border-red-500 text-red-900 focus:border-red-500 focus:ring-red-500/20'
                : 'border-slate-300 focus:border-blue-600 focus:ring-blue-600/20'
            } ${className}`}
            {...formRegistration}
            {...props}
            ref={mergeRefs(ref, formRegistration?.ref)}
            onChange={(e) => {
              formRegistration?.onChange?.(e)
              onChange?.(e)
            }}
            onBlur={(e) => {
              formRegistration?.onBlur?.(e)
              onBlur?.(e)
            }}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.length > 0
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {isInvalid ? (
          <p id={errorId} className="mt-1.5 flex items-center gap-1 text-xs text-red-600" role="alert">
            <svg
              className="h-3.5 w-3.5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{errorMessage}</span>
          </p>
        ) : helperText ? (
          <p id={helperId} className="mt-1.5 text-xs text-slate-500">
            {helperText}
          </p>
        ) : null}
      </div>
    )
  },
)

Select.displayName = 'Select'

export default Select
