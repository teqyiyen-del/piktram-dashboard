import { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-muted dark:bg-muted-dark">
      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Sol taraf - Desktop için aside */}
        <aside className="relative hidden w-full max-w-xl flex-col justify-between overflow-hidden rounded-br-[48px] bg-gradient-to-br from-[#FF5E4A] via-[#FF7A66] to-[#FF947D] px-12 pb-12 pt-16 text-white shadow-[0_40px_90px_-50px_rgba(255,94,74,0.6)] lg:flex">
          <div className="space-y-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl font-bold text-white">
              P
            </div>
            <h2 className="text-3xl font-semibold leading-snug">
              Takımının hedeflerini tek bakışta yönet.
            </h2>
            <p className="text-sm text-white/80">
              Piktram ile projeleri, görevleri ve takvimi tek panelde topla. 
              Sürükle-bırak panolar, dosya ekleri ve gerçek zamanlı güncellemelerle üretkenliği artır.
            </p>
          </div>
          <div className="rounded-3xl bg-white/10 p-6 text-sm text-white/80 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">
              Piktram avantajları
            </p>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-3">
                <span className="mt-1 block h-2 w-2 rounded-full bg-white"></span>
                Görev durumu güncellemeleri Supabase ile anında senkronize edilir.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 block h-2 w-2 rounded-full bg-white"></span>
                Yönetici paneli ile tüm çalışma alanını tek bakışta izleyin.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 block h-2 w-2 rounded-full bg-white"></span>
                Türkçe arayüz ve Piktram renk paletiyle modern SaaS deneyimi.
              </li>
            </ul>
          </div>
        </aside>

        {/* Sağ taraf - Form alanı */}
        <main className="flex flex-1 items-center justify-center px-6 py-12 sm:px-12">
          <div className="w-full max-w-md space-y-8 rounded-[32px] bg-white p-10 shadow-[0_25px_60px_-40px_rgba(15,23,42,0.45)] dark:bg-surface-dark">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-2xl font-bold text-white shadow-brand-sm">
                P
              </div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Piktram</h1>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Takım verimliliği için modern proje ve görev yönetimi platformu.
              </p>
            </div>
            {children}
          </div>
        </main>
      </div>

      {/* Footer (mobile için de geçerli) */}
      <div className="lg:hidden">
        <div className="px-6 pb-10 text-sm text-gray-500 dark:text-gray-400">
          <p className="text-center">
            © {new Date().getFullYear()} Piktram. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </div>
  )
}
