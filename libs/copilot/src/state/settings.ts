import { atom } from 'recoil';

/**
 * Copilot widget-specific settings
 * Not persisted to storage - defaults to closed
 */
export const copilotSettingsState = atom({
  key: 'CopilotSettings',
  default: {
    isSidebarOpen: false // Default: closed
  }
});
