export interface User {
  uid: string
  email: string | null
  displayName: string | null
}

export interface Expense {
  id: string
  amount: number
  category: string
  date: string
  note?: string
  created_at: string
  updated_at: string
}

export interface Budget {
  id: string
  amount: number
  category: string
  month: string
  created_at: string
  updated_at: string
}

export interface SummaryData {
  month: string
  total_expenses: number
  total_budget: number
  remaining_budget: number
  budget_usage_percent: number
  budget_status: "no_budget" | "under_budget" | "over_budget"
  expense_count: number
  budget_count: number
}

export interface CategoryExpense {
  total_amount: number
  count: number
  budget: number
  over_budget: boolean
  percentage: number
}

export interface PieChartData {
  name: string
  value: number
  percentage: number
}

export interface BarChartData {
  category: string
  expenses: number
  budget: number
  over_budget: boolean
}

export interface ReportData {
  month: string
  expenses_by_category: Record<string, CategoryExpense>
  top_spending_category: {
    category: string
    amount: number
  } | null
  over_budget_categories_count: number
  total_expenses: number
  total_categories: number
  pie_chart_data: PieChartData[]
  bar_chart_data: BarChartData[]
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export type Page = "signin" | "dashboard" | "add-expense" | "add-budget" | "budget-settings" | "reports"
