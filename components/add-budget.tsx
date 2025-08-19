"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MonthSelector } from "@/components/month-selector"
import { ArrowLeft, Target, Tag } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { apiClient } from "@/lib/api"
import { formatCurrency, formatMonth } from "@/lib/utils"
import type { Page } from "@/lib/types"

interface AddBudgetProps {
  onNavigate: (page: Page) => void
}

export function AddBudget({ onNavigate }: AddBudgetProps) {
  const { user } = useAuth()
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setError("")
    setSuccess("")

    // Validation
    if (!amount || !category || !month) {
      setError("Please fill in all required fields")
      return
    }

    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid amount")
      return
    }

    setLoading(true)

    try {
      const response = await apiClient.setBudget(user.uid, {
        amount: Number(amount),
        category,
        month,
      })

      if (response.success) {
        setSuccess("Budget set successfully!")

        // Reset form
        setAmount("")
        setCategory("")
        setMonth(new Date().toISOString().slice(0, 7))

        // Navigate back after a short delay
        setTimeout(() => {
          onNavigate("dashboard")
        }, 1500)
      } else {
        setError(response.error || "Failed to set budget")
      }
    } catch (error: any) {
      setError(error.message || "Failed to set budget")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <Button variant="ghost" onClick={() => onNavigate("dashboard")} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-6 w-6 text-blue-600" />
            <span>Set Budget</span>
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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="flex items-center space-x-2">
                <Tag className="h-4 w-4" />
                <span>Category *</span>
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
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

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span>Budget Amount *</span>
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-lg"
              />
            </div>

            {/* Month */}
            <div className="space-y-2">
              <Label htmlFor="month">Month *</Label>
              <MonthSelector value={month} onValueChange={setMonth} placeholder="Select a month" />
            </div>

            {/* Budget Preview */}
            {amount && category && month && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-900 mb-2">Budget Summary</h3>
                <div className="space-y-1 text-sm text-blue-800">
                  <p>
                    <span className="font-medium">Category:</span> {category}
                  </p>
                  <p>
                    <span className="font-medium">Amount:</span> {formatCurrency(Number(amount))}
                  </p>
                  <p>
                    <span className="font-medium">Month:</span> {formatMonth(month)}
                  </p>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button type="submit" disabled={loading} className="flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span>{loading ? "Setting Budget..." : "Set Budget"}</span>
              </Button>
              <Button type="button" variant="outline" onClick={() => onNavigate("dashboard")} disabled={loading}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
