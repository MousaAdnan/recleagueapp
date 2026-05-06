import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import MatchesPage from './pages/MatchesPage';
import MatchDetailPage from './pages/MatchDetailPage';
import StatsPage from './pages/StatsPage';
import PlayerPage from './pages/PlayerPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/"           element={<MatchesPage />} />
        <Route path="/match/:id"  element={<MatchDetailPage />} />
        <Route path="/stats"      element={<StatsPage />} />
        <Route path="/player/:id" element={<PlayerPage />} />
        <Route path="/admin"      element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}
