'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

type CustomerContextType = {
  selectedCustomer: string | null
  setSelectedCustomer: (id: string | null) => void
}

// Context'i undefined başlatıyoruz
const CustomerContext = createContext<CustomerContextType | undefined>(undefined)

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null)

  return (
    <CustomerContext.Provider value={{ selectedCustomer, setSelectedCustomer }}>
      {children}
    </CustomerContext.Provider>
  )
}

export function useCustomer() {
  const ctx = useContext(CustomerContext)
  if (!ctx) {
    throw new Error(
      '❌ useCustomer hatası: Bu hook sadece <CustomerProvider> içinde kullanılabilir.'
    )
  }
  return ctx
}
