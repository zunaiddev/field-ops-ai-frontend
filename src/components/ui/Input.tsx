import { forwardRef, type InputHTMLAttributes, type ReactNode, useId } from 'react'
import {
  buildFieldRules,
  type FormFieldError,
  type FormIntegrationProps,
  getErrorMessage,
  mergeRefs,
} from '../../utils/formUtils'

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'error' | 'required'>,
    FormIntegrationProps {
  label?: string
  helperText?: string
  error?: FormFieldError
  required?: boolean | string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  containerClassName?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
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
      className = '',
      containerClassName = '',
      required,
      disabled,
      leftIcon,
      rightIcon,
      type = 'text',
      onChange,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId()
    const inputId = id || generatedId
    const errorId = `${inputId}-error`
    const helperId = `${inputId}-helper`

    const resolvedRules = buildFieldRules(rules, required, trim, label || nameProp)
    const formRegistration =
      registration || (register && nameProp ? register(nameProp, resolvedRules) : undefined)

    const isRequired = Boolean(required || rules?.required || formRegistration?.required)
    const errorMessage = getErrorMessage(error)
    const isInvalid = Boolean(errorMessage)

    const inputName = formRegistration?.name || nameProp

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-xs font-medium text-slate-700 sm:text-sm"
          >
            {label}
            {isRequired && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        <div className="relative rounded-lg shadow-xs">
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            name={inputName}
            type={type}
            disabled={disabled}
            aria-invalid={isInvalid}
            aria-describedby={isInvalid ? errorId : helperText ? helperId : undefined}
            className={`block w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${
              leftIcon ? 'pl-9' : ''
            } ${rightIcon ? 'pr-9' : ''} ${
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
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
              {rightIcon}
            </div>
          )}
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

Input.displayName = 'Input'

export default Input
