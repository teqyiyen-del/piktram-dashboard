'use client'

import * as React from 'react'

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void
}

export function Switch({ className = '', onCheckedChange, ...props }: SwitchProps) {
  return (
    <label className="relative inline-flex cursor-pointer items-center">
      <input
        type="checkbox"
        className="peer sr-only"
        onChange={(e) => {
          props.onChange?.(e) // native onChange varsa tetikle
          onCheckedChange?.(e.target.checked) // bizim özel handler
        }}
        {...props}
      />
      <div
        className={`peer h-6 w-11 rounded-full bg-gray-300 
        after:absolute after:left-[2px] after:top-[2px] 
        after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all 
        peer-checked:bg-accent peer-checked:after:translate-x-full ${className}`}
      />
    </label>
  )
}
