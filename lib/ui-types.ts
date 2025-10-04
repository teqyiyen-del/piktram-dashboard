import { ReactNode, CSSProperties, ElementType, HTMLAttributes } from 'react'

/**
 * Tüm componentlerde kullanılabilecek ortak props tipleri
 */

export type BaseProps = {
  /** Tailwind veya custom class eklemek için */
  className?: string
  /** Inline style için */
  style?: CSSProperties
  /** Oturum açmış kullanıcıyı componente aktarmak için */
  currentUser?: any
}

export type WithChildren = {
  /** İçeride render edilecek child elementler */
  children?: ReactNode
}

export type LayoutProps = {
  /** Header gizleme opsiyonu */
  hideHeader?: boolean
  /** Görsel varyant seçimi */
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  /** Component başka bir HTML element olarak render edilsin diye */
  as?: ElementType
  /** Geri kalan tüm props (ör: id, data-attribute vs.) */
  rest?: HTMLAttributes<HTMLDivElement>
}

export type StatCardProps = BaseProps &
  WithChildren &
  LayoutProps & {
    /** Kart başlığı */
    title: string
    /** Kart değeri */
    value: string | number
  }

export type TaskFormProps = BaseProps &
  WithChildren & {
    /** Görev tipi */
    type?: string
    /** Görev statüsü */
    status?: string
    /** Progress bilgisi */
    progress?: number
  }
