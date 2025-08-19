"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface BarChartData {
  category: string
  expenses: number
  budget: number
  over_budget: boolean
}

interface CustomBarChartProps {
  data: BarChartData[]
  title?: string
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const expenses = payload.find((p: any) => p.dataKey === "expenses")?.value || 0
    const budget = payload.find((p: any) => p.dataKey === "budget")?.value || 0
    const isOverBudget = expenses > budget && budget > 0

    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900 mb-2">{label}</p>
        <div className="space-y-1">
          <p className="text-sm">
            <span className="inline-block w-3 h-3 bg-blue-500 rounded mr-2"></span>
            Expenses: ${expenses.toFixed(2)}
          </p>
          <p className="text-sm">
            <span className="inline-block w-3 h-3 bg-green-500 rounded mr-2"></span>
            Budget: ${budget.toFixed(2)}
          </p>
          {budget > 0 && (
            <p className={`text-sm font-medium ${isOverBudget ? "text-red-600" : "text-green-600"}`}>
              {isOverBudget
                ? `Over budget by $${(expenses - budget).toFixed(2)}`
                : `Under budget by $${(budget - expenses).toFixed(2)}`}
            </p>
          )}
        </div>
      </div>
    )
  }
  return null
}

export function CustomBarChart({ data, title }: CustomBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-600">No data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} fontSize={12} />
          <YAxis tickFormatter={(value) => `$${value}`} fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="expenses" fill="#3B82F6" name="Expenses" />
          <Bar dataKey="budget" fill="#10B981" name="Budget" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
