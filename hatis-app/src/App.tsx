import { Routes, Route } from "react-router-dom";
import Catalogue from "./pages/Catalogue";
import Profile from "./pages/Profile";
import BecomeCreator from "./pages/BecomeCreator";
import Login from "./pages/Login";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Catalogue />} />
      <Route path="/become-creator" element={<BecomeCreator />} />
      <Route path="/login" element={<Login />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/dashboard" element={<Dashboard />} />
      {/* Keep this last — it catches any other path as a creator username. */}
      <Route path="/:slug" element={<Profile />} />
    </Routes>
  );
}