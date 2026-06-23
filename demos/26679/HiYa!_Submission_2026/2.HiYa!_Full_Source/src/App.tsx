import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { playRandomSyllable } from "@/lib/sfx";
import { useTheme } from "@/hooks/useTheme";
import { initStatusBar } from "@/lib/statusBar";
import { useBackupFileListener } from "@/hooks/useBackupFileListener";
import Index from "./pages/Index";
import RecordPage from "./pages/RecordPage";
import HistoryPage from "./pages/HistoryPage";
import EntryDetailPage from "./pages/EntryDetailPage";
import SettingsPage from "./pages/SettingsPage";
import ThemeStorePage from "./pages/ThemeStorePage";
import WelcomePage from "./pages/WelcomePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Theme wrapper component
const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  useTheme(); // This applies theme on mount and listens for system changes
  return <>{children}</>;
};

// Welcome guard component
const WelcomeGuard = ({ children }: { children: React.ReactNode }) => {
  const hasSeenWelcome = localStorage.getItem('haiya_welcome_seen') === 'true';
  
  if (!hasSeenWelcome && window.location.hash !== '#/welcome') {
    return <Navigate to="/welcome" replace />;
  }
  
  return <>{children}</>;
};

const BackupFileListenerSetup = () => { useBackupFileListener(); return null; };

const App = () => {
  useEffect(() => {
    // Initialize status bar for immersive mode on Capacitor
    initStatusBar();
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest(
        'button, a, [role="button"], input[type="button"], input[type="submit"], summary'
      ) as HTMLElement | null;

      if (!interactive) return;
      // allow opting out in rare cases
      if (interactive.getAttribute("data-sfx") === "off") return;

      playRandomSyllable();
    };

    // capture so we still play even if a component stops propagation
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AppProvider>
            <BackupFileListenerSetup />
            <Toaster />
            <Sonner />
            <HashRouter>
              <Routes>
                <Route path="/welcome" element={<WelcomePage />} />
                <Route path="/" element={<WelcomeGuard><Index /></WelcomeGuard>} />
                <Route path="/record" element={<WelcomeGuard><RecordPage /></WelcomeGuard>} />
                <Route path="/history" element={<WelcomeGuard><HistoryPage /></WelcomeGuard>} />
                <Route path="/entry/:date" element={<WelcomeGuard><EntryDetailPage /></WelcomeGuard>} />
                <Route path="/settings" element={<WelcomeGuard><SettingsPage /></WelcomeGuard>} />
                <Route path="/theme-store" element={<WelcomeGuard><ThemeStorePage /></WelcomeGuard>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </HashRouter>
          </AppProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
