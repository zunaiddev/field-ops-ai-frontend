import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react'
import {
  type FormIntegrationProps,
  type FormFieldError,
  getErrorMessage,
  buildFieldRules,
  mergeRefs,
} from './formUtils'

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'error' | 'required'>,
    FormIntegrationProps {
  label: ReactNode
  description?: string
  error?: FormFieldError
  required?: boolean | string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      description,
      error,
      id,
      name: nameProp,
      register,
      rules,
      registration,
      className = '',
      disabled,
      required,
      onChange,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId()
    const checkboxId = id || generatedId

    const resolvedRules = buildFieldRules(
      rules,
      required,
      false,
      typeof label === 'string' ? label : nameProp,
    )
    const formRegistration =
      registration || (register && nameProp ? register(nameProp, resolvedRules) : undefined)
    const errorMessage = getErrorMessage(error)

    const checkboxName = formRegistration?.name || nameProp

    return (
      <div className="flex items-start">
        <div className="flex h-5 items-center">
          <input
            id={checkboxId}
            name={checkboxName}
            type="checkbox"
            disabled={disabled}
            className={`h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
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
          />
        </div>
        <div className="ml-2.5 text-xs sm:text-sm">
          <label
            htmlFor={checkboxId}
            className={`cursor-pointer select-none text-slate-700 ${
              disabled ? 'cursor-not-allowed opacity-60' : ''
            }`}
          >
            {label}
            {Boolean(required) && <span className="ml-1 text-red-500">*</span>}
          </label>
          {description && <p className="text-xs text-slate-500">{description}</p>}
          {errorMessage && <p className="mt-1 text-xs text-red-600">{errorMessage}</p>}
        </div>
      </div>
    )
  },
)

Checkbox.displayName = 'Checkbox'

export default Checkbox
