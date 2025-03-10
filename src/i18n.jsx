import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import language JSON files
import en from './locales/en.json';
import fr from './locales/fr.json'; // Example for French

i18n.use(initReactI18next).init({
    resources: {
        en: { translation: en },
        fr: { translation: fr },
    },
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
        escapeValue: false, // react already handles escaping
    },
});

export default i18n;
