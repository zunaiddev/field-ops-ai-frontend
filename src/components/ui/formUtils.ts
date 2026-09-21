import type React from 'react'
import type {
  FieldError,
  FieldErrorsImpl,
  Merge,
  RegisterOptions,
  UseFormRegisterReturn,
  ValidateResult,
} from 'react-hook-form'

export type FormFieldError =
  | string
  | FieldError
  | Merge<FieldError, FieldErrorsImpl<Record<string, unknown>>>
  | undefined

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FormRegister = (name: any, options?: any) => UseFormRegisterReturn

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FormRegisterRules = RegisterOptions<any, any>

export interface FormIntegrationProps {
  name?: string
  register?: FormRegister
  rules?: FormRegisterRules
  registration?: UseFormRegisterReturn
  trim?: boolean
}

export function getErrorMessage(error?: FormFieldError): string | undefined {
  if (!error) return undefined
  if (typeof error === 'string') return error
  if (typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message
  }
  return undefined
}

export function buildFieldRules(
  rules?: FormRegisterRules,
  required?: boolean | string,
  trim = true,
  labelOrName?: string,
): FormRegisterRules | undefined {
  if (!rules && !required) return undefined

  const finalRules: FormRegisterRules = { ...rules }

  if (required && !finalRules.required) {
    finalRules.required =
      typeof required === 'string' ? required : `${labelOrName || 'This field'} is required`
  }

  if (finalRules.required && trim) {
    const reqMsg =
      typeof finalRules.required === 'string'
        ? finalRules.required
        : `${labelOrName || 'This field'} is required`

    const existingValidate = finalRules.validate

    if (typeof existingValidate === 'function') {
      finalRules.validate = (value: unknown, formValues: unknown): ValidateResult | Promise<ValidateResult> => {
        if (typeof value === 'string' && value.trim().length === 0) {
          return reqMsg
        }
        return existingValidate(value, formValues)
      }
    } else if (typeof existingValidate === 'object' && existingValidate !== null) {
      finalRules.validate = {
        notEmpty: (value: unknown) =>
          typeof value === 'string' && value.trim().length === 0 ? reqMsg : true,
        ...existingValidate,
      }
    } else {
      finalRules.validate = (value: unknown) => {
        if (typeof value === 'string' && value.trim().length === 0) {
          return reqMsg
        }
        return true
      }
    }
  }

  return finalRules
}

export function setRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') {
    ref(value)
  } else if (ref !== null && ref !== undefined) {
    ;(ref as React.MutableRefObject<T | null>).current = value
  }
}

export function mergeRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
  return (node: T | null) => {
    refs.forEach((ref) => setRef(ref, node))
  }
}
