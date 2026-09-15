import type { ComponentType } from 'react'

export interface UIConfig {
  id: string
  name: string
  version: string
  features?: {
    charts?: boolean
    export?: boolean
    keyboardShortcuts?: boolean
  }
}

export interface UIAppProps {
  config: UIConfig
  onSwitchUI?: (uiId: string) => void
}

export interface UIModule {
  App: ComponentType<UIAppProps>
  meta: UIConfig
}
