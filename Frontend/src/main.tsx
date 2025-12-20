import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { CssBaseline } from '@mui/material'
import { I18nextProvider, useTranslation } from 'react-i18next'
import './index.css'
import App from './App.tsx'
import i18n from './i18n.ts'
import { getBrandConfig } from './lib/utils/runtimeConfig'

function AppWithLang() {
  const { i18n } = useTranslation();
  const brandConfig = getBrandConfig();

  useEffect(() => {
    // Update document language when i18n language changes
    document.documentElement.lang = i18n.language;

    // Update document title with brand name
    document.title = brandConfig.name;
  }, [i18n.language, brandConfig.name]);

  return <App />;
}

export { AppWithLang };

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <CssBaseline />
      <AppWithLang />
    </I18nextProvider>
  </StrictMode>,
)
