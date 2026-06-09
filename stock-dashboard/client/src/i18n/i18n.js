import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import he from './locales/he.json';
import ar from './locales/ar.json';
import fr from './locales/fr.json';
import es from './locales/es.json';

const savedLang = localStorage.getItem('language') || 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    he: { translation: he },
    ar: { translation: ar },
    fr: { translation: fr },
    es: { translation: es },
  },
  lng: savedLang,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
  // Handle RTL for Hebrew and Arabic
  if (lng === 'he' || lng === 'ar') {
    document.documentElement.dir = 'rtl';
    document.documentElement.classList.add('rtl');
  } else {
    document.documentElement.dir = 'ltr';
    document.documentElement.classList.remove('rtl');
  }
});

// Set initial dir
if (savedLang === 'he' || savedLang === 'ar') {
  document.documentElement.dir = 'rtl';
  document.documentElement.classList.add('rtl');
}

export default i18n;