import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/app-shell'
import { ChecklistPage } from './pages/checklist-page'
import { DashboardPage } from './pages/dashboard-page'
import { FridgePage } from './pages/fridge-page'
import { MedicinesPage } from './pages/medicines-page'

export default function App() {
  return <Routes><Route element={<AppShell />}><Route index element={<DashboardPage />} /><Route path="fridge" element={<FridgePage />} /><Route path="medicines" element={<MedicinesPage />} /><Route path="checklist" element={<ChecklistPage />} /><Route path="*" element={<Navigate to="/" replace />} /></Route></Routes>
}
