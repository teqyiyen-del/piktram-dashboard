'use client'

import * as React from 'react'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode
}

export function Select({ className = '', children, ...props }: SelectProps) {
  return (
    <select
      className={`w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 
      text-sm text-gray-900 shadow-sm
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent 
      focus-visible:ring-offset-2
      disabled:cursor-not-allowed disabled:opacity-50
      dark:border-gray-700 dark:bg-gray-800 dark:text-white
      ${className}`}
      onChange={(e) => {
        console.log('Selected value:', e.target.value) // ✅ debug için
        props.onChange?.(e)
      }}
      {...props}
    >
      {children}
    </select>
  )
}

export function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  return <option value={value}>{children}</option>
}
