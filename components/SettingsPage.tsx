'use client'

import { useState } from 'react'
import { 
  User, 
  Bell, 
  Palette, 
  Key, 
  Shield, 
  Save,
  Sparkles,
  UploadCloud
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'

// 1. Importar os componentes de Select do shadcn
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// 2. Importar o useAuth para pegar as empresas do usuário logado
import { useAuth } from '@/lib/auth'

export function SettingsPage() {
  // Extraímos as empresas diretamente do hook de autenticação
  const { user } = useAuth()
  const availableBranches = user?.branchs || []

  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  // O estado branchId agora vai armazenar o ID da empresa selecionada no dropdown
  const [branchId, setBranchId] = useState('')

  const handleSave = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const handleFileUpload = () => {
    if (!selectedFile || !branchId) return
    
    setIsUploading(true)
    
    setTimeout(() => {
      setIsUploading(false)
      setSelectedFile(null)
      setBranchId('')
      alert('Fluxo mapeado com sucesso para a branch informada!')
    }, 1500)
  }

  return (
    <div className="flex-1 space-y-6 p-8 overflow-y-auto w-full max-w-5xl mx-auto">
      
      {/* Cabeçalho da Página */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Configurações</h2>
        <p className="text-muted-foreground mt-2">
          Gerencie as informações da sua conta, preferências de sistema e integrações.
        </p>
      </div>

      <Separator className="bg-border" />

      {/* Conteúdo Principal com Abas */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-secondary/50 flex-wrap h-auto p-1">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" /> Perfil
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" /> Aparência
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" /> Notificações
          </TabsTrigger>
          <TabsTrigger value="enhancement" className="gap-2">
            <Sparkles className="h-4 w-4" /> Aprimoramento
          </TabsTrigger>
        </TabsList>

        {/* Aba: Perfil */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Perfil Público</CardTitle>
              <CardDescription>
                Atualize suas informações pessoais e como você será visto no sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" placeholder="Seu nome" defaultValue="Administrador ASPIN" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Endereço de E-mail</Label>
                <Input id="email" type="email" placeholder="seu@email.com" defaultValue="admin@aspinbots.com" disabled />
                <p className="text-[0.8rem] text-muted-foreground">
                  Seu e-mail está vinculado à sua conta corporativa e não pode ser alterado aqui.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isLoading} className="gap-2">
                {isLoading ? 'Salvando...' : <><Save className="h-4 w-4"/> Salvar Alterações</>}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Aba: Aparência */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Aparência do Dashboard</CardTitle>
              <CardDescription>
                Personalize o tema e a exibição de dados no seu dispositivo.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4">
              <div className="flex flex-col items-center gap-2">
                <div className="h-24 w-32 rounded-md border-2 border-primary bg-white p-2 shadow-sm cursor-pointer hover:border-primary/50 transition-all">
                  <div className="h-full w-full rounded bg-slate-100" />
                </div>
                <Label className="font-normal cursor-pointer">Claro</Label>
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <div className="h-24 w-32 rounded-md border-2 border-border bg-slate-950 p-2 shadow-sm cursor-pointer hover:border-primary/50 transition-all">
                  <div className="h-full w-full rounded bg-slate-800" />
                </div>
                <Label className="font-normal cursor-pointer">Escuro</Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isLoading} variant="outline">
                Aplicar Tema
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Aba: Notificações */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Notificação</CardTitle>
              <CardDescription>
                Escolha quais alertas você deseja receber dos seus bots e equipes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Alertas Críticos (Queda de Bot)</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba e-mails imediatos se um bot ficar offline.
                  </p>
                </div>
                <div className="w-10 h-5 bg-primary rounded-full relative cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-0.5" />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Relatórios Diários</Label>
                  <p className="text-sm text-muted-foreground">
                    Resumo do volume de atendimento às 08h00.
                  </p>
                </div>
                <div className="w-10 h-5 bg-muted rounded-full relative cursor-pointer border border-border">
                  <div className="w-4 h-4 bg-muted-foreground rounded-full absolute left-1 top-0.5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba: Aprimoramento */}
        <TabsContent value="enhancement">
          <Card>
            <CardHeader>
              <CardTitle>Mapeamento de Fluxo</CardTitle>
              <CardDescription>
                Faça o upload do arquivo JSON de fluxo de um bot para mapear os caminhos e melhorar a inteligência das análises no dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* DROPDOWN DE EMPRESAS APLICADO AQUI */}
              <div className="space-y-2 max-w-md">
                <Label htmlFor="branchId">Empresa (Branch)</Label>
                <Select onValueChange={setBranchId} value={branchId}>
                  <SelectTrigger id="branchId">
                    <SelectValue placeholder="Selecione uma empresa..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableBranches.map((branch: any) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name || branch.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 max-w-md">
                <Label htmlFor="flowFile">Arquivo de Fluxo (JSON)</Label>
                <Input 
                  id="flowFile" 
                  type="file" 
                  accept=".json" 
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="cursor-pointer file:cursor-pointer"
                />
                <p className="text-[0.8rem] text-muted-foreground">
                  Suba o JSON extraído diretamente da ferramenta de construção do bot.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleFileUpload} 
                disabled={!selectedFile || !branchId || isUploading} 
                className="gap-2"
              >
                {isUploading ? (
                  'Processando arquivo...'
                ) : (
                  <>
                    <UploadCloud className="h-4 w-4" /> 
                    Enviar e Analisar Fluxo
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}