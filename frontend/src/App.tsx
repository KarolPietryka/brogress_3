import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { StatsPage } from "./pages/StatsPage";
import { TrainingView } from "./pages/TrainingView";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<TrainingView />} />
        <Route path="stats" element={<StatsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
