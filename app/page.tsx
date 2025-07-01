"use client"

import { useState, useEffect } from "react"
import type { User } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Plus, DollarSign, TrendingUp, AlertTriangle, Settings, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AuthWrapper } from "@/components/auth-wrapper"
import { supabase } from "@/lib/supabase"
import type { Expense, WeeklyBudget } from "@/types/database"

interface NewExpense {
  amount: string
  category: string
  description: string
}

const categories = [
  { value: "food", label: "Alimentação", color: "#FF6384" },
  { value: "transport", label: "Transporte", color: "#36A2EB" },
  { value: "housing", label: "Moradia", color: "#FFCE56" },
  { value: "entertainment", label: "Lazer", color: "#4BC0C0" },
  { value: "other", label: "Outros", color: "#9966FF" },
  { value: "health", label: "Saúde", color: "#43A047" },
  { value: "education", label: "Educação", color: "#1E88E5" },
  { value: "shopping", label: "Compras", color: "#F06292" },
  { value: "travel", label: "Viagem", color: "#8D6E63" },
  { value: "investments", label: "Investimentos", color: "#FFD600" },
]

function ExpenseTracker({ user }: { user: User }) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [weeklyBudget, setWeeklyBudget] = useState<WeeklyBudget | null>(null)
  const [newExpense, setNewExpense] = useState<NewExpense>({
    amount: "",
    category: "",
    description: "",
  })
  const [budgetAmount, setBudgetAmount] = useState("")
  const [showBudgetDialog, setShowBudgetDialog] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [budgetMessage, setBudgetMessage] = useState<string | null>(null)

  // Obter início da semana atual
  const getWeekStart = () => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const diff = now.getDate() - dayOfWeek
    return new Date(now.setDate(diff)).toISOString().split("T")[0]
  }

  // Carregar dados do Supabase
  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    setLoading(true)

    // Carregar despesas
    const { data: expensesData } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (expensesData) {
      setExpenses(expensesData)
    }

    // Carregar orçamento da semana atual
    const weekStart = getWeekStart()
    const { data: budgetData } = await supabase
      .from("weekly_budgets")
      .select("*")
      .eq("user_id", user.id)
      .eq("week_start", weekStart)
      .single()

    if (budgetData) {
      setWeeklyBudget(budgetData)
    }

    setLoading(false)
  }

  // Filtrar despesas da semana atual
  const getCurrentWeekExpenses = () => {
    const weekStart = getWeekStart()
    return expenses.filter((expense) => expense.date >= weekStart)
  }

  // Calcular total gasto na semana
  const weeklySpent = getCurrentWeekExpenses().reduce((total, expense) => total + expense.amount, 0)

  // Calcular progresso do orçamento
  const budgetProgress = weeklyBudget ? (weeklySpent / weeklyBudget.amount) * 100 : 0

  // Verificar se precisa de alerta
  const needsAlert = budgetProgress >= 80

  // Adicionar nova despesa
  const addExpense = async () => {
    if (!newExpense.amount || !newExpense.category) return

    setSubmitting(true)

    const { data, error } = await supabase
      .from("expenses")
      .insert({
        user_id: user.id,
        amount: Number.parseFloat(newExpense.amount),
        category: newExpense.category,
        description: newExpense.description || "Sem descrição",
        date: new Date().toISOString().split("T")[0],
      })
      .select()
      .single()

    if (!error && data) {
      setExpenses([data, ...expenses])
      setNewExpense({ amount: "", category: "", description: "" })
    }

    setSubmitting(false)
  }

  // Configurar orçamento semanal
  const setBudget = async () => {
    if (!budgetAmount) return

    setSubmitting(true)
    setBudgetMessage(null)
    const weekStart = getWeekStart()

    const { data, error } = await supabase
      .from("weekly_budgets")
      .upsert({
        user_id: user.id,
        amount: Number.parseFloat(budgetAmount),
        week_start: weekStart,
      })
      .select()
      .single()

    if (!error && data) {
      setWeeklyBudget(data)
      setBudgetAmount("")
      setBudgetMessage("Orçamento atualizado com sucesso!")
      setTimeout(() => {
        setShowBudgetDialog(false)
        setBudgetMessage(null)
      }, 1500)
    } else {
      setBudgetMessage("Erro ao atualizar o orçamento. Tente novamente.")
    }

    setSubmitting(false)
  }

  // Excluir orçamento semanal
  const deleteBudget = async () => {
    setSubmitting(true)
    setBudgetMessage(null)
    const weekStart = getWeekStart()
    const { error } = await supabase
      .from("weekly_budgets")
      .delete()
      .eq("user_id", user.id)
      .eq("week_start", weekStart)
    if (!error) {
      setWeeklyBudget(null)
      setBudgetAmount("")
      setBudgetMessage("Orçamento excluído com sucesso!")
      setTimeout(() => {
        setShowBudgetDialog(false)
        setBudgetMessage(null)
      }, 1500)
    } else {
      setBudgetMessage("Erro ao excluir o orçamento. Tente novamente.")
    }
    setSubmitting(false)
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <img src="/logo.png" alt="Logo App Controle Fácil" className="mx-auto w-32 h-32" />
          <p className="text-gray-600 mt-2">Gerencie suas despesas semanais de forma simples</p>
        </div>

        {/* Alerta de orçamento */}
        {needsAlert && weeklyBudget && (
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

              <Button
                onClick={addExpense}
                className="w-full"
                disabled={!newExpense.amount || !newExpense.category || submitting}
              >
                {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
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
              {weeklyBudget ? (
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
                    {weeklyBudget ? "Alterar Orçamento" : "Definir Orçamento"}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Configurar Orçamento Semanal</DialogTitle>
                    <DialogDescription>Defina quanto você pretende gastar esta semana</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {budgetMessage && (
                      <div className={`text-sm text-center ${budgetMessage.includes("sucesso") ? "text-green-600" : "text-red-600"}`}>{budgetMessage}</div>
                    )}
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
                    <Button onClick={setBudget} className="w-full" disabled={!budgetAmount || submitting}>
                      {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                      Salvar Orçamento
                    </Button>
                    {weeklyBudget && (
                      <Button onClick={deleteBudget} className="w-full mt-2" variant="destructive" disabled={submitting}>
                        Excluir Orçamento
                      </Button>
                    )}
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
                  .slice(0, 5)
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

export default function ExpenseTrackerApp() {
  return <AuthWrapper>{(user) => <ExpenseTracker user={user} />}</AuthWrapper>
}
