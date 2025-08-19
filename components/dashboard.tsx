"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MonthSelector } from "@/components/month-selector"
import { LoadingSkeleton, CardSkeleton } from "@/components/loading-spinner"
import { CustomPieChart } from "@/components/charts/pie-chart"
import { Plus, DollarSign, Target, TrendingDown, PieChart, AlertTriangle, CheckCircle, Settings } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { apiClient } from "@/lib/api"
import { formatCurrency, getCurrentMonth } from "@/lib/utils"
import type { Page, SummaryData, ReportData } from "@/lib/types"

interface DashboardProps {
  onNavigate: (page: Page) => void
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { user } = useAuth()
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user, selectedMonth])

  const loadDashboardData = async () => {
    if (!user) return

    setLoading(true)
    setError("")

    try {
      // Load summary data
      const summaryResponse = await apiClient.getSummary(user.uid, selectedMonth)
      if (summaryResponse.success) {
        setSummaryData(summaryResponse.data)
      } else {
        throw new Error(summaryResponse.error || "Failed to load summary")
      }

      // Load report data for category breakdown
      const reportResponse = await apiClient.getReport(user.uid, selectedMonth)
      if (reportResponse.success) {
        setReportData(reportResponse.data)
      } else {
        console.warn("Failed to load report data:", reportResponse.error)
        setReportData(null)
      }
    } catch (error: any) {
      setError(error.message || "Failed to load dashboard data")
      console.error("Dashboard error:", error)
    } finally {
      setLoading(false)
    }
  }

  const getBudgetStatus = () => {
    if (!summaryData) return { type: "info" as const, message: "Loading..." }

    const overBudgetCategories = reportData
      ? Object.values(reportData.expenses_by_category).filter((cat) => cat.over_budget)
      : []

    if (summaryData.budget_status === "no_budget") {
      return {
        type: "warning" as const,
        message: "No budgets set for this month. Set up your budgets to track spending.",
      }
    }

    if (summaryData.budget_status === "over_budget") {
      return {
        type: "warning" as const,
        message: `You're over budget by ${formatCurrency(Math.abs(summaryData.remaining_budget))}. ${overBudgetCategories.length} categories exceeded their limits.`,
      }
    }

    return {
      type: "success" as const,
      message: `Great job! You have ${formatCurrency(summaryData.remaining_budget)} remaining in your budget.`,
    }
  }

  const budgetStatus = getBudgetStatus()

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <LoadingSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={loadDashboardData} className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your financial progress</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
          <MonthSelector value={selectedMonth} onValueChange={setSelectedMonth} className="w-[180px]" />
        </div>
      </div>

      {/* Budget Status Alert */}
      <Alert
        className={`mb-8 ${
          budgetStatus.type === "warning"
            ? "border-orange-200 bg-orange-50"
            : budgetStatus.type === "success"
              ? "border-green-200 bg-green-50"
              : "border-blue-200 bg-blue-50"
        }`}
      >
        <div className="flex items-center space-x-2">
          {budgetStatus.type === "warning" ? (
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          ) : budgetStatus.type === "success" ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <Target className="h-4 w-4 text-blue-600" />
          )}
          <AlertDescription
            className={
              budgetStatus.type === "warning"
                ? "text-orange-800"
                : budgetStatus.type === "success"
                  ? "text-green-800"
                  : "text-blue-800"
            }
          >
            {budgetStatus.message}
          </AlertDescription>
        </div>
      </Alert>

      {/* Summary Cards */}
      {summaryData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(summaryData.total_expenses)}</div>
              <p className="text-xs text-muted-foreground">{summaryData.expense_count} transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(summaryData.total_budget)}</div>
              <p className="text-xs text-muted-foreground">{summaryData.budget_count} budgets set</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Remaining Budget</CardTitle>
              <DollarSign
                className={`h-4 w-4 ${summaryData.remaining_budget >= 0 ? "text-green-600" : "text-red-600"}`}
              />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  summaryData.remaining_budget >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatCurrency(Math.abs(summaryData.remaining_budget))}
              </div>
              <p className="text-xs text-muted-foreground">
                {summaryData.remaining_budget >= 0 ? "Under budget" : "Over budget"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget Usage</CardTitle>
              <Target
                className={`h-4 w-4 ${
                  summaryData.budget_usage_percent > 90
                    ? "text-red-600"
                    : summaryData.budget_usage_percent > 75
                      ? "text-orange-600"
                      : "text-green-600"
                }`}
              />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  summaryData.budget_usage_percent > 90
                    ? "text-red-600"
                    : summaryData.budget_usage_percent > 75
                      ? "text-orange-600"
                      : "text-green-600"
                }`}
              >
                {summaryData.budget_usage_percent.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Of total budget used</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Button onClick={() => onNavigate("add-expense")} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Expense</span>
        </Button>
        <Button variant="outline" onClick={() => onNavigate("add-budget")} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Budget</span>
        </Button>
        <Button variant="outline" onClick={() => onNavigate("budget-settings")} className="flex items-center space-x-2">
          <Settings className="h-4 w-4" />
          <span>Budget Settings</span>
        </Button>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenses by Category Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>Expenses by Category</span>
            </CardTitle>
            <CardDescription>Breakdown of your spending by category</CardDescription>
          </CardHeader>
          <CardContent>
            {reportData?.pie_chart_data ? (
              <CustomPieChart data={reportData.pie_chart_data} />
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <PieChart className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses yet</h3>
                <p className="text-gray-600 text-center mb-4">Start tracking your expenses to see spending patterns.</p>
                <Button onClick={() => onNavigate("add-expense")} size="sm">
                  Add Your First Expense
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Budget vs Expenses Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Budget vs Expenses</span>
            </CardTitle>
            <CardDescription>Compare your spending against set budgets</CardDescription>
          </CardHeader>
          <CardContent>
            {!reportData || Object.keys(reportData.expenses_by_category).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Target className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
                <p className="text-gray-600 text-center mb-4">Add expenses and budgets to see comparisons.</p>
                <div className="flex gap-2">
                  <Button onClick={() => onNavigate("add-expense")} size="sm" variant="outline">
                    Add Expense
                  </Button>
                  <Button onClick={() => onNavigate("add-budget")} size="sm">
                    Add Budget
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(reportData.expenses_by_category).map(([category, data]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-sm font-medium">{category}</span>
                        {data.over_budget && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">{formatCurrency(data.total_amount)}</div>
                        <div className="text-xs text-gray-500">of {formatCurrency(data.budget)}</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${data.over_budget ? "bg-red-500" : "bg-blue-500"}`}
                        style={{ width: `${Math.min((data.total_amount / data.budget) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      {data.over_budget
                        ? `${formatCurrency(data.total_amount - data.budget)} over budget`
                        : `${formatCurrency(data.budget - data.total_amount)} remaining`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
