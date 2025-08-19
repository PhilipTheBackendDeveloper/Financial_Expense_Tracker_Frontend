"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Navigation } from "@/components/navigation"
import { Dashboard } from "@/components/dashboard"
import { SignInUp } from "@/components/sign-in-up"
import { AddExpense } from "@/components/add-expense"
import { AddBudget } from "@/components/add-budget"
import { BudgetSettings } from "@/components/budget-settings"
import { Reports } from "@/components/reports"
import { LoadingSpinner } from "@/components/loading-spinner"
import type { Page } from "@/lib/types"

export default function App() {
  const { user, loading, logout } = useAuth()
  const [currentPage, setCurrentPage] = useState<Page>("dashboard")

  // Show loading spinner while auth is initializing
  if (loading) {
    return <LoadingSpinner />
  }

  // Show sign in page if not authenticated
  if (!user) {
    return <SignInUp />
  }

  const handleSignOut = async () => {
    try {
      await logout()
      setCurrentPage("dashboard")
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard onNavigate={setCurrentPage} />
      case "add-expense":
        return <AddExpense onNavigate={setCurrentPage} />
      case "add-budget":
        return <AddBudget onNavigate={setCurrentPage} />
      case "budget-settings":
        return <BudgetSettings onNavigate={setCurrentPage} />
      case "reports":
        return <Reports />
      default:
        return <Dashboard onNavigate={setCurrentPage} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} onSignOut={handleSignOut} user={user} />
      <main className="pt-16">{renderPage()}</main>
    </div>
  )
}
