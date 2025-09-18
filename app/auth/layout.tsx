import { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sol taraf - Form alanı */}
      <main className="flex flex-1 items-center justify-center px-6 py-12 sm:px-12 bg-white dark:bg-surface-dark">
        <div className="w-full max-w-md space-y-8 text-center">
          {/* Logo */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-2xl font-bold text-white shadow-brand-sm">
            P
          </div>

          {/* Form */}
          <div className="mt-6">{children}</div>
        </div>
      </main>

      {/* Sağ taraf - Gradient */}
      <aside className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-[#FF5E4A] via-[#FF7A66] to-[#FF947D]">
        <div className="text-white text-center space-y-4 px-10">
          <h2 className="text-3xl font-semibold">
            Takımının hedeflerini tek bakışta yönet
          </h2>
          <p className="text-sm text-white/90 max-w-md mx-auto">
            Piktram ile projeleri, görevleri ve takvimi tek panelde topla.
            Gerçek zamanlı güncellemeler ve modern arayüz ile verimliliğini artır.
          </p>
        </div>
      </aside>
    </div>
  )
}
