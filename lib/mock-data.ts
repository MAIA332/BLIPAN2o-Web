// Tipos de dados
export interface Tenant {
  id: string
  name: string
}

export interface ChartPage {
  id: string
  name: string
  charts: Chart[]
}

export interface Chart {
  id: string
  title: string
  type: 'bar' | 'line' | 'area' | 'pie'
  xField: string
  yField: string
  data: ChartDataPoint[]
}

export interface ChartDataPoint {
  name: string
  value: number
  category?: string
}

export interface FilterOption {
  field: string
  label: string
  options: string[]
}

// Mock de tenants
export const tenants: Tenant[] = [
  { id: 'tenant-1', name: 'Empresa Alpha' },
  { id: 'tenant-2', name: 'Empresa Beta' },
  { id: 'tenant-3', name: 'Empresa Gamma' },
]

// Mock de filtros
export const filterOptions: FilterOption[] = [
  {
    field: 'action',
    label: 'Ação',
    options: ['Comercial', 'Suporte', 'Marketing', 'Vendas', 'Financeiro'],
  },
  {
    field: 'category',
    label: 'Categoria',
    options: ['Categoria A', 'Categoria B', 'Categoria C', 'Categoria D'],
  },
  {
    field: 'state_name',
    label: 'Estado',
    options: ['1.0 - Initial menu', '1.0.1 - Presentation', '1.0.2 - Policy', 'show error message'],
  },
]

// Mock de páginas de gráficos
export const chartPages: ChartPage[] = [
  {
    id: 'page-1',
    name: 'Visão Geral',
    charts: [
      {
        id: 'chart-1',
        title: 'Análise de registro de trackings',
        type: 'bar',
        xField: 'action',
        yField: 'count',
        data: [
          { name: 'Comercial', value: 6 },
          { name: 'Suporte', value: 3 },
          { name: 'Marketing', value: 4 },
          { name: 'Vendas', value: 2 },
        ],
      },
      {
        id: 'chart-2',
        title: 'Ocorrências por bloco',
        type: 'bar',
        xField: 'state_name',
        yField: 'occurrences_count',
        data: [
          { name: '1.0 - Initial menu', value: 4 },
          { name: '1.0.1 - Presentation', value: 2 },
          { name: '1.0.2 - Policy', value: 2 },
          { name: 'show error message', value: 2 },
        ],
      },
    ],
  },
  {
    id: 'page-2',
    name: 'Análise de atendimento',
    charts: [], // Limpo: a renderização visual será uma tela nova customizada
  },
  {
    id: 'page-3',
    name: 'Performance',
    charts: [
      {
        id: 'chart-5',
        title: 'Performance Mensal',
        type: 'bar',
        xField: 'mês',
        yField: 'performance',
        data: [
          { name: 'Jan', value: 85 },
          { name: 'Fev', value: 92 },
          { name: 'Mar', value: 78 },
          { name: 'Abr', value: 95 },
          { name: 'Mai', value: 88 },
        ],
      },
      {
        id: 'chart-6',
        title: 'Taxa de Conversão',
        type: 'line',
        xField: 'semana',
        yField: 'taxa',
        data: [
          { name: 'Sem 1', value: 3.2 },
          { name: 'Sem 2', value: 4.1 },
          { name: 'Sem 3', value: 3.8 },
          { name: 'Sem 4', value: 5.2 },
        ],
      },
    ],
  },
  {
    id: 'page-4',
    name: 'Mensagens Ativas',
    charts: [], // Limpo: a renderização visual agora é responsabilidade do ActiveMessagesPage
  },
]

// Campos de dados disponíveis
export const dataFields = [
  { id: 'action', label: 'action', type: 'dimension' },
  { id: 'category', label: 'category', type: 'dimension' },
  { id: 'state_name', label: 'state_name', type: 'dimension' },
  { id: 'count', label: 'count', type: 'measure' },
  { id: 'occurrences_count', label: 'occurrences_count', type: 'measure' },
  { id: 'Name', label: 'Name', type: 'dimension' },
  { id: 'storageDate', label: 'storageDate', type: 'dimension' },
]