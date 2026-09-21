import type { FC, ReactNode } from 'react'
import { Link } from 'react-router-dom'

export interface AuthPromptProps {
  text?: ReactNode
  prompt?: ReactNode
  linkText: ReactNode
  to: string
  className?: string
  linkClassName?: string
}

export const AuthPrompt: FC<AuthPromptProps> = ({
  text,
  prompt,
  linkText,
  to,
  className = '',
  linkClassName = 'font-medium text-blue-600 hover:text-blue-700 hover:underline',
}) => {
  const message = prompt ?? text

  return (
    <p className={className || undefined}>
      {message && <>{message}{' '}</>}
      <Link to={to} className={linkClassName}>
        {linkText}
      </Link>
    </p>
  )
}

export default AuthPrompt
