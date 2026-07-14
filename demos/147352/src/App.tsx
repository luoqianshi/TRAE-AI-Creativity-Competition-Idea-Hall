import { useState } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import AddRecord from "@/pages/AddRecord";
import GiftBook from "@/pages/GiftBook";
import FriendDetail from "@/pages/FriendDetail";
import BatchGift from "@/pages/BatchGift";
import Reminders from "@/pages/Reminders";
import Profile from "@/pages/Profile";
import Search from "@/pages/Search";
import LockScreen from "@/components/LockScreen";
import ReminderAlert from "@/components/ReminderAlert";
import { useAppStore } from "@/store/useAppStore";

export default function App() {
  const appPassword = useAppStore((s) => s.appPassword);
  const [unlocked, setUnlocked] = useState(false);

  // 有密码且未解锁时显示锁屏
  if (appPassword && !unlocked) {
    return <LockScreen onSuccess={() => setUnlocked(true)} />;
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add" element={<AddRecord />} />
        <Route path="/gift-book" element={<GiftBook />} />
        <Route path="/friend/:id" element={<FriendDetail />} />
        <Route path="/gift-book/batch/:id" element={<BatchGift />} />
        <Route path="/reminders" element={<Reminders />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/search" element={<Search />} />
      </Routes>
      <ReminderAlert />
    </HashRouter>
  );
}
