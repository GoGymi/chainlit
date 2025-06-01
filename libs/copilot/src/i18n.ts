import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const i18nConfig = {
  fallbackLng: 'en-US',
  defaultNS: 'translation',
  resources: {
    'en-US': {
      translation: {
        // Add default translations to prevent errors
        components: {
          molecules: {
            newChatButton: {
              newChat: 'New Chat'
            }
          }
        }
      }
    }
  }
};

export function i18nSetupLocalization(): void {
  i18n
    .use(initReactI18next)
    .init(i18nConfig)
    .catch((err) =>
      console.error('[Copilot i18n] Failed to setup localization.', err)
    );
}
