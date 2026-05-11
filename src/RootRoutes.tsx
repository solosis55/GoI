import { Route, Routes } from "react-router-dom";
import App from "./App";
import { LegalNoticePage } from "./pages/legal/LegalNoticePage";
import { PrivacyPage } from "./pages/legal/PrivacyPage";
import { ContactPage } from "./pages/legal/ContactPage";
import { PersonalRoadmapPage } from "./pages/PersonalRoadmapPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export function RootRoutes() {
  return (
    <Routes>
      <Route path="/aviso-legal" element={<LegalNoticePage />} />
      <Route path="/privacidad" element={<PrivacyPage />} />
      <Route path="/contacto" element={<ContactPage />} />
      <Route path="/roadmap" element={<PersonalRoadmapPage />} />
      <Route path="/" element={<App />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
