import type { ApiResponse, Expense, Budget, SummaryData, ReportData } from "./types"

const API_BASE_URL = "http://localhost:5000"

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  setToken(token: string | null) {
    this.token = token
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      }
    }
  }

  // Health check
  async healthCheck() {
    return this.request("/health")
  }

  // Expense endpoints
  async getExpenses(
    userId: string,
    month?: string,
  ): Promise<ApiResponse<{ expenses: Expense[]; month: string; total_count: number }>> {
    const params = month ? `?month=${month}` : ""
    return this.request(`/api/users/${userId}/expenses${params}`)
  }

  async addExpense(
    userId: string,
    expense: {
      amount: number
      category: string
      date: string
      note?: string
    },
  ): Promise<ApiResponse<{ message: string; expense: Expense }>> {
    return this.request(`/api/users/${userId}/expenses`, {
      method: "POST",
      body: JSON.stringify(expense),
    })
  }

  async updateExpense(
    userId: string,
    expenseId: string,
    expense: {
      amount?: number
      category?: string
      date?: string
      note?: string
    },
  ): Promise<ApiResponse<{ message: string; expense: Expense }>> {
    return this.request(`/api/users/${userId}/expenses/${expenseId}`, {
      method: "PUT",
      body: JSON.stringify(expense),
    })
  }

  async deleteExpense(userId: string, expenseId: string): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/api/users/${userId}/expenses/${expenseId}`, {
      method: "DELETE",
    })
  }

  // Budget endpoints
  async getBudgets(
    userId: string,
    month?: string,
  ): Promise<ApiResponse<{ budgets: Budget[]; month: string; total_budget: number; count: number }>> {
    const params = month ? `?month=${month}` : ""
    return this.request(`/api/users/${userId}/budgets${params}`)
  }

  async setBudget(
    userId: string,
    budget: {
      amount: number
      month: string
      category?: string
    },
  ): Promise<ApiResponse<{ message: string; budget: Budget }>> {
    return this.request(`/api/users/${userId}/budgets`, {
      method: "POST",
      body: JSON.stringify(budget),
    })
  }

  async updateBudget(
    userId: string,
    budgetId: string,
    budget: {
      amount?: number
      category?: string
      month?: string
    },
  ): Promise<ApiResponse<{ message: string; budget: Budget }>> {
    return this.request(`/api/users/${userId}/budgets/${budgetId}`, {
      method: "PUT",
      body: JSON.stringify(budget),
    })
  }

  async deleteBudget(userId: string, budgetId: string): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/api/users/${userId}/budgets/${budgetId}`, {
      method: "DELETE",
    })
  }

  // Analytics endpoints
  async getSummary(userId: string, month: string): Promise<ApiResponse<SummaryData>> {
    return this.request(`/api/summary/${userId}/${month}`)
  }

  async getReport(userId: string, month: string): Promise<ApiResponse<ReportData>> {
    return this.request(`/api/report/${userId}/${month}`)
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
