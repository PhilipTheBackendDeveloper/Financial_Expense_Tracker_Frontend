"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MonthSelector } from "@/components/month-selector"
import { LoadingSkeleton } from "@/components/loading-spinner"
import { ArrowLeft, Settings, DollarSign, Tag, Trash2, Plus, Edit2, Save, X } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { apiClient } from "@/lib/api"
import { formatCurrency, formatMonth, getCurrentMonth } from "@/lib/utils"
import type { Page, Budget } from "@/lib/types"

interface BudgetSettingsProps {
  onNavigate: (page: Page) => void
}

interface EditingBudget {
  id: string
  category: string
  amount: string
  month: string
}

export function BudgetSettings({ onNavigate }: BudgetSettingsProps) {
  const { user } = useAuth()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [editingBudget, setEditingBudget] = useState<EditingBudget | null>(null)
  const [newBudget, setNewBudget] = useState({
    category: "",
    amount: "",
    month: getCurrentMonth(),
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  const categories = [
    "Food & Dining",
    "Transportation",
    "Shopping",
    "Entertainment",
    "Utilities",
    "Healthcare",
    "Education",
    "Travel",
    "Other",
  ]

  useEffect(() => {
    if (user) {
      loadBudgets()
    }
  }, [user])

  const loadBudgets = async () => {
    if (!user) return

    setLoading(true)
    setError("")

    try {
      console.log("Loading budgets for user:", user.uid)
      const response = await apiClient.getBudgets(user.uid)
      console.log("Budget response:", response)

      if (response.success) {
        setBudgets(response.data.budgets || [])
        console.log("Budgets loaded:", response.data.budgets)
      } else {
        setError(response.error || "Failed to load budgets")
        console.error("Failed to load budgets:", response.error)
      }
    } catch (error: any) {
      console.error("Error loading budgets:", error)
      setError(error.message || "Failed to load budgets")
    } finally {
      setLoading(false)
    }
  }

  const handleAddBudget = async () => {
    if (!user) return

    setError("")
    setSuccess("")

    // Validation
    if (!newBudget.category || !newBudget.amount || !newBudget.month) {
      setError("Please fill in all fields")
      return
    }

    if (isNaN(Number(newBudget.amount)) || Number(newBudget.amount) <= 0) {
      setError("Please enter a valid amount")
      return
    }

    // Check if budget already exists for this category and month
    const existingBudget = budgets.find((b) => b.category === newBudget.category && b.month === newBudget.month)

    if (existingBudget) {
      setError("Budget already exists for this category and month")
      return
    }

    setActionLoading(true)

    try {
      console.log("Adding budget:", newBudget)
      const response = await apiClient.setBudget(user.uid, {
        amount: Number(newBudget.amount),
        category: newBudget.category,
        month: newBudget.month,
      })

      console.log("Add budget response:", response)

      if (response.success) {
        setBudgets([...budgets, response.data.budget])
        setNewBudget({ category: "", amount: "", month: getCurrentMonth() })
        setSuccess("Budget added successfully!")
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError(response.error || "Failed to add budget")
      }
    } catch (error: any) {
      console.error("Error adding budget:", error)
      setError(error.message || "Failed to add budget")
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget({
      id: budget.id,
      category: budget.category,
      amount: budget.amount.toString(),
      month: budget.month,
    })
  }

  const handleSaveEdit = async () => {
    if (!user || !editingBudget) return

    setError("")
    setSuccess("")

    // Validation
    if (!editingBudget.category || !editingBudget.amount || !editingBudget.month) {
      setError("Please fill in all fields")
      return
    }

    if (isNaN(Number(editingBudget.amount)) || Number(editingBudget.amount) <= 0) {
      setError("Please enter a valid amount")
      return
    }

    setActionLoading(true)

    try {
      const response = await apiClient.updateBudget(user.uid, editingBudget.id, {
        amount: Number(editingBudget.amount),
        category: editingBudget.category,
        month: editingBudget.month,
      })

      if (response.success) {
        setBudgets(budgets.map((b) => (b.id === editingBudget.id ? response.data.budget : b)))
        setEditingBudget(null)
        setSuccess("Budget updated successfully!")
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError(response.error || "Failed to update budget")
      }
    } catch (error: any) {
      setError(error.message || "Failed to update budget")
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingBudget(null)
  }

  const handleDeleteBudget = async (budgetId: string) => {
    if (!user) return

    if (!confirm("Are you sure you want to delete this budget?")) {
      return
    }

    setActionLoading(true)

    try {
      const response = await apiClient.deleteBudget(user.uid, budgetId)
      if (response.success) {
        setBudgets(budgets.filter((b) => b.id !== budgetId))
        setSuccess("Budget deleted successfully!")
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError(response.error || "Failed to delete budget")
      }
    } catch (error: any) {
      setError(error.message || "Failed to delete budget")
    } finally {
      setActionLoading(false)
    }
  }

  const groupedBudgets = budgets.reduce(
    (acc, budget) => {
      if (!acc[budget.month]) {
        acc[budget.month] = []
      }
      acc[budget.month].push(budget)
      return acc
    },
    {} as Record<string, Budget[]>,
  )

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSkeleton />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <Button variant="ghost" onClick={() => onNavigate("dashboard")} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Button>
      </div>

      <div className="space-y-8">
        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <Settings className="h-8 w-8 text-blue-600" />
            <span>Budget Settings</span>
          </h1>
          <p className="text-gray-600 mt-2">Set and manage your monthly budgets by category</p>
        </div>

        {/* Add New Budget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5 text-green-600" />
              <span>Add New Budget</span>
            </CardTitle>
            <CardDescription>Set a spending limit for a specific category and month</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="new-category" className="flex items-center space-x-2">
                  <Tag className="h-4 w-4" />
                  <span>Category</span>
                </Label>
                <Select
                  value={newBudget.category}
                  onValueChange={(value) => setNewBudget({ ...newBudget, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-amount" className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4" />
                  <span>Amount</span>
                </Label>
                <Input
                  id="new-amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newBudget.amount}
                  onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-month">Month</Label>
                <MonthSelector
                  value={newBudget.month}
                  onValueChange={(value) => setNewBudget({ ...newBudget, month: value })}
                  placeholder="Select month"
                />
              </div>
            </div>

            <Button onClick={handleAddBudget} disabled={actionLoading} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>{actionLoading ? "Adding Budget..." : "Add Budget"}</span>
            </Button>
          </CardContent>
        </Card>

        {/* Existing Budgets */}
        <div className="space-y-6">
          {Object.keys(groupedBudgets).length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Settings className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No budgets set</h3>
                <p className="text-gray-600 text-center">
                  Start by adding your first budget above to track your spending limits.
                </p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedBudgets)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([month, monthBudgets]) => (
                <Card key={month}>
                  <CardHeader>
                    <CardTitle className="text-xl">{formatMonth(month)}</CardTitle>
                    <CardDescription>
                      Total Budget: {formatCurrency(monthBudgets.reduce((sum, b) => sum + b.amount, 0))}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {monthBudgets.map((budget) => (
                        <div
                          key={budget.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                        >
                          {editingBudget?.id === budget.id ? (
                            // Edit mode
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                              <Select
                                value={editingBudget.category}
                                onValueChange={(value) => setEditingBudget({ ...editingBudget, category: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {categories.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                      {cat}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              <Input
                                type="number"
                                step="0.01"
                                value={editingBudget.amount}
                                onChange={(e) => setEditingBudget({ ...editingBudget, amount: e.target.value })}
                              />

                              <MonthSelector
                                value={editingBudget.month}
                                onValueChange={(value) => setEditingBudget({ ...editingBudget, month: value })}
                              />
                            </div>
                          ) : (
                            // View mode
                            <div className="flex items-center space-x-4">
                              <div className="w-3 h-3 bg-blue-500 rounded-full" />
                              <div>
                                <h4 className="font-medium text-gray-900">{budget.category}</h4>
                                <p className="text-sm text-gray-600">Monthly limit: {formatCurrency(budget.amount)}</p>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center space-x-2">
                            {editingBudget?.id === budget.id ? (
                              // Edit mode buttons
                              <>
                                <Button
                                  size="sm"
                                  onClick={handleSaveEdit}
                                  disabled={actionLoading}
                                  className="flex items-center space-x-1"
                                >
                                  <Save className="h-3 w-3" />
                                  <span>Save</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleCancelEdit}
                                  disabled={actionLoading}
                                  className="flex items-center space-x-1 bg-transparent"
                                >
                                  <X className="h-3 w-3" />
                                  <span>Cancel</span>
                                </Button>
                              </>
                            ) : (
                              // View mode buttons
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditBudget(budget)}
                                  disabled={actionLoading}
                                  className="flex items-center space-x-1"
                                >
                                  <Edit2 className="h-3 w-3" />
                                  <span>Edit</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteBudget(budget.id)}
                                  disabled={actionLoading}
                                  className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-3 w-3" />
                                  <span>Delete</span>
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </div>
      </div>
    </div>
  )
}
