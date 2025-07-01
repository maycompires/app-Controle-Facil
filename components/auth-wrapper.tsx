"use client"

import type React from "react"

import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogIn, UserPlus, Loader2 } from "lucide-react"

interface AuthWrapperProps {
  children: (user: User) => React.ReactNode
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  // Estado inicial explícito para garantir consistência entre servidor e cliente
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")

  // Efeito para inicialização do cliente
  useEffect(() => {
    // Marca o componente como montado
    setMounted(true)

    // Função para verificar o usuário atual
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error('Erro ao verificar usuário:', error)
      } finally {
        setLoading(false)
      }
    }

    // Verifica o usuário atual
    checkUser()

    // Escuta mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Limpa a subscrição ao desmontar
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleSignUp = async () => {
    if (!email || !password) return

    setAuthLoading(true)
    setMessage("")

    try {
      // Primeiro, tenta fazer login para verificar se a conta já existe
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (!signInError) {
        // Se conseguiu fazer login, a conta já existe
        setMessage("Login realizado com sucesso!")
        return
      }

      // Se não conseguiu fazer login, tenta criar a conta
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        setMessage(error.message)
      } else {
        // Se o cadastro foi bem-sucedido, tenta fazer login automaticamente
        const { error: autoSignInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (autoSignInError) {
          setMessage("Conta criada com sucesso! Faça login para continuar.")
        } else {
          setMessage("Conta criada e login realizado com sucesso!")
        }
      }
    } catch (error) {
      setMessage("Erro ao criar conta. Tente novamente.")
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSignIn = async () => {
    if (!email || !password) return

    setAuthLoading(true)
    setMessage("")

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setMessage(error.message)
      }
    } catch (error) {
      setMessage("Erro ao fazer login. Tente novamente.")
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  // Renderiza um loader durante SSR e carregamento inicial
  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Renderiza o formulário de login se não houver usuário
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Controle de Gastos</CardTitle>
            <CardDescription>Entre ou crie sua conta para começar</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Cadastrar</TabsTrigger>
              </TabsList>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {message && (
                  <div className={`text-sm ${message.includes("sucesso") ? "text-green-600" : "text-red-600"}`}>
                    {message}
                  </div>
                )}

                <TabsContent value="signin" className="space-y-4">
                  <Button onClick={handleSignIn} className="w-full" disabled={authLoading || !email || !password}>
                    {authLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <LogIn className="h-4 w-4 mr-2" />
                    )}
                    Entrar
                  </Button>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4">
                  <Button onClick={handleSignUp} className="w-full" disabled={authLoading || !email || !password}>
                    {authLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <UserPlus className="h-4 w-4 mr-2" />
                    )}
                    Criar Conta
                  </Button>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Renderiza o conteúdo principal quando o usuário está autenticado
  return (
    <div>
      <div className="bg-white border-b px-4 py-2 flex justify-between items-center">
        <span className="text-sm text-gray-600">Logado como: {user.email}</span>
        <Button variant="outline" size="sm" onClick={handleSignOut}>
          Sair
        </Button>
      </div>
      {children(user)}
    </div>
  )
}
