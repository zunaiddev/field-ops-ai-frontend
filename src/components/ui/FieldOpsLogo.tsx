import type { FC } from 'react'

interface FieldOpsLogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export const FieldOpsLogo: FC<FieldOpsLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const iconSizes = {
    sm: 'h-7 w-7',
    md: 'h-9 w-9',
    lg: 'h-11 w-11',
  }

  const textSizes = {
    sm: 'text-base font-semibold',
    md: 'text-xl font-bold',
    lg: 'text-2xl font-bold',
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div
        className={`${iconSizes[size]} flex items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm ring-1 ring-blue-700/30`}
      >
        {/* Clean geometric operations & field telemetry mark */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`tracking-tight text-slate-900 ${textSizes[size]}`}>FieldOps</span>
            <span className="rounded bg-blue-50 px-1.5 py-0.5 text-xs font-semibold tracking-wide text-blue-700 ring-1 ring-blue-700/10">
              AI
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default FieldOpsLogo
