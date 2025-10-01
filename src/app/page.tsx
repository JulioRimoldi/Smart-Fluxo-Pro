"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Minus, Edit, Calendar, FileText, Search, Filter, Download, Upload, Eye, Settings, Circle, AlertTriangle, TrendingUp, Package, DollarSign, ShoppingCart, BarChart3, PieChart, CreditCard } from 'lucide-react'

// Tipos de dados
interface Transaction {
  id: string
  type: 'receita' | 'despesa'
  description: string
  amount: number
  date: string
  category: string
  accountId?: string
}

interface Product {
  id: string
  name: string
  quantity: number
  cost: number
  category: string
  supplier: string
  minStock: number
}

interface Sale {
  id: string
  productId: string
  productName: string
  quantity: number
  salePrice: number
  shipping: number
  fees: number
  gifts: number
  invoice: string
  packaging: number
  invoiceCost: number
  netRevenue: number
  profit: number
  date: string
  notes: string
  accountId: string
}

interface Account {
  id: string
  name: string
  balance: number
  pendingBalance: number
}

export default function AdminPanel() {
  // Estados principais
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [accounts, setAccounts] = useState<Account[]>([
    { id: '1', name: 'Conta 01', balance: 0, pendingBalance: 0 },
    { id: '2', name: 'Conta 02', balance: 0, pendingBalance: 0 }
  ])
  const [numberOfAccounts, setNumberOfAccounts] = useState(2)
  const [activeTab, setActiveTab] = useState('financeiro')
  const [financialSubTab, setFinancialSubTab] = useState('transactions')

  // Estados para formulários
  const [newTransaction, setNewTransaction] = useState({
    type: 'receita' as 'receita' | 'despesa',
    description: '',
    amount: '',
    category: '',
    accountId: '1'
  })

  const [newProduct, setNewProduct] = useState({
    name: '',
    quantity: '',
    cost: '',
    category: '',
    supplier: '',
    minStock: '5'
  })

  const [newSale, setNewSale] = useState({
    productId: '',
    quantity: '',
    salePrice: '',
    shipping: '',
    fees: '',
    gifts: '',
    invoice: '',
    packaging: '',
    invoicePercentage: '5', // Percentual da nota fiscal
    notes: '',
    accountId: '1'
  })

  // Estados para edição
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingSale, setEditingSale] = useState<Sale | null>(null)

  // Estados para gerenciar contas
  const [accountBalances, setAccountBalances] = useState<{[key: string]: {balance: string, pending: string}}>({
    '1': { balance: '0', pending: '0' },
    '2': { balance: '0', pending: '0' }
  })

  // Sugestões para categorias
  const transactionCategories = [
    'Marketing', 'Fornecedores', 'Vendas', 'Taxas', 'Frete', 'Embalagens', 
    'Impostos', 'Salários', 'Aluguel', 'Energia', 'Internet', 'Outros'
  ]

  const productCategories = [
    'Eletrônicos', 'Roupas', 'Casa e Jardim', 'Esportes', 'Livros', 
    'Beleza', 'Brinquedos', 'Automotivo', 'Outros'
  ]

  // Função para atualizar número de contas
  const updateNumberOfAccounts = (num: number) => {
    setNumberOfAccounts(num)
    const newAccounts = []
    const newBalances = {...accountBalances}
    
    for (let i = 1; i <= num; i++) {
      const accountId = i.toString()
      newAccounts.push({
        id: accountId,
        name: `Conta ${i.toString().padStart(2, '0')}`,
        balance: parseFloat(newBalances[accountId]?.balance || '0'),
        pendingBalance: parseFloat(newBalances[accountId]?.pending || '0')
      })
      
      if (!newBalances[accountId]) {
        newBalances[accountId] = { balance: '0', pending: '0' }
      }
    }
    
    setAccounts(newAccounts)
    setAccountBalances(newBalances)
  }

  // Função para atualizar saldos das contas
  const updateAccountBalance = (accountId: string, field: 'balance' | 'pending', value: string) => {
    setAccountBalances(prev => ({
      ...prev,
      [accountId]: {
        ...prev[accountId],
        [field]: value
      }
    }))
    
    setAccounts(prev => prev.map(account => 
      account.id === accountId 
        ? { 
            ...account, 
            [field === 'balance' ? 'balance' : 'pendingBalance']: parseFloat(value) || 0 
          }
        : account
    ))
  }

  // Funções para adicionar dados
  const addTransaction = () => {
    if (!newTransaction.description || !newTransaction.amount) return

    const transaction: Transaction = {
      id: Date.now().toString(),
      type: newTransaction.type,
      description: newTransaction.description,
      amount: parseFloat(newTransaction.amount),
      date: new Date().toISOString().split('T')[0],
      category: newTransaction.category || 'Outros',
      accountId: newTransaction.accountId
    }

    setTransactions(prev => [...prev, transaction])
    setNewTransaction({ type: 'receita', description: '', amount: '', category: '', accountId: '1' })
  }

  const addProduct = () => {
    if (!newProduct.name || !newProduct.quantity || !newProduct.cost) return

    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name,
      quantity: parseInt(newProduct.quantity),
      cost: parseFloat(newProduct.cost),
      category: newProduct.category || 'Outros',
      supplier: newProduct.supplier || 'Não informado',
      minStock: parseInt(newProduct.minStock) || 5
    }

    setProducts(prev => [...prev, product])
    setNewProduct({ name: '', quantity: '', cost: '', category: '', supplier: '', minStock: '5' })
  }

  const addSale = () => {
    if (!newSale.productId || !newSale.quantity || !newSale.salePrice || !newSale.accountId) return

    const product = products.find(p => p.id === newSale.productId)
    if (!product || product.quantity < parseInt(newSale.quantity)) {
      alert('Produto não encontrado ou estoque insuficiente!')
      return
    }

    const quantity = parseInt(newSale.quantity)
    const salePrice = parseFloat(newSale.salePrice)
    const shipping = parseFloat(newSale.shipping) || 0
    const fees = parseFloat(newSale.fees) || 0
    const gifts = parseFloat(newSale.gifts) || 0
    const packaging = parseFloat(newSale.packaging) || 0
    const invoicePercentage = parseFloat(newSale.invoicePercentage) || 0
    
    // Calcular custo da nota fiscal como percentual do preço de venda
    const invoiceCost = (salePrice * invoicePercentage) / 100
    
    const netRevenue = salePrice - shipping - fees - gifts - packaging - invoiceCost
    const profit = netRevenue - (product.cost * quantity)

    const sale: Sale = {
      id: Date.now().toString(),
      productId: newSale.productId,
      productName: product.name,
      quantity,
      salePrice,
      shipping,
      fees,
      gifts,
      invoice: newSale.invoice || 'Não informado',
      packaging,
      invoiceCost,
      netRevenue,
      profit,
      date: new Date().toISOString().split('T')[0],
      notes: newSale.notes || '',
      accountId: newSale.accountId
    }

    // Atualizar estoque
    setProducts(prev => prev.map(p => 
      p.id === newSale.productId 
        ? { ...p, quantity: p.quantity - quantity }
        : p
    ))

    setSales(prev => [...prev, sale])
    
    // CORREÇÃO: Adicionar o FATURAMENTO LÍQUIDO (não apenas o lucro) como receita na conta selecionada
    const revenueTransaction: Transaction = {
      id: (Date.now() + 1).toString(),
      type: 'receita',
      description: `Venda: ${product.name} (${quantity}x)`,
      amount: netRevenue, // MUDANÇA: usar netRevenue em vez de profit
      date: new Date().toISOString().split('T')[0],
      category: 'Vendas',
      accountId: newSale.accountId
    }
    setTransactions(prev => [...prev, revenueTransaction])

    // CORREÇÃO: Atualizar o saldo da conta bancária com o faturamento líquido
    setAccounts(prev => prev.map(account => 
      account.id === newSale.accountId 
        ? { ...account, balance: account.balance + netRevenue }
        : account
    ))

    // Atualizar também o estado dos saldos das contas
    setAccountBalances(prev => ({
      ...prev,
      [newSale.accountId]: {
        ...prev[newSale.accountId],
        balance: (parseFloat(prev[newSale.accountId]?.balance || '0') + netRevenue).toString()
      }
    }))

    setNewSale({
      productId: '',
      quantity: '',
      salePrice: '',
      shipping: '',
      fees: '',
      gifts: '',
      invoice: '',
      packaging: '',
      invoicePercentage: '5',
      notes: '',
      accountId: '1'
    })
  }

  // Funções para editar dados
  const startEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction)
  }

  const saveEditTransaction = () => {
    if (!editingTransaction) return

    setTransactions(prev => prev.map(t => 
      t.id === editingTransaction.id ? editingTransaction : t
    ))
    setEditingTransaction(null)
  }

  const startEditProduct = (product: Product) => {
    setEditingProduct(product)
  }

  const saveEditProduct = () => {
    if (!editingProduct) return

    setProducts(prev => prev.map(p => 
      p.id === editingProduct.id ? editingProduct : p
    ))
    setEditingProduct(null)
  }

  const startEditSale = (sale: Sale) => {
    setEditingSale(sale)
  }

  const saveEditSale = () => {
    if (!editingSale) return

    // Recalcular valores da venda editada
    const invoiceCost = (editingSale.salePrice * 5) / 100 // Assumindo 5% para simplificar
    const netRevenue = editingSale.salePrice - editingSale.shipping - editingSale.fees - editingSale.gifts - editingSale.packaging - invoiceCost
    const product = products.find(p => p.name === editingSale.productName)
    const profit = product ? netRevenue - (product.cost * editingSale.quantity) : 0

    const updatedSale = {
      ...editingSale,
      invoiceCost,
      netRevenue,
      profit
    }

    setSales(prev => prev.map(s => 
      s.id === editingSale.id ? updatedSale : s
    ))
    setEditingSale(null)
  }

  // Cálculos para relatórios
  const calculateFinancials = () => {
    const totalReceitas = transactions
      .filter(t => t.type === 'receita')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const totalDespesas = transactions
      .filter(t => t.type === 'despesa')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalVendas = sales.reduce((sum, s) => sum + s.netRevenue, 0)
    const totalLucro = sales.reduce((sum, s) => sum + s.profit, 0)

    return {
      totalReceitas,
      totalDespesas,
      saldoLiquido: totalReceitas - totalDespesas,
      totalLucro,
      totalVendas
    }
  }

  const calculateStockSummary = () => {
    const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0)
    const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.cost), 0)
    const lowStockCount = products.filter(p => p.quantity <= p.minStock).length
    
    return { totalQuantity, totalValue, lowStockCount }
  }

  const calculateMacroSummary = () => {
    const financials = calculateFinancials()
    const stockSummary = calculateStockSummary()
    
    // CORREÇÃO: Incluir saldos das contas bancárias no capital de giro
    const totalAccountBalances = accounts.reduce((sum, acc) => sum + acc.balance + acc.pendingBalance, 0)
    
    // Capital de giro total = receitas + valor do estoque + saldos das contas
    const capitalGiroTotal = financials.totalReceitas + stockSummary.totalValue + totalAccountBalances
    
    return {
      totalReceitas: financials.totalReceitas,
      valorEstoque: stockSummary.totalValue,
      saldosContas: totalAccountBalances,
      capitalGiroTotal
    }
  }

  const financials = calculateFinancials()
  const stockSummary = calculateStockSummary()
  const macroSummary = calculateMacroSummary()

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-black bg-clip-text text-transparent mb-2">
            Smart Fluxo Pro
          </h1>
          <p className="text-gray-700 font-medium">
            Gerencie suas finanças, estoque e vendas com máxima performance
          </p>
        </div>

        {/* Alertas de Estoque */}
        {stockSummary.lowStockCount > 0 && (
          <Alert className="mb-6 border-yellow-400 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800 font-medium">
              <strong>Atenção!</strong> {stockSummary.lowStockCount} produto(s) com estoque baixo. 
              Verifique a aba de Estoque para mais detalhes.
            </AlertDescription>
          </Alert>
        )}

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold opacity-90 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Total Receitas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {financials.totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-gray-800 to-black text-yellow-400 border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold opacity-90 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Total Despesas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {financials.totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold opacity-90 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Saldo Líquido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {financials.saldoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-black to-gray-800 text-yellow-400 border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold opacity-90 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Lucro Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {financials.totalLucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Principal */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-lg border-2 border-yellow-200">
            <TabsTrigger value="financeiro" className="flex items-center gap-2 data-[state=active]:bg-yellow-400 data-[state=active]:text-black font-bold">
              <DollarSign className="w-4 h-4" />
              Financeiro
            </TabsTrigger>
            <TabsTrigger value="estoque" className="flex items-center gap-2 data-[state=active]:bg-yellow-400 data-[state=active]:text-black font-bold">
              <Package className="w-4 h-4" />
              Estoque
            </TabsTrigger>
            <TabsTrigger value="vendas" className="flex items-center gap-2 data-[state=active]:bg-yellow-400 data-[state=active]:text-black font-bold">
              <ShoppingCart className="w-4 h-4" />
              Vendas
            </TabsTrigger>
            <TabsTrigger value="relatorios" className="flex items-center gap-2 data-[state=active]:bg-yellow-400 data-[state=active]:text-black font-bold">
              <BarChart3 className="w-4 h-4" />
              Relatórios
            </TabsTrigger>
          </TabsList>

          {/* Aba Financeiro */}
          <TabsContent value="financeiro" className="space-y-6">
            <Tabs value={financialSubTab} onValueChange={setFinancialSubTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-3 bg-white shadow-lg border-2 border-yellow-200">
                <TabsTrigger value="transactions" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black font-bold">
                  Transações
                </TabsTrigger>
                <TabsTrigger value="accounts" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black font-bold">
                  Contas Bancárias
                </TabsTrigger>
                <TabsTrigger value="macro" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black font-bold">
                  Resumo Macro
                </TabsTrigger>
              </TabsList>

              <TabsContent value="transactions" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Formulário de Nova Transação */}
                  <Card className="border-2 border-yellow-200">
                    <CardHeader className="bg-gradient-to-r from-yellow-100 to-yellow-50">
                      <CardTitle className="flex items-center gap-2 text-black">
                        <Plus className="w-5 h-5" />
                        Nova Transação
                      </CardTitle>
                      <CardDescription className="text-gray-700">
                        Adicione receitas e despesas
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="font-bold">Tipo</Label>
                          <Select 
                            value={newTransaction.type} 
                            onValueChange={(value: 'receita' | 'despesa') => 
                              setNewTransaction({...newTransaction, type: value})
                            }
                          >
                            <SelectTrigger className="border-2 border-yellow-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="receita">Receita</SelectItem>
                              <SelectItem value="despesa">Despesa</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="font-bold">Conta</Label>
                          <Select 
                            value={newTransaction.accountId} 
                            onValueChange={(value) => 
                              setNewTransaction({...newTransaction, accountId: value})
                            }
                          >
                            <SelectTrigger className="border-2 border-yellow-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {accounts.map(account => (
                                <SelectItem key={account.id} value={account.id}>
                                  {account.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label className="font-bold">Categoria</Label>
                        <Select 
                          value={newTransaction.category} 
                          onValueChange={(value) => 
                            setNewTransaction({...newTransaction, category: value})
                          }
                        >
                          <SelectTrigger className="border-2 border-yellow-200">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            {transactionCategories.map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="font-bold">Descrição</Label>
                        <Input
                          className="border-2 border-yellow-200"
                          value={newTransaction.description}
                          onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                          placeholder="Ex: Venda de produto, Pagamento fornecedor..."
                        />
                      </div>
                      <div>
                        <Label className="font-bold">Valor (R$)</Label>
                        <Input
                          className="border-2 border-yellow-200"
                          type="number"
                          step="0.01"
                          value={newTransaction.amount}
                          onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                          placeholder="0,00"
                        />
                      </div>
                      <Button onClick={addTransaction} className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold hover:from-yellow-500 hover:to-yellow-600">
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Transação
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Lista de Transações */}
                  <Card className="border-2 border-yellow-200">
                    <CardHeader className="bg-gradient-to-r from-yellow-100 to-yellow-50">
                      <CardTitle className="flex items-center gap-2 text-black">
                        <FileText className="w-5 h-5" />
                        Transações Recentes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {transactions.length === 0 ? (
                          <p className="text-gray-500 text-center py-8">
                            Nenhuma transação cadastrada
                          </p>
                        ) : (
                          transactions.slice(-10).reverse().map(transaction => {
                            const account = accounts.find(a => a.id === transaction.accountId)
                            return (
                              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-white rounded-lg border border-yellow-200">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <Badge variant={transaction.type === 'receita' ? 'default' : 'destructive'} className="font-bold">
                                      {transaction.type}
                                    </Badge>
                                    <span className="font-medium text-black">{transaction.description}</span>
                                  </div>
                                  <div className="text-sm text-gray-600 mt-1 font-medium">
                                    {transaction.category} • {account?.name || 'Conta não encontrada'} • {new Date(transaction.date).toLocaleDateString('pt-BR')}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className={`font-bold ${transaction.type === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                                    {transaction.type === 'receita' ? '+' : '-'}R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => startEditTransaction(transaction)}
                                    className="border-yellow-300 hover:bg-yellow-50"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="accounts" className="space-y-6">
                <Card className="border-2 border-yellow-200">
                  <CardHeader className="bg-gradient-to-r from-yellow-100 to-yellow-50">
                    <CardTitle className="flex items-center gap-2 text-black">
                      <CreditCard className="w-5 h-5" />
                      Gerenciamento de Contas Bancárias
                    </CardTitle>
                    <CardDescription className="text-gray-700">
                      Configure quantas contas você gerencia e seus saldos
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    {/* Configuração do número de contas */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200">
                      <Label className="font-bold text-blue-800 mb-2 block">Quantas contas você gerencia?</Label>
                      <Select 
                        value={numberOfAccounts.toString()} 
                        onValueChange={(value) => updateNumberOfAccounts(parseInt(value))}
                      >
                        <SelectTrigger className="border-2 border-blue-300 bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} contas
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Saldos das contas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {accounts.map(account => (
                        <Card key={account.id} className="border-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg font-bold text-black flex items-center gap-2">
                              <CreditCard className="w-5 h-5 text-yellow-600" />
                              {account.name}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <Label className="font-bold text-gray-800">Saldo em conta</Label>
                              <Input
                                className="border-2 border-yellow-200"
                                type="number"
                                step="0.01"
                                value={accountBalances[account.id]?.balance || '0'}
                                onChange={(e) => updateAccountBalance(account.id, 'balance', e.target.value)}
                                placeholder="0,00"
                              />
                              <div className="text-sm text-gray-600 mt-1 font-medium">
                                R$ {account.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </div>
                            </div>
                            <div>
                              <Label className="font-bold text-gray-800">Saldo à liberar</Label>
                              <Input
                                className="border-2 border-yellow-200"
                                type="number"
                                step="0.01"
                                value={accountBalances[account.id]?.pending || '0'}
                                onChange={(e) => updateAccountBalance(account.id, 'pending', e.target.value)}
                                placeholder="0,00"
                              />
                              <div className="text-sm text-gray-600 mt-1 font-medium">
                                R$ {account.pendingBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </div>
                            </div>
                            <div className="pt-2 border-t border-gray-200">
                              <div className="text-sm font-bold text-green-600">
                                Total disponível: R$ {(account.balance + account.pendingBalance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Resumo total das contas */}
                    <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-green-100">
                      <CardHeader>
                        <CardTitle className="text-xl font-bold text-green-800 flex items-center gap-2">
                          <DollarSign className="w-6 h-6" />
                          Resumo Total das Contas
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-sm text-green-700 font-bold">Total em Contas</div>
                            <div className="text-2xl font-bold text-green-800">
                              R$ {accounts.reduce((sum, acc) => sum + acc.balance, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-green-700 font-bold">Total à Liberar</div>
                            <div className="text-2xl font-bold text-green-800">
                              R$ {accounts.reduce((sum, acc) => sum + acc.pendingBalance, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-green-700 font-bold">Total Geral</div>
                            <div className="text-3xl font-bold text-green-800">
                              R$ {accounts.reduce((sum, acc) => sum + acc.balance + acc.pendingBalance, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="macro" className="space-y-6">
                <Card className="border-2 border-yellow-200">
                  <CardHeader className="bg-gradient-to-r from-yellow-100 to-yellow-50">
                    <CardTitle className="flex items-center gap-2 text-black">
                      <PieChart className="w-5 h-5" />
                      Resumo Macro - Capital de Giro Total
                    </CardTitle>
                    <CardDescription className="text-gray-700">
                      Visão geral do capital disponível (receitas + estoque + contas bancárias)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="p-6 bg-gradient-to-r from-green-100 to-green-50 rounded-lg border-2 border-green-200">
                        <div className="text-sm text-green-700 font-bold mb-2">Total de Receitas</div>
                        <div className="text-3xl font-bold text-green-800">
                          R$ {macroSummary.totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-xs text-green-600 mt-1 font-medium">
                          Receitas registradas
                        </div>
                      </div>

                      <div className="p-6 bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg border-2 border-blue-200">
                        <div className="text-sm text-blue-700 font-bold mb-2">Valor do Estoque</div>
                        <div className="text-3xl font-bold text-blue-800">
                          R$ {macroSummary.valorEstoque.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-xs text-blue-600 mt-1 font-medium">
                          Capital em produtos
                        </div>
                      </div>

                      <div className="p-6 bg-gradient-to-r from-orange-100 to-orange-50 rounded-lg border-2 border-orange-200">
                        <div className="text-sm text-orange-700 font-bold mb-2">Saldos das Contas</div>
                        <div className="text-3xl font-bold text-orange-800">
                          R$ {macroSummary.saldosContas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-xs text-orange-600 mt-1 font-medium">
                          Dinheiro nas contas
                        </div>
                      </div>

                      <div className="p-6 bg-gradient-to-r from-purple-100 to-purple-50 rounded-lg border-2 border-purple-200">
                        <div className="text-sm text-purple-700 font-bold mb-2">Capital de Giro Total</div>
                        <div className="text-4xl font-bold text-purple-800">
                          R$ {macroSummary.capitalGiroTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-xs text-purple-600 mt-1 font-medium">
                          Receitas + Estoque + Contas
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 p-6 bg-gradient-to-r from-yellow-100 to-yellow-50 rounded-lg border-2 border-yellow-200">
                      <h3 className="text-lg font-bold text-black mb-4">Análise do Capital de Giro</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="font-bold text-gray-800 mb-2">Composição:</div>
                          <div className="space-y-1 text-gray-700">
                            <div>• Receitas: {macroSummary.capitalGiroTotal > 0 ? ((macroSummary.totalReceitas / macroSummary.capitalGiroTotal) * 100).toFixed(1) : '0.0'}%</div>
                            <div>• Valor em estoque: {macroSummary.capitalGiroTotal > 0 ? ((macroSummary.valorEstoque / macroSummary.capitalGiroTotal) * 100).toFixed(1) : '0.0'}%</div>
                            <div>• Saldos das contas: {macroSummary.capitalGiroTotal > 0 ? ((macroSummary.saldosContas / macroSummary.capitalGiroTotal) * 100).toFixed(1) : '0.0'}%</div>
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-gray-800 mb-2">Indicadores:</div>
                          <div className="space-y-1 text-gray-700">
                            <div>• Total de produtos: {stockSummary.totalQuantity} unidades</div>
                            <div>• Produtos em alerta: {stockSummary.lowStockCount}</div>
                            <div>• Contas gerenciadas: {accounts.length}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Aba Estoque */}
          <TabsContent value="estoque" className="space-y-6">
            {/* Resumo do Estoque */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black border-0 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold opacity-90 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Quantidade Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stockSummary.totalQuantity} unidades
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-black to-gray-800 text-yellow-400 border-0 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold opacity-90 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Valor Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    R$ {stockSummary.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold opacity-90 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Alertas de Estoque
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stockSummary.lowStockCount} produtos
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Formulário de Novo Produto */}
              <Card className="border-2 border-yellow-200">
                <CardHeader className="bg-gradient-to-r from-yellow-100 to-yellow-50">
                  <CardTitle className="flex items-center gap-2 text-black">
                    <Plus className="w-5 h-5" />
                    Novo Produto
                  </CardTitle>
                  <CardDescription className="text-gray-700">
                    Adicione produtos ao estoque
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div>
                    <Label className="font-bold">Nome do Produto</Label>
                    <Input
                      className="border-2 border-yellow-200"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                      placeholder="Ex: Smartphone Samsung Galaxy..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-bold">Quantidade</Label>
                      <Input
                        className="border-2 border-yellow-200"
                        type="number"
                        value={newProduct.quantity}
                        onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label className="font-bold">Custo Unitário (R$)</Label>
                      <Input
                        className="border-2 border-yellow-200"
                        type="number"
                        step="0.01"
                        value={newProduct.cost}
                        onChange={(e) => setNewProduct({...newProduct, cost: e.target.value})}
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="font-bold">Categoria</Label>
                    <Select 
                      value={newProduct.category} 
                      onValueChange={(value) => 
                        setNewProduct({...newProduct, category: value})
                      }
                    >
                      <SelectTrigger className="border-2 border-yellow-200">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {productCategories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="font-bold">Fornecedor</Label>
                    <Input
                      className="border-2 border-yellow-200"
                      value={newProduct.supplier}
                      onChange={(e) => setNewProduct({...newProduct, supplier: e.target.value})}
                      placeholder="Nome do fornecedor"
                    />
                  </div>
                  <div>
                    <Label className="font-bold">Estoque Mínimo</Label>
                    <Input
                      className="border-2 border-yellow-200"
                      type="number"
                      value={newProduct.minStock}
                      onChange={(e) => setNewProduct({...newProduct, minStock: e.target.value})}
                      placeholder="5"
                    />
                  </div>
                  <Button onClick={addProduct} className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold hover:from-yellow-500 hover:to-yellow-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Produto
                  </Button>
                </CardContent>
              </Card>

              {/* Lista de Produtos */}
              <Card className="border-2 border-yellow-200">
                <CardHeader className="bg-gradient-to-r from-yellow-100 to-yellow-50">
                  <CardTitle className="flex items-center gap-2 text-black">
                    <Package className="w-5 h-5" />
                    Produtos em Estoque
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {products.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        Nenhum produto cadastrado
                      </p>
                    ) : (
                      products.map(product => (
                        <div key={product.id} className="p-3 bg-gradient-to-r from-yellow-50 to-white rounded-lg border border-yellow-200">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-black">{product.name}</h4>
                            <div className="flex gap-2">
                              <Badge variant={product.quantity > product.minStock ? 'default' : product.quantity > 0 ? 'secondary' : 'destructive'} className="font-bold">
                                {product.quantity} unidades
                              </Badge>
                              {product.quantity <= product.minStock && (
                                <Badge variant="destructive" className="font-bold">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  Baixo
                                </Badge>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => startEditProduct(product)}
                                className="border-yellow-300 hover:bg-yellow-50"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-sm text-gray-700 space-y-1 font-medium">
                            <div>Categoria: {product.category}</div>
                            <div>Custo: R$ {product.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                            <div>Fornecedor: {product.supplier}</div>
                            <div>Estoque Mínimo: {product.minStock}</div>
                            <div className="font-bold text-black">
                              Valor Total: R$ {(product.quantity * product.cost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Aba Vendas */}
          <TabsContent value="vendas" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Formulário de Nova Venda */}
              <Card className="border-2 border-yellow-200">
                <CardHeader className="bg-gradient-to-r from-yellow-100 to-yellow-50">
                  <CardTitle className="flex items-center gap-2 text-black">
                    <Plus className="w-5 h-5" />
                    Registrar Venda
                  </CardTitle>
                  <CardDescription className="text-gray-700">
                    Registre uma nova venda com custo de nota fiscal
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div>
                    <Label className="font-bold">Produto</Label>
                    <Select 
                      value={newSale.productId} 
                      onValueChange={(value) => 
                        setNewSale({...newSale, productId: value})
                      }
                    >
                      <SelectTrigger className="border-2 border-yellow-200">
                        <SelectValue placeholder="Selecione um produto..." />
                      </SelectTrigger>
                      <SelectContent>
                        {products.filter(p => p.quantity > 0).map(product => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} (Estoque: {product.quantity})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-bold">Quantidade</Label>
                      <Input
                        className="border-2 border-yellow-200"
                        type="number"
                        value={newSale.quantity}
                        onChange={(e) => setNewSale({...newSale, quantity: e.target.value})}
                        placeholder="1"
                      />
                    </div>
                    <div>
                      <Label className="font-bold">Conta de Destino</Label>
                      <Select 
                        value={newSale.accountId} 
                        onValueChange={(value) => 
                          setNewSale({...newSale, accountId: value})
                        }
                      >
                        <SelectTrigger className="border-2 border-yellow-200">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map(account => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="font-bold">Preço de Venda (R$)</Label>
                    <Input
                      className="border-2 border-yellow-200"
                      type="number"
                      step="0.01"
                      value={newSale.salePrice}
                      onChange={(e) => setNewSale({...newSale, salePrice: e.target.value})}
                      placeholder="0,00"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-bold">Frete (R$)</Label>
                      <Input
                        className="border-2 border-yellow-200"
                        type="number"
                        step="0.01"
                        value={newSale.shipping}
                        onChange={(e) => setNewSale({...newSale, shipping: e.target.value})}
                        placeholder="0,00"
                      />
                    </div>
                    <div>
                      <Label className="font-bold">Taxas (R$)</Label>
                      <Input
                        className="border-2 border-yellow-200"
                        type="number"
                        step="0.01"
                        value={newSale.fees}
                        onChange={(e) => setNewSale({...newSale, fees: e.target.value})}
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-bold">Brindes (R$)</Label>
                      <Input
                        className="border-2 border-yellow-200"
                        type="number"
                        step="0.01"
                        value={newSale.gifts}
                        onChange={(e) => setNewSale({...newSale, gifts: e.target.value})}
                        placeholder="0,00"
                      />
                    </div>
                    <div>
                      <Label className="font-bold">Embalagem (R$)</Label>
                      <Input
                        className="border-2 border-yellow-200"
                        type="number"
                        step="0.01"
                        value={newSale.packaging}
                        onChange={(e) => setNewSale({...newSale, packaging: e.target.value})}
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-bold">Nota Fiscal</Label>
                      <Input
                        className="border-2 border-yellow-200"
                        value={newSale.invoice}
                        onChange={(e) => setNewSale({...newSale, invoice: e.target.value})}
                        placeholder="Número da nota fiscal"
                      />
                    </div>
                    <div>
                      <Label className="font-bold">Custo NF (% do preço)</Label>
                      <Input
                        className="border-2 border-yellow-200"
                        type="number"
                        step="0.1"
                        value={newSale.invoicePercentage}
                        onChange={(e) => setNewSale({...newSale, invoicePercentage: e.target.value})}
                        placeholder="5"
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        {newSale.salePrice && newSale.invoicePercentage ? 
                          `R$ ${((parseFloat(newSale.salePrice) * parseFloat(newSale.invoicePercentage)) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
                          : 'R$ 0,00'
                        }
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label className="font-bold">Observações</Label>
                    <Textarea
                      className="border-2 border-yellow-200"
                      value={newSale.notes}
                      onChange={(e) => setNewSale({...newSale, notes: e.target.value})}
                      placeholder="Observações sobre a venda..."
                      rows={3}
                    />
                  </div>
                  <Button onClick={addSale} className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold hover:from-yellow-500 hover:to-yellow-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Registrar Venda
                  </Button>
                </CardContent>
              </Card>

              {/* Lista de Vendas */}
              <Card className="border-2 border-yellow-200">
                <CardHeader className="bg-gradient-to-r from-yellow-100 to-yellow-50">
                  <CardTitle className="flex items-center gap-2 text-black">
                    <ShoppingCart className="w-5 h-5" />
                    Vendas Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {sales.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        Nenhuma venda registrada
                      </p>
                    ) : (
                      sales.slice(-10).reverse().map(sale => {
                        const account = accounts.find(a => a.id === sale.accountId)
                        return (
                          <div key={sale.id} className="p-3 bg-gradient-to-r from-yellow-50 to-white rounded-lg border border-yellow-200">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-bold text-black">{sale.productName}</h4>
                              <div className="flex gap-2">
                                <Badge className="bg-yellow-400 text-black font-bold">
                                  {sale.quantity}x
                                </Badge>
                                <Badge variant="outline" className="font-bold">
                                  {account?.name || 'Conta não encontrada'}
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => startEditSale(sale)}
                                  className="border-yellow-300 hover:bg-yellow-50"
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="text-sm text-gray-700 space-y-1 font-medium">
                              <div className="grid grid-cols-2 gap-2">
                                <div>Preço: R$ {sale.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                                <div>Frete: R$ {sale.shipping.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                                <div>Taxas: R$ {sale.fees.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                                <div>Embalagem: R$ {sale.packaging.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                                {sale.invoiceCost > 0 && (
                                  <div className="col-span-2">Custo NF: R$ {sale.invoiceCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                                )}
                              </div>
                              <div className="pt-2 border-t border-yellow-200">
                                <div className="font-bold text-blue-600">
                                  Faturamento Líquido: R$ {sale.netRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
                                <div className={`font-bold ${sale.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  Lucro: R$ {sale.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
                                <div className="text-xs text-gray-600 mt-1 font-medium">
                                  {new Date(sale.date).toLocaleDateString('pt-BR')} • NF: {sale.invoice}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Aba Relatórios */}
          <TabsContent value="relatorios" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Resumo Financeiro */}
              <Card className="border-2 border-yellow-200">
                <CardHeader className="bg-gradient-to-r from-yellow-100 to-yellow-50">
                  <CardTitle className="flex items-center gap-2 text-black">
                    <BarChart3 className="w-5 h-5" />
                    Resumo Financeiro
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gradient-to-r from-green-100 to-green-50 rounded-lg border border-green-200">
                      <div className="text-sm text-green-700 font-bold">Total Receitas</div>
                      <div className="text-2xl font-bold text-green-800">
                        R$ {financials.totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-red-100 to-red-50 rounded-lg border border-red-200">
                      <div className="text-sm text-red-700 font-bold">Total Despesas</div>
                      <div className="text-2xl font-bold text-red-800">
                        R$ {financials.totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg border border-blue-200">
                    <div className="text-sm text-blue-700 font-bold">Saldo Líquido</div>
                    <div className="text-3xl font-bold text-blue-800">
                      R$ {financials.saldoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-purple-100 to-purple-50 rounded-lg border border-purple-200">
                    <div className="text-sm text-purple-700 font-bold">Lucro Total Vendas</div>
                    <div className="text-3xl font-bold text-purple-800">
                      R$ {financials.totalLucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Estatísticas de Vendas */}
              <Card className="border-2 border-yellow-200">
                <CardHeader className="bg-gradient-to-r from-yellow-100 to-yellow-50">
                  <CardTitle className="flex items-center gap-2 text-black">
                    <TrendingUp className="w-5 h-5" />
                    Estatísticas de Vendas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gradient-to-r from-orange-100 to-orange-50 rounded-lg border border-orange-200">
                      <div className="text-sm text-orange-700 font-bold">Total de Vendas</div>
                      <div className="text-2xl font-bold text-orange-800">
                        {sales.length}
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-teal-100 to-teal-50 rounded-lg border border-teal-200">
                      <div className="text-sm text-teal-700 font-bold">Produtos Vendidos</div>
                      <div className="text-2xl font-bold text-teal-800">
                        {sales.reduce((sum, s) => sum + s.quantity, 0)}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-indigo-100 to-indigo-50 rounded-lg border border-indigo-200">
                    <div className="text-sm text-indigo-700 font-bold">Ticket Médio</div>
                    <div className="text-2xl font-bold text-indigo-800">
                      R$ {sales.length > 0 
                        ? (sales.reduce((sum, s) => sum + s.netRevenue, 0) / sales.length).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                        : '0,00'
                      }
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-pink-100 to-pink-50 rounded-lg border border-pink-200">
                    <div className="text-sm text-pink-700 font-bold">Margem de Lucro Média</div>
                    <div className="text-2xl font-bold text-pink-800">
                      {sales.length > 0 && sales.reduce((sum, s) => sum + s.netRevenue, 0) > 0
                        ? ((sales.reduce((sum, s) => sum + s.profit, 0) / sales.reduce((sum, s) => sum + s.netRevenue, 0)) * 100).toFixed(1)
                        : '0.0'
                      }%
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Produtos com Baixo Estoque */}
              <Card className="border-2 border-yellow-200">
                <CardHeader className="bg-gradient-to-r from-red-100 to-red-50">
                  <CardTitle className="flex items-center gap-2 text-red-800">
                    <AlertTriangle className="w-5 h-5" />
                    Alertas de Estoque
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {products.filter(p => p.quantity <= p.minStock).length === 0 ? (
                      <p className="text-gray-500 text-center py-4">
                        Todos os produtos com estoque adequado
                      </p>
                    ) : (
                      products.filter(p => p.quantity <= p.minStock).map(product => (
                        <div key={product.id} className="p-3 bg-gradient-to-r from-red-50 to-yellow-50 border-2 border-red-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-bold text-red-800">{product.name}</h4>
                              <p className="text-sm text-red-600 font-medium">Categoria: {product.category}</p>
                              <p className="text-sm text-red-600 font-medium">Estoque Mínimo: {product.minStock}</p>
                            </div>
                            <Badge variant="destructive" className="font-bold">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              {product.quantity} restantes
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Top Produtos Vendidos */}
              <Card className="border-2 border-yellow-200">
                <CardHeader className="bg-gradient-to-r from-yellow-100 to-yellow-50">
                  <CardTitle className="flex items-center gap-2 text-black">
                    <TrendingUp className="w-5 h-5" />
                    Top Produtos Vendidos
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {(() => {
                      const productSales = sales.reduce((acc, sale) => {
                        if (!acc[sale.productName]) {
                          acc[sale.productName] = { quantity: 0, revenue: 0 }
                        }
                        acc[sale.productName].quantity += sale.quantity
                        acc[sale.productName].revenue += sale.netRevenue
                        return acc
                      }, {} as Record<string, { quantity: number; revenue: number }>)

                      const topProducts = Object.entries(productSales)
                        .sort(([,a], [,b]) => b.quantity - a.quantity)
                        .slice(0, 5)

                      return topProducts.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">
                          Nenhuma venda registrada ainda
                        </p>
                      ) : (
                        topProducts.map(([productName, data], index) => (
                          <div key={productName} className="p-3 bg-gradient-to-r from-yellow-50 to-white rounded-lg border border-yellow-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-bold text-black">
                                    {index + 1}
                                  </span>
                                </div>
                                <div>
                                  <h4 className="font-bold text-black">{productName}</h4>
                                  <p className="text-sm text-gray-700 font-medium">
                                    {data.quantity} vendidos • R$ {data.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )
                    })()}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Diálogos de Edição */}
        
        {/* Dialog para Editar Transação */}
        <Dialog open={!!editingTransaction} onOpenChange={() => setEditingTransaction(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Transação</DialogTitle>
              <DialogDescription>
                Corrija os dados da transação
              </DialogDescription>
            </DialogHeader>
            {editingTransaction && (
              <div className="space-y-4">
                <div>
                  <Label className="font-bold">Tipo</Label>
                  <Select 
                    value={editingTransaction.type} 
                    onValueChange={(value: 'receita' | 'despesa') => 
                      setEditingTransaction({...editingTransaction, type: value})
                    }
                  >
                    <SelectTrigger className="border-2 border-yellow-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="receita">Receita</SelectItem>
                      <SelectItem value="despesa">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="font-bold">Categoria</Label>
                  <Select 
                    value={editingTransaction.category} 
                    onValueChange={(value) => 
                      setEditingTransaction({...editingTransaction, category: value})
                    }
                  >
                    <SelectTrigger className="border-2 border-yellow-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {transactionCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="font-bold">Descrição</Label>
                  <Input
                    className="border-2 border-yellow-200"
                    value={editingTransaction.description}
                    onChange={(e) => setEditingTransaction({...editingTransaction, description: e.target.value})}
                  />
                </div>
                <div>
                  <Label className="font-bold">Valor (R$)</Label>
                  <Input
                    className="border-2 border-yellow-200"
                    type="number"
                    step="0.01"
                    value={editingTransaction.amount}
                    onChange={(e) => setEditingTransaction({...editingTransaction, amount: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveEditTransaction} className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold">
                    Salvar
                  </Button>
                  <Button variant="outline" onClick={() => setEditingTransaction(null)} className="flex-1">
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog para Editar Produto */}
        <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Produto</DialogTitle>
              <DialogDescription>
                Corrija os dados do produto
              </DialogDescription>
            </DialogHeader>
            {editingProduct && (
              <div className="space-y-4">
                <div>
                  <Label className="font-bold">Nome do Produto</Label>
                  <Input
                    className="border-2 border-yellow-200"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-bold">Quantidade</Label>
                    <Input
                      className="border-2 border-yellow-200"
                      type="number"
                      value={editingProduct.quantity}
                      onChange={(e) => setEditingProduct({...editingProduct, quantity: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label className="font-bold">Custo Unitário (R$)</Label>
                    <Input
                      className="border-2 border-yellow-200"
                      type="number"
                      step="0.01"
                      value={editingProduct.cost}
                      onChange={(e) => setEditingProduct({...editingProduct, cost: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <div>
                  <Label className="font-bold">Categoria</Label>
                  <Select 
                    value={editingProduct.category} 
                    onValueChange={(value) => 
                      setEditingProduct({...editingProduct, category: value})
                    }
                  >
                    <SelectTrigger className="border-2 border-yellow-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {productCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="font-bold">Fornecedor</Label>
                  <Input
                    className="border-2 border-yellow-200"
                    value={editingProduct.supplier}
                    onChange={(e) => setEditingProduct({...editingProduct, supplier: e.target.value})}
                  />
                </div>
                <div>
                  <Label className="font-bold">Estoque Mínimo</Label>
                  <Input
                    className="border-2 border-yellow-200"
                    type="number"
                    value={editingProduct.minStock}
                    onChange={(e) => setEditingProduct({...editingProduct, minStock: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveEditProduct} className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold">
                    Salvar
                  </Button>
                  <Button variant="outline" onClick={() => setEditingProduct(null)} className="flex-1">
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog para Editar Venda */}
        <Dialog open={!!editingSale} onOpenChange={() => setEditingSale(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Editar Venda</DialogTitle>
              <DialogDescription>
                Corrija os dados da venda
              </DialogDescription>
            </DialogHeader>
            {editingSale && (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div>
                  <Label className="font-bold">Produto</Label>
                  <Input
                    className="border-2 border-yellow-200"
                    value={editingSale.productName}
                    disabled
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-bold">Quantidade</Label>
                    <Input
                      className="border-2 border-yellow-200"
                      type="number"
                      value={editingSale.quantity}
                      onChange={(e) => setEditingSale({...editingSale, quantity: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label className="font-bold">Preço de Venda (R$)</Label>
                    <Input
                      className="border-2 border-yellow-200"
                      type="number"
                      step="0.01"
                      value={editingSale.salePrice}
                      onChange={(e) => setEditingSale({...editingSale, salePrice: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-bold">Frete (R$)</Label>
                    <Input
                      className="border-2 border-yellow-200"
                      type="number"
                      step="0.01"
                      value={editingSale.shipping}
                      onChange={(e) => setEditingSale({...editingSale, shipping: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label className="font-bold">Taxas (R$)</Label>
                    <Input
                      className="border-2 border-yellow-200"
                      type="number"
                      step="0.01"
                      value={editingSale.fees}
                      onChange={(e) => setEditingSale({...editingSale, fees: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-bold">Brindes (R$)</Label>
                    <Input
                      className="border-2 border-yellow-200"
                      type="number"
                      step="0.01"
                      value={editingSale.gifts}
                      onChange={(e) => setEditingSale({...editingSale, gifts: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label className="font-bold">Embalagem (R$)</Label>
                    <Input
                      className="border-2 border-yellow-200"
                      type="number"
                      step="0.01"
                      value={editingSale.packaging}
                      onChange={(e) => setEditingSale({...editingSale, packaging: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <div>
                  <Label className="font-bold">Nota Fiscal</Label>
                  <Input
                    className="border-2 border-yellow-200"
                    value={editingSale.invoice}
                    onChange={(e) => setEditingSale({...editingSale, invoice: e.target.value})}
                  />
                </div>
                <div>
                  <Label className="font-bold">Observações</Label>
                  <Textarea
                    className="border-2 border-yellow-200"
                    value={editingSale.notes}
                    onChange={(e) => setEditingSale({...editingSale, notes: e.target.value})}
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveEditSale} className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold">
                    Salvar
                  </Button>
                  <Button variant="outline" onClick={() => setEditingSale(null)} className="flex-1">
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}