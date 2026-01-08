import React, { useEffect, useRef } from "react";
import useSettingStore from "@/hooks/use-setting-store";
import { ClientSetting } from "@/types";

export default function AppInitializer({
  setting,
  children,
}: {
  setting: ClientSetting;
  children: React.ReactNode;
}) {
  const initialized = useRef(false);

  // Initialize settings synchronously on first render to avoid blocking
  if (!initialized.current) {
    useSettingStore.setState({ setting });
    initialized.current = true;
  }

  // Keep settings updated if they change
  useEffect(() => {
    useSettingStore.setState({ setting });
  }, [setting]);

  // Return children immediately - no blocking render
  return children;
}
