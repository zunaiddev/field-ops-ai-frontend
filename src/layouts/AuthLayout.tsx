import type { FC, ReactNode } from 'react'
import { FieldOpsLogo } from '../components/ui/FieldOpsLogo'

export interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
  cardMaxWidth?: 'sm' | 'md' | 'lg' | 'xl'
  footer?: ReactNode
}

export const AuthLayout: FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  cardMaxWidth = 'md',
  footer,
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className={`mx-auto w-full ${maxWidthClasses[cardMaxWidth]}`}>
        <div className="mb-6 flex flex-col items-center text-center">
          <FieldOpsLogo size="md" />
          <h1 className="mt-5 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            {title}
          </h1>
          {subtitle && <p className="mt-1.5 text-xs text-slate-500 sm:text-sm">{subtitle}</p>}
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8">
          {children}
        </div>

        {footer && <div className="mt-6 text-center text-xs text-slate-500 sm:text-sm">{footer}</div>}
      </div>
    </div>
  )
}

export default AuthLayout
