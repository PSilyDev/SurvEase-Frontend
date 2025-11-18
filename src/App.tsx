import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CreateSurvey from "./pages/CreateSurvey";
import SurveyBuilder from "./pages/SurveyBuilder";
import BuilderPreview from "./pages/BuilderPreview";
import TakeSurvey from "./pages/TakeSurvey";
import Analytics from "./pages/Analytics";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import AppNav from "./components/AppNav";
import AdminResponses from "./pages/AdminResponses";
import Signup from "./pages/Signup";

export default function App() {
  return (
    <div className="min-h-screen bg-[#0b0d10] text-white">
      <AppNav />
      <main className="p-4 sm:p-8">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/take/:category/:survey" element={<TakeSurvey />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/create" element={<CreateSurvey />} />
            <Route path="/builder" element={<SurveyBuilder />} />
            <Route path="/builder/preview" element={<BuilderPreview />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/admin/responses" element={<AdminResponses />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}
