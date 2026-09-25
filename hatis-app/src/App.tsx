import { Routes, Route } from "react-router-dom";
import Catalogue from "./pages/Catalogue";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Catalogue />} />
      <Route path="/:slug" element={<Profile />} />
    </Routes>
  );
}
