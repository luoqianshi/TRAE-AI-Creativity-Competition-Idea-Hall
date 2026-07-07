import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "@/components/Layout/Header";
import Dashboard from "@/pages/Dashboard";
import Inventory from "@/pages/Inventory";
import Records from "@/pages/Records";

export default function App() {
  return (
    <Router>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/records" element={<Records />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </main>
        <footer className="border-t border-herbal/12 bg-paper-light/60 py-6">
          <div className="container flex flex-col items-center gap-1 text-center">
            <p className="font-brush text-lg text-ochre">愿君康健 · 药到病除</p>
            <p className="font-latin text-xs tracking-wide text-ink-soft">
              Family Med Manager · 数据保存在本地浏览器
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}
