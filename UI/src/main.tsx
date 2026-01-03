import React from "react"
import "./i18n.ts"
import ReactDOM from "react-dom/client"
import App from "./App.tsx"
import { AuthProvider } from "./contexts/AuthContext.tsx"
import { getBrandConfig } from "./config/envConfig.ts"

const updateMetadata = () => {
  try {
    const brandConfig = getBrandConfig();

    document.title = brandConfig.name;
    const titleElement = document.getElementById('page-title');
    if (titleElement) {
      titleElement.textContent = brandConfig.name;
    }
    const faviconElement = document.getElementById('favicon') as HTMLLinkElement;
    if (faviconElement && brandConfig.logo) {
      faviconElement.href = brandConfig.logo;
    }
  } catch (error) {
    console.error('Failed to update brand metadata:', error);
  }
};

updateMetadata();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
