"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Plus, DollarSign, TrendingUp, AlertTriangle, Settings } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Expense {
  id: string
  amount: number
  category: string
  description: string
  date: string
}

interface WeeklyBudget {
  amount: number
  startDate: string
}

const categories = [
  { value: "alimentacao", label: "Alimentação", color: "#8884d8" },
  { value: "transporte", label: "Transporte", color: "#82ca9d" },
  { value: "lazer", label: "Lazer", color: "#ffc658" },
  { value: "saude", label: "Saúde", color: "#ff7c7c" },
  { value: "compras", label: "Compras", color: "#8dd1e1" },
  { value: "outros", label: "Outros", color: "#d084d0" },
]

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [weeklyBudget, setWeeklyBudget] = useState<WeeklyBudget>({ amount: 0, startDate: "" })
  const [newExpense, setNewExpense] = useState({
    amount: "",
    category: "",
    description: "",
  })
  const [budgetAmount, setBudgetAmount] = useState("")
  const [showBudgetDialog, setShowBudgetDialog] = useState(false)

  // Carregar dados do localStorage
  useEffect(() => {
    const savedExpenses = localStorage.getItem("expenses")
    const savedBudget = localStorage.getItem("weeklyBudget")

    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses))
    }

    if (savedBudget) {
      setWeeklyBudget(JSON.parse(savedBudget))
    }
  }, [])

  // Salvar no localStorage
  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses))
  }, [expenses])

  useEffect(() => {
    localStorage.setItem("weeklyBudget", JSON.stringify(weeklyBudget))
  }, [weeklyBudget])

  // Obter início da semana atual
  const getWeekStart = () => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const diff = now.getDate() - dayOfWeek
    return new Date(now.setDate(diff)).toISOString().split("T")[0]
  }

  // Filtrar despesas da semana atual
  const getCurrentWeekExpenses = () => {
    const weekStart = getWeekStart()
    return expenses.filter((expense) => expense.date >= weekStart)
  }

  // Calcular total gasto na semana
  const weeklySpent = getCurrentWeekExpenses().reduce((total, expense) => total + expense.amount, 0)

  // Calcular progresso do orçamento
  const budgetProgress = weeklyBudget.amount > 0 ? (weeklySpent / weeklyBudget.amount) * 100 : 0

  // Verificar se precisa de alerta
  const needsAlert = budgetProgress >= 80

  // Adicionar nova despesa
  const addExpense = () => {
    if (!newExpense.amount || !newExpense.category) return

    const expense: Expense = {
      id: Date.now().toString(),
      amount: Number.parseFloat(newExpense.amount),
      category: newExpense.category,
      description: newExpense.description || "Sem descrição",
      date: new Date().toISOString().split("T")[0],
    }

    setExpenses([...expenses, expense])
    setNewExpense({ amount: "", category: "", description: "" })
  }

  // Configurar orçamento semanal
  const setBudget = () => {
    if (!budgetAmount) return

    setWeeklyBudget({
      amount: Number.parseFloat(budgetAmount),
      startDate: getWeekStart(),
    })
    setBudgetAmount("")
    setShowBudgetDialog(false)
  }

  // Preparar dados para o gráfico
  const chartData = categories
    .map((category) => {
      const categoryExpenses = getCurrentWeekExpenses().filter((expense) => expense.category === category.value)
      const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0)

      return {
        name: category.label,
        value: total,
        color: category.color,
      }
    })
    .filter((item) => item.value > 0)

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Controle de Gastos</h1>
          <p className="text-gray-600 mt-2">Gerencie suas despesas semanais de forma simples</p>
        </div>

        {/* Alerta de orçamento */}
        {needsAlert && weeklyBudget.amount > 0 && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              Atenção! Você já gastou {budgetProgress.toFixed(0)}% do seu orçamento semanal.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cadastro de Despesas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Nova Despesa
              </CardTitle>
              <CardDescription>Adicione seus gastos rapidamente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0,00"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={newExpense.category}
                  onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Input
                  id="description"
                  placeholder="Ex: Almoço no restaurante"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                />
              </div>

              <Button onClick={addExpense} className="w-full" disabled={!newExpense.amount || !newExpense.category}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Despesa
              </Button>
            </CardContent>
          </Card>

          {/* Orçamento Semanal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Orçamento Semanal
              </CardTitle>
              <CardDescription>Acompanhe seus gastos da semana</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {weeklyBudget.amount > 0 ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Gasto atual</span>
                    <Badge variant={needsAlert ? "destructive" : "secondary"}>
                      R$ {weeklySpent.toFixed(2)} / R$ {weeklyBudget.amount.toFixed(2)}
                    </Badge>
                  </div>

                  <Progress value={Math.min(budgetProgress, 100)} className="h-3" />

                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{budgetProgress.toFixed(0)}% usado</span>
                    <span>R$ {(weeklyBudget.amount - weeklySpent).toFixed(2)} restante</span>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-4">Nenhum orçamento definido</p>
                </div>
              )}

              <Dialog open={showBudgetDialog} onOpenChange={setShowBudgetDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    {weeklyBudget.amount > 0 ? "Alterar Orçamento" : "Definir Orçamento"}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Configurar Orçamento Semanal</DialogTitle>
                    <DialogDescription>Defina quanto você pretende gastar esta semana</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="budget">Valor do Orçamento (R$)</Label>
                      <Input
                        id="budget"
                        type="number"
                        placeholder="0,00"
                        value={budgetAmount}
                        onChange={(e) => setBudgetAmount(e.target.value)}
                      />
                    </div>
                    <Button onClick={setBudget} className="w-full" disabled={!budgetAmount}>
                      Salvar Orçamento
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Relatório Semanal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Relatório da Semana
            </CardTitle>
            <CardDescription>Visualize seus gastos por categoria</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, "Valor"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhuma despesa registrada esta semana</p>
                <p className="text-sm text-gray-400 mt-2">Adicione algumas despesas para ver o relatório</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lista de Despesas Recentes */}
        {getCurrentWeekExpenses().length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Despesas desta Semana</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {getCurrentWeekExpenses()
                  .slice(-5)
                  .reverse()
                  .map((expense) => {
                    const category = categories.find((cat) => cat.value === expense.category)
                    return (
                      <div key={expense.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{expense.description}</p>
                          <p className="text-sm text-gray-600">{category?.label}</p>
                        </div>
                        <Badge variant="outline">R$ {expense.amount.toFixed(2)}</Badge>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
