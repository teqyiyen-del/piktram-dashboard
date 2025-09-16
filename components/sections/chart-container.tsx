import { ReactNode } from 'react'
import { Card } from './card'

interface ChartContainerProps {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}

export function ChartContainer({ title, description, actions, children, className }: ChartContainerProps) {
  return (
    <Card title={title} description={description} actions={actions} className={className} contentClassName="mt-6">
      <div className="h-72 w-full">
        {children}
      </div>
    </Card>
  )
}
