import { MockTest } from "./pages/MockTest";
import MockTestResult from "./pages/MockTestResult";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { AppLayout } from "./layouts/AppLayout";
import { Dashboard } from "./pages/Dashboard";
import { Speaking } from "./pages/Speaking";
import { Listening } from "./pages/Listening";
import { Reading } from "./pages/Reading";
import { Writing } from "./pages/Writing";
import { Vocabulary } from "./pages/Vocabulary";
import { Settings } from "./pages/Settings";

// import { Analytics } from "./pages/Analytics";

// 🚀 Import the Bouncer!
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="kaizen-theme">
      <Router>
        <Routes>
          {/* 🟢 PUBLIC ROUTES (Anyone can access) */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* 🔴 PROTECTED ROUTES (Bouncer checks ID first) */}
          <Route element={<ProtectedRoute />}>
            {/* If they pass the bouncer, load the App Layout */}
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/speaking" element={<Speaking />} />
              <Route path="/listening" element={<Listening />} />
              <Route path="/reading" element={<Reading />} />
              <Route path="/writing" element={<Writing />} />
              <Route path="/vocabulary" element={<Vocabulary />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Settings />} />
              <Route path="/mocktest" element={<MockTest />} />
              <Route path="/mocktest" element={<MockTest />} />
              <Route path="/mocktest/result/:id" element={<MockTestResult />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;