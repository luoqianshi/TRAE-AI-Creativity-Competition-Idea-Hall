import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import MenuPage from '@/pages/MenuPage';
import GamePage from '@/pages/GamePage';

function AppRoutes() {
  const { phase } = useGameStore();

  return (
    <Routes>
      <Route
        path="/"
        element={phase === 'menu' ? <MenuPage /> : <Navigate to="/game" />}
      />
      <Route
        path="/game"
        element={phase !== 'menu' ? <GamePage /> : <Navigate to="/" />}
      />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
