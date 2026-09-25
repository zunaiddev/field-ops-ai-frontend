import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type FC,
  type ReactNode,
} from 'react'
import { Button } from '../components/ui/Button'
import { CloseIcon } from '../components/icons'

export type AlertVariant = 'danger' | 'warning' | 'info' | 'success'

export interface AlertModalOptions {
  title: string
  message: ReactNode
  confirmText?: string
  cancelText?: string
  variant?: AlertVariant
}

interface AlertModalContextType {
  showAlert: (options: AlertModalOptions) => Promise<void>
  showConfirm: (options: AlertModalOptions) => Promise<boolean>
  alert: (options: AlertModalOptions) => Promise<void>
  confirm: (options: AlertModalOptions) => Promise<boolean>
}

const AlertModalContext = createContext<AlertModalContextType | undefined>(undefined)

export const AlertModalProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isConfirm, setIsConfirm] = useState(false)
  const [options, setOptions] = useState<AlertModalOptions>({
    title: '',
    message: '',
    variant: 'info',
  })

  const resolverRef = useRef<((value: boolean) => void) | null>(null)

  const showAlert = useCallback((opts: AlertModalOptions): Promise<void> => {
    return new Promise<void>((resolve) => {
      setOptions(opts)
      setIsConfirm(false)
      resolverRef.current = () => resolve()
      setIsOpen(true)
    })
  }, [])

  const showConfirm = useCallback((opts: AlertModalOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setOptions(opts)
      setIsConfirm(true)
      resolverRef.current = resolve
      setIsOpen(true)
    })
  }, [])

  const handleConfirm = () => {
    setIsOpen(false)
    if (resolverRef.current) {
      resolverRef.current(true)
      resolverRef.current = null
    }
  }

  const handleCancel = () => {
    setIsOpen(false)
    if (resolverRef.current) {
      resolverRef.current(false)
      resolverRef.current = null
    }
  }

  const variant = options.variant || (isConfirm ? 'warning' : 'info')

  const variantConfig: Record<
    AlertVariant,
    { iconBg: string; iconColor: string; buttonVariant: 'primary' | 'danger' | 'outline' }
  > = {
    danger: {
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-600',
      buttonVariant: 'danger',
    },
    warning: {
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      buttonVariant: 'primary',
    },
    info: {
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      buttonVariant: 'primary',
    },
    success: {
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      buttonVariant: 'primary',
    },
  }

  const currentVariant = variantConfig[variant]

  return (
    <AlertModalContext.Provider
      value={{
        showAlert,
        showConfirm,
        alert: showAlert,
        confirm: showConfirm,
      }}
    >
      {children}

      {/* Global Alert / Confirm Modal Dialog */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button top right */}
            <button
              type="button"
              onClick={handleCancel}
              className="absolute top-4 right-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <CloseIcon className="h-5 w-5" />
            </button>

            <div className="flex items-start gap-4">
              {/* Variant Icon */}
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${currentVariant.iconBg} ${currentVariant.iconColor}`}
              >
                {variant === 'danger' && (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />
                  </svg>
                )}
                {variant === 'warning' && (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                    />
                  </svg>
                )}
                {variant === 'info' && (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                    />
                  </svg>
                )}
                {variant === 'success' && (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
              </div>

              {/* Title and Message */}
              <div className="flex-1 pr-6">
                <h3 className="text-base font-bold text-slate-900 leading-6">{options.title}</h3>
                <div className="mt-2 text-xs text-slate-600 leading-relaxed">
                  {options.message}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
              {isConfirm && (
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={handleCancel}
                >
                  {options.cancelText || 'Cancel'}
                </Button>
              )}
              <Button
                type="button"
                variant={currentVariant.buttonVariant}
                size="md"
                onClick={handleConfirm}
              >
                {options.confirmText || (isConfirm ? 'Confirm' : 'Got it')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AlertModalContext.Provider>
  )
}

export const useAlertModal = () => {
  const context = useContext(AlertModalContext)
  if (!context) {
    throw new Error('useAlertModal must be used within an AlertModalProvider')
  }
  return context
}
