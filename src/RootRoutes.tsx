import { Route, Routes } from "react-router-dom";
import App from "./App";
import { LegalNoticePage } from "./pages/legal/LegalNoticePage";
import { PrivacyPage } from "./pages/legal/PrivacyPage";
import { ContactPage } from "./pages/legal/ContactPage";

export function RootRoutes() {
  return (
    <Routes>
      <Route path="/aviso-legal" element={<LegalNoticePage />} />
      <Route path="/privacidad" element={<PrivacyPage />} />
      <Route path="/contacto" element={<ContactPage />} />
      <Route path="*" element={<App />} />
    </Routes>
  );
}
