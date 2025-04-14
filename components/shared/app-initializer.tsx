import React, { useEffect } from 'react'
import useSettingStore from '@/hooks/use-setting-store'
import { ClientSetting } from '@/types'

export default function AppInitializer({
  setting,
  children,
}: {
  setting: ClientSetting
  children: React.ReactNode
}) {
  useEffect(() => {
    // Move setState to useEffect to avoid updating state during render
    useSettingStore.setState({
      setting,
    })
  }, [setting])

  return <>{children}</>
}
