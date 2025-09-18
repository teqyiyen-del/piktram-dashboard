import * as React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm 
        placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 
        focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed 
        disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white ${className}`}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'
export { Input }
