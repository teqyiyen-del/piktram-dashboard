import { Profile } from '@/lib/types'
import { SettingsClient } from 'components/settings/settings-client'

interface SettingsFormProps {
  profile: Profile
}

export default function SettingsForm({ profile }: SettingsFormProps) {
  return <SettingsClient profile={profile} />
}
