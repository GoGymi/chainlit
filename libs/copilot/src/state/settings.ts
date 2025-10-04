import { atom } from 'recoil';

const STORAGE_KEY = 'copilot_sidebar_open';

/**
 * Get initial sidebar state from localStorage
 * Defaults to true (open) if no value stored
 */
const getInitialSidebarState = (): boolean => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored !== null ? stored === 'true' : true; // Default: open
  } catch (error) {
    // Fallback for quota exceeded, private mode, or localStorage disabled
    console.debug('Could not read sidebar state from localStorage:', error);
    return true;
  }
};

/**
 * Copilot widget-specific settings
 * Persisted to localStorage for better UX
 */
export const copilotSettingsState = atom({
  key: 'CopilotSettings',
  default: {
    isSidebarOpen: getInitialSidebarState()
  },
  effects: [
    ({ onSet }) => {
      onSet((newValue) => {
        try {
          localStorage.setItem(STORAGE_KEY, String(newValue.isSidebarOpen));
        } catch (error) {
          // Silently fail if localStorage is unavailable
          console.debug('Could not persist sidebar state:', error);
        }
      });
    }
  ]
});
