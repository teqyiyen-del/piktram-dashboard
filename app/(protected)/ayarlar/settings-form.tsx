'use client'

import SettingsForm from './settings-form'
import type { Profile } from '@/lib/types'

export default function SettingsForm({ profile }: { profile: Profile }) {
  return <SettingsForm profile={profile} />
}
