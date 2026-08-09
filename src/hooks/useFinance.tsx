import { useState, useEffect, useMemo } from 'react';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  onSnapshot, 
  orderBy, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc,
  getDoc,
  limit,
  arrayUnion
} from 'firebase/firestore';
import { useAuth } from './useAuth';

export interface Transaction {
  id: string;
  userId: string;
  type: 'income' | 'expense' | 'investment' | 'transfer';
  category: string;
  amount: number;
  description: string;
  date: string;
  accountId?: string;
  accountName?: string;
  paymentMethod?: string;
  goalId?: string;
  clientId?: string;
  clientName?: string;
  paymentId?: string;
  source?: 'MANUAL' | 'CLIENT_PAYMENT' | 'TRAFFIC_EXPENSE' | 'DEBT_PAYMENT' | 'INVESTMENT' | 'TRANSFER';
  sourceId?: string;
  notes?: string;
  userName?: string;
}

export interface Debt {
  id: string;
  title: string;
  totalAmount: number;
  remainingAmount: number;
  totalInstallments: number;
  paidInstallments: number;
  status: 'active' | 'paid' | 'delayed';
  monthlyPayment: number;
  dueDate?: string;
  interestRate?: number;
  notes?: string;
}

export interface CreditCard {
  id: string;
  name: string;
  institution: string;
  flag?: string;
  lastFourDigits?: string;
  limit: number;
  balance: number; // utilized limit
  closingDay: number;
  dueDate: number;
  color?: string;
}

export interface Goal {
  id: string;
  title: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  status: 'in_progress' | 'completed';
  description?: string;
}

export interface FinancialAccount {
  id: string;
  name: string;
  type: 'bank' | 'wallet' | 'digital' | 'cash' | 'other';
  balance: number;
  institution?: string;
  notes?: string;
}

export interface ClientPayment {
  id: string;
  amount: number;
  date: string;
  accountId?: string;
  accountName?: string;
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
  userName?: string;
}

export interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  service: string;
  amount?: number; // legacy alias for totalAmount
  totalAmount: number; // Contract total amount
  paidAmount: number; // Accumulated payments
  remainingAmount: number; // totalAmount - paidAmount
  contractDate: string;
  paymentDate: string; // Due date
  status: 'AGUARDANDO' | 'PAGAMENTO PARCIAL' | 'PAGO' | 'ATRASADO' | 'CANCELADO' | 'ATIVO' | 'PENDENTE' | 'A RECEBER';
  notes?: string;
  payments?: ClientPayment[];
}

export interface Investment {
  id: string;
  asset: string;
  category: 'renda_fixa' | 'acoes' | 'etfs' | 'cripto' | 'fundos' | 'outros';
  investedAmount: number;
  currentAmount: number;
  quantity?: number;
  price?: number;
  date: string;
  notes?: string;
}

export interface TrafficCampaign {
  id: string;
  name: string;
  investment: number;
  returnAmount: number;
  roas: number;
  date: string;
  accountId?: string;
  accountName?: string;
  notes?: string;
}

export interface FinancialCommitment {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense' | 'investment';
  dueDate: string;
  status: 'pending' | 'completed';
  category?: string;
  notes?: string;
}

export interface Log {
  id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
}

export function useFinance() {
  const { profile, user } = useAuth();
  const [coupleData, setCoupleData] = useState<any>(null);
  const [partner, setPartner] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [trafficCampaigns, setTrafficCampaigns] = useState<TrafficCampaign[]>([]);
  const [commitments, setCommitments] = useState<FinancialCommitment[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUserName = profile?.displayName || user?.displayName || user?.email || 'Usuário';

  useEffect(() => {
    if (!profile?.currentCoupleId) {
      setLoading(false);
      return;
    }

    const coupleRef = doc(db, 'couples', profile.currentCoupleId);
    
    // Couple data sync
    const unsubCouple = onSnapshot(coupleRef, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setCoupleData(data);
        
        const partnerId = data.partner1 === user?.uid ? data.partner2 : data.partner1;
        if (partnerId) {
          const partnerSnap = await getDoc(doc(db, 'users', partnerId));
          if (partnerSnap.exists()) {
            setPartner(partnerSnap.data());
          }
        }
      }
    });

    // Transactions sync
    const transQuery = query(
      collection(db, 'couples', profile.currentCoupleId, 'transactions'),
      orderBy('date', 'desc')
    );
    const unsubTrans = onSnapshot(transQuery, (snapshot) => {
      setTransactions(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Transaction)));
    });

    // Debts sync
    const debtsQuery = query(collection(db, 'couples', profile.currentCoupleId, 'debts'));
    const unsubDebts = onSnapshot(debtsQuery, (snapshot) => {
      setDebts(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Debt)));
    });

    // Goals sync
    const goalsQuery = query(collection(db, 'couples', profile.currentCoupleId, 'goals'));
    const unsubGoals = onSnapshot(goalsQuery, (snapshot) => {
      setGoals(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Goal)));
    });

    // Credit Cards sync
    const cardsQuery = query(collection(db, 'couples', profile.currentCoupleId, 'creditCards'));
    const unsubCards = onSnapshot(cardsQuery, (snapshot) => {
      setCreditCards(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CreditCard)));
    });

    // Accounts sync
    const accountsQuery = query(collection(db, 'couples', profile.currentCoupleId, 'accounts'));
    const unsubAccounts = onSnapshot(accountsQuery, (snapshot) => {
      setAccounts(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FinancialAccount)));
    });

    // Clients sync
    const clientsQuery = query(collection(db, 'couples', profile.currentCoupleId, 'clients'));
    const unsubClients = onSnapshot(clientsQuery, (snapshot) => {
      setClients(snapshot.docs.map(d => {
        const data = d.data();
        const total = data.totalAmount ?? data.amount ?? 0;
        const paid = data.paidAmount ?? (data.status === 'PAGO' ? total : 0);
        const remaining = data.remainingAmount ?? Math.max(0, total - paid);
        return {
          id: d.id,
          ...data,
          totalAmount: total,
          paidAmount: paid,
          remainingAmount: remaining,
          payments: data.payments || []
        } as Client;
      }));
    });

    // Investments sync
    const invQuery = query(collection(db, 'couples', profile.currentCoupleId, 'investments'));
    const unsubInv = onSnapshot(invQuery, (snapshot) => {
      setInvestments(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Investment)));
    });

    // Traffic campaigns sync
    const trafficQuery = query(collection(db, 'couples', profile.currentCoupleId, 'traffic'));
    const unsubTraffic = onSnapshot(trafficQuery, (snapshot) => {
      setTrafficCampaigns(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as TrafficCampaign)));
    });

    // Commitments sync
    const commQuery = query(collection(db, 'couples', profile.currentCoupleId, 'commitments'));
    const unsubComm = onSnapshot(commQuery, (snapshot) => {
      setCommitments(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FinancialCommitment)));
    });

    // Logs sync (limited to 50 for performance)
    const logsQuery = query(
      collection(db, 'couples', profile.currentCoupleId, 'logs'),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    const unsubLogs = onSnapshot(logsQuery, (snapshot) => {
      setLogs(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Log)));
    });

    setLoading(false);

    return () => {
      unsubCouple();
      unsubTrans();
      unsubDebts();
      unsubGoals();
      unsubCards();
      unsubAccounts();
      unsubClients();
      unsubInv();
      unsubTraffic();
      unsubComm();
      unsubLogs();
    };
  }, [profile?.currentCoupleId, user?.uid]);

  // Memoized aggregations for fast performance
  const stats = useMemo(() => {
    const realTransactions = transactions.filter(t => t.type !== 'transfer');
    
    const balance = realTransactions.reduce((acc, t) => {
      if (t.type === 'income') return acc + t.amount;
      if (t.type === 'expense') return acc - t.amount;
      return acc;
    }, 0);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthTransactions = realTransactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const totalIncomeMonth = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);

    const totalExpenseMonth = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);

    const totalInvestedMonth = currentMonthTransactions
      .filter(t => t.type === 'investment')
      .reduce((acc, t) => acc + t.amount, 0);

    const monthResult = totalIncomeMonth - totalExpenseMonth;

    // Total receivables calculation (sum of remainingAmount for clients not fully paid)
    const totalReceivables = clients
      .filter(c => c.status !== 'PAGO' && c.status !== 'CANCELADO')
      .reduce((acc, c) => acc + (c.remainingAmount ?? (c.totalAmount || c.amount || 0)), 0);

    const totalActiveDebt = debts
      .filter(d => d.status === 'active' || d.status === 'delayed')
      .reduce((acc, d) => acc + d.remainingAmount, 0);

    const totalInvestmentsPortfolio = investments.reduce((acc, i) => acc + (i.currentAmount || i.investedAmount), 0);

    return {
      balance,
      totalIncomeMonth,
      totalExpenseMonth,
      totalInvestedMonth,
      monthResult,
      totalReceivables,
      totalActiveDebt,
      totalInvestmentsPortfolio
    };
  }, [transactions, clients, debts, investments]);

  // Helper to adjust Account Balance in Firestore
  const updateAccountBalance = async (accountId: string, deltaAmount: number) => {
    if (!profile?.currentCoupleId || !accountId) return;
    const accRef = doc(db, 'couples', profile.currentCoupleId, 'accounts', accountId);
    const accSnap = await getDoc(accRef);
    if (accSnap.exists()) {
      const currentBal = accSnap.data().balance || 0;
      await updateDoc(accRef, { balance: currentBal + deltaAmount });
    }
  };

  // CRUD Methods
  const addTransaction = async (data: Omit<Transaction, 'id' | 'userId'>) => {
    if (!profile?.currentCoupleId || !user) return;
    const transRef = collection(db, 'couples', profile.currentCoupleId, 'transactions');
    await addDoc(transRef, { 
      ...data, 
      userId: user.uid, 
      coupleId: profile.currentCoupleId,
      source: data.source || 'MANUAL',
      userName: currentUserName
    });

    // If accountId is provided, adjust account balance
    if (data.accountId) {
      const delta = data.type === 'income' ? data.amount : data.type === 'expense' ? -data.amount : 0;
      if (delta !== 0) {
        await updateAccountBalance(data.accountId, delta);
      }
    }
    
    if (data.goalId) {
      const goal = goals.find(g => g.id === data.goalId);
      if (goal) {
        await updateGoalAmount(goal.id, goal.currentAmount + (data.type === 'income' ? data.amount : -data.amount));
      }
    }
    await addLog(`${currentUserName} adicionou lançamento (${data.type}): ${data.description}`);
  };

  const deleteTransaction = async (id: string) => {
    if (!profile?.currentCoupleId) return;
    const trans = transactions.find(t => t.id === id);
    if (trans?.accountId) {
      const delta = trans.type === 'income' ? -trans.amount : trans.type === 'expense' ? trans.amount : 0;
      if (delta !== 0) {
        await updateAccountBalance(trans.accountId, delta);
      }
    }
    if (trans?.goalId) {
      const goal = goals.find(g => g.id === trans.goalId);
      if (goal) {
        await updateGoalAmount(goal.id, goal.currentAmount - (trans.type === 'income' ? trans.amount : -trans.amount));
      }
    }
    const transRef = doc(db, 'couples', profile.currentCoupleId, 'transactions', id);
    await deleteDoc(transRef);
    await addLog(`${currentUserName} removeu lançamento: ${trans?.description || ''}`);
  };

  const addDebt = async (data: Omit<Debt, 'id'>) => {
    if (!profile?.currentCoupleId || !user) return;
    const debtRef = collection(db, 'couples', profile.currentCoupleId, 'debts');
    await addDoc(debtRef, { ...data, userId: user.uid, coupleId: profile.currentCoupleId });
    await addLog(`${currentUserName} adicionou dívida: ${data.title}`);
  };

  const deleteDebt = async (id: string) => {
    if (!profile?.currentCoupleId) return;
    const debtRef = doc(db, 'couples', profile.currentCoupleId, 'debts', id);
    await deleteDoc(debtRef);
    await addLog(`${currentUserName} removeu dívida`);
  };

  const payDebtInstallment = async (debt: Debt, isDelayed: boolean = false, accountId?: string) => {
    if (!profile?.currentCoupleId) return;
    const debtRef = doc(db, 'couples', profile.currentCoupleId, 'debts', debt.id);
    const newRemaining = Math.max(0, debt.remainingAmount - debt.monthlyPayment);
    const newPaid = debt.paidInstallments + 1;
    const newStatus = newRemaining === 0 ? 'paid' : (isDelayed ? 'delayed' : 'active');
    
    await updateDoc(debtRef, {
      remainingAmount: newRemaining,
      paidInstallments: newPaid,
      status: newStatus
    });

    const selectedAcc = accounts.find(a => a.id === accountId);

    await addTransaction({
      description: `Parcela Dívida: ${debt.title}`,
      amount: debt.monthlyPayment,
      category: 'Dívidas',
      date: new Date().toISOString(),
      type: 'expense',
      accountId: accountId,
      accountName: selectedAcc?.name,
      source: 'DEBT_PAYMENT',
      sourceId: debt.id,
      userName: currentUserName
    });

    await addLog(`${currentUserName} pagou parcela de ${debt.title}`);
  };

  const addGoal = async (data: Omit<Goal, 'id'>) => {
    if (!profile?.currentCoupleId) return;
    const goalRef = collection(db, 'couples', profile.currentCoupleId, 'goals');
    await addDoc(goalRef, { ...data, coupleId: profile.currentCoupleId });
    await addLog(`${currentUserName} criou meta: ${data.title}`);
  };

  const deleteGoal = async (id: string) => {
    if (!profile?.currentCoupleId) return;
    const goalRef = doc(db, 'couples', profile.currentCoupleId, 'goals', id);
    await deleteDoc(goalRef);
    await addLog(`${currentUserName} removeu meta`);
  };

  const updateGoalAmount = async (id: string, newAmount: number) => {
    if (!profile?.currentCoupleId) return;
    const goalRef = doc(db, 'couples', profile.currentCoupleId, 'goals', id);
    const goalDoc = await getDoc(goalRef);
    if (!goalDoc.exists()) return;
    const target = goalDoc.data().targetAmount;
    const status = target <= newAmount ? 'completed' : 'in_progress';
    await updateDoc(goalRef, { currentAmount: newAmount, status });
    await addLog(`${currentUserName} atualizou meta`);
  };

  const addCreditCard = async (data: Omit<CreditCard, 'id'>) => {
    if (!profile?.currentCoupleId) return;
    const cardRef = collection(db, 'couples', profile.currentCoupleId, 'creditCards');
    await addDoc(cardRef, { ...data, coupleId: profile.currentCoupleId });
    await addLog(`${currentUserName} adicionou cartão: ${data.name}`);
  };

  const deleteCreditCard = async (id: string) => {
    if (!profile?.currentCoupleId) return;
    const cardRef = doc(db, 'couples', profile.currentCoupleId, 'creditCards', id);
    await deleteDoc(cardRef);
    await addLog(`${currentUserName} removeu cartão`);
  };

  const addAccount = async (data: Omit<FinancialAccount, 'id'>) => {
    if (!profile?.currentCoupleId) return;
    const accRef = collection(db, 'couples', profile.currentCoupleId, 'accounts');
    await addDoc(accRef, { ...data, coupleId: profile.currentCoupleId });
    await addLog(`${currentUserName} adicionou conta: ${data.name}`);
  };

  const deleteAccount = async (id: string) => {
    if (!profile?.currentCoupleId) return;
    const accRef = doc(db, 'couples', profile.currentCoupleId, 'accounts', id);
    await deleteDoc(accRef);
    await addLog(`${currentUserName} removeu conta`);
  };

  // CLIENT MANAGEMENT & FINANCIAL INTEGRATION
  const addClient = async (data: {
    name: string;
    phone?: string;
    email?: string;
    service: string;
    totalAmount: number;
    contractDate: string;
    paymentDate: string;
    notes?: string;
  }) => {
    if (!profile?.currentCoupleId) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const isOverdue = data.paymentDate < todayStr;
    const initialStatus: Client['status'] = isOverdue ? 'ATRASADO' : 'AGUARDANDO';

    const clientRef = collection(db, 'couples', profile.currentCoupleId, 'clients');
    await addDoc(clientRef, {
      name: data.name,
      phone: data.phone || '',
      email: data.email || '',
      service: data.service,
      totalAmount: data.totalAmount,
      amount: data.totalAmount, // Legacy alias compatibility
      paidAmount: 0,
      remainingAmount: data.totalAmount,
      contractDate: data.contractDate || todayStr,
      paymentDate: data.paymentDate || todayStr,
      status: initialStatus,
      notes: data.notes || '',
      payments: [],
      coupleId: profile.currentCoupleId
    });

    await addLog(`${currentUserName} cadastrou cliente ${data.name} (Valor Total: R$ ${data.totalAmount})`);
  };

  /**
   * Registers a real partial or total payment for a client.
   * Updates client paidAmount, remainingAmount, status, account balance, creates a real Income Transaction, and logs.
   */
  const registerClientPayment = async (data: {
    clientId: string;
    amount: number;
    date: string;
    accountId?: string;
    paymentMethod?: string;
    notes?: string;
  }) => {
    if (!profile?.currentCoupleId || !user) return;

    const client = clients.find(c => c.id === data.clientId);
    if (!client) throw new Error('Cliente não encontrado.');

    const paymentAmount = Math.max(0, data.amount);
    if (paymentAmount <= 0) throw new Error('O valor do pagamento deve ser superior a zero.');

    const newPaidAmount = (client.paidAmount || 0) + paymentAmount;
    const newRemainingAmount = Math.max(0, (client.totalAmount || client.amount || 0) - newPaidAmount);

    let newStatus: Client['status'] = 'AGUARDANDO';
    if (newRemainingAmount <= 0) {
      newStatus = 'PAGO';
    } else if (newPaidAmount > 0) {
      newStatus = 'PAGAMENTO PARCIAL';
    } else {
      const todayStr = new Date().toISOString().split('T')[0];
      if (client.paymentDate < todayStr) {
        newStatus = 'ATRASADO';
      }
    }

    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const selectedAccount = accounts.find(a => a.id === data.accountId);

    const paymentObj: ClientPayment = {
      id: paymentId,
      amount: paymentAmount,
      date: data.date || new Date().toISOString(),
      accountId: data.accountId || '',
      accountName: selectedAccount?.name || 'Geral',
      paymentMethod: data.paymentMethod || 'PIX',
      notes: data.notes || '',
      userName: currentUserName
    };

    // 1. Create automatic Income Transaction (checking against duplicate sourceId)
    const existingTrans = transactions.find(t => t.sourceId === paymentId);
    if (!existingTrans) {
      const transRef = collection(db, 'couples', profile.currentCoupleId, 'transactions');
      await addDoc(transRef, {
        userId: user.uid,
        coupleId: profile.currentCoupleId,
        type: 'income',
        amount: paymentAmount,
        description: `Pagamento ${client.name}`,
        category: 'Clientes / Serviços',
        date: data.date || new Date().toISOString(),
        accountId: data.accountId || '',
        accountName: selectedAccount?.name || '',
        paymentMethod: data.paymentMethod || 'PIX',
        clientId: client.id,
        clientName: client.name,
        paymentId: paymentId,
        source: 'CLIENT_PAYMENT',
        sourceId: paymentId,
        userName: currentUserName,
        notes: data.notes || ''
      });

      // 2. Increase selected account balance
      if (data.accountId) {
        await updateAccountBalance(data.accountId, paymentAmount);
      }
    }

    // 3. Update client doc in Firestore
    const clientRef = doc(db, 'couples', profile.currentCoupleId, 'clients', client.id);
    await updateDoc(clientRef, {
      paidAmount: newPaidAmount,
      remainingAmount: newRemainingAmount,
      status: newStatus,
      payments: arrayUnion(paymentObj)
    });

    await addLog(
      `${currentUserName} registrou pagamento de R$ ${paymentAmount} para o cliente ${client.name} (${newStatus === 'PAGO' ? 'Quitado' : 'Restante: R$ ' + newRemainingAmount})`
    );
  };

  /**
   * Reverts / cancels a specific client payment and adjusts financial balances & logs
   */
  const revertClientPayment = async (clientId: string, paymentId: string) => {
    if (!profile?.currentCoupleId) return;

    const client = clients.find(c => c.id === clientId);
    if (!client || !client.payments) return;

    const payment = client.payments.find(p => p.id === paymentId);
    if (!payment) return;

    const updatedPayments = client.payments.filter(p => p.id !== paymentId);
    const newPaidAmount = Math.max(0, (client.paidAmount || 0) - payment.amount);
    const newRemainingAmount = Math.max(0, (client.totalAmount || client.amount || 0) - newPaidAmount);

    let newStatus: Client['status'] = 'AGUARDANDO';
    if (newRemainingAmount <= 0) {
      newStatus = 'PAGO';
    } else if (newPaidAmount > 0) {
      newStatus = 'PAGAMENTO PARCIAL';
    }

    // Deduct from account balance if accountId exists
    if (payment.accountId) {
      await updateAccountBalance(payment.accountId, -payment.amount);
    }

    // Delete associated income transaction
    const trans = transactions.find(t => t.paymentId === paymentId || t.sourceId === paymentId);
    if (trans) {
      await deleteDoc(doc(db, 'couples', profile.currentCoupleId, 'transactions', trans.id));
    }

    // Update client document
    const clientRef = doc(db, 'couples', profile.currentCoupleId, 'clients', client.id);
    await updateDoc(clientRef, {
      paidAmount: newPaidAmount,
      remainingAmount: newRemainingAmount,
      status: newStatus,
      payments: updatedPayments
    });

    await addLog(`${currentUserName} estornou/cancelou o pagamento de R$ ${payment.amount} do cliente ${client.name}`);
  };

  const updateClientStatus = async (id: string, status: Client['status']) => {
    if (!profile?.currentCoupleId) return;
    const clientRef = doc(db, 'couples', profile.currentCoupleId, 'clients', id);
    await updateDoc(clientRef, { status });
    await addLog(`${currentUserName} alterou o status do cliente para ${status}`);
  };

  const deleteClient = async (id: string) => {
    if (!profile?.currentCoupleId) return;
    const clientRef = doc(db, 'couples', profile.currentCoupleId, 'clients', id);
    await deleteDoc(clientRef);
    await addLog(`${currentUserName} removeu cliente`);
  };

  const addInvestment = async (data: Omit<Investment, 'id'>) => {
    if (!profile?.currentCoupleId) return;
    const invRef = collection(db, 'couples', profile.currentCoupleId, 'investments');
    await addDoc(invRef, { ...data, coupleId: profile.currentCoupleId });
    
    await addTransaction({
      description: `Aporte: ${data.asset}`,
      amount: data.investedAmount,
      category: 'Investimentos',
      date: data.date || new Date().toISOString(),
      type: 'investment',
      source: 'INVESTMENT',
      userName: currentUserName
    });

    await addLog(`${currentUserName} adicionou investimento em ${data.asset}`);
  };

  const deleteInvestment = async (id: string) => {
    if (!profile?.currentCoupleId) return;
    const invRef = doc(db, 'couples', profile.currentCoupleId, 'investments', id);
    await deleteDoc(invRef);
    await addLog(`${currentUserName} removeu investimento`);
  };

  // REAL INTEGRATION FOR TRAFFIC EXPENSE
  const addTrafficCampaign = async (data: {
    name: string;
    investment: number;
    returnAmount: number;
    date: string;
    accountId?: string;
    notes?: string;
  }) => {
    if (!profile?.currentCoupleId || !user) return;
    const roas = data.investment > 0 ? parseFloat((data.returnAmount / data.investment).toFixed(2)) : 0;
    
    const selectedAccount = accounts.find(a => a.id === data.accountId);

    const trafficRef = collection(db, 'couples', profile.currentCoupleId, 'traffic');
    const newDoc = await addDoc(trafficRef, {
      name: data.name,
      investment: data.investment,
      returnAmount: data.returnAmount,
      roas,
      date: data.date,
      accountId: data.accountId || '',
      accountName: selectedAccount?.name || '',
      notes: data.notes || '',
      coupleId: profile.currentCoupleId
    });

    // Automatically create Expense Transaction
    await addTransaction({
      description: `Tráfego: ${data.name}`,
      amount: data.investment,
      category: 'Tráfego Pago',
      date: data.date || new Date().toISOString(),
      type: 'expense',
      accountId: data.accountId,
      accountName: selectedAccount?.name,
      source: 'TRAFFIC_EXPENSE',
      sourceId: newDoc.id,
      userName: currentUserName,
      notes: data.notes || ''
    });

    await addLog(`${currentUserName} registrou campanha de tráfego ${data.name} (-R$ ${data.investment})`);
  };

  const deleteTrafficCampaign = async (id: string) => {
    if (!profile?.currentCoupleId) return;

    // Delete associated traffic transaction
    const trans = transactions.find(t => t.sourceId === id && t.source === 'TRAFFIC_EXPENSE');
    if (trans) {
      await deleteTransaction(trans.id);
    }

    const trafficRef = doc(db, 'couples', profile.currentCoupleId, 'traffic', id);
    await deleteDoc(trafficRef);
    await addLog(`${currentUserName} removeu campanha de tráfego`);
  };

  const addCommitment = async (data: Omit<FinancialCommitment, 'id'>) => {
    if (!profile?.currentCoupleId) return;
    const commRef = collection(db, 'couples', profile.currentCoupleId, 'commitments');
    await addDoc(commRef, { ...data, coupleId: profile.currentCoupleId });
    await addLog(`${currentUserName} criou compromisso: ${data.title}`);
  };

  const deleteCommitment = async (id: string) => {
    if (!profile?.currentCoupleId) return;
    const commRef = doc(db, 'couples', profile.currentCoupleId, 'commitments', id);
    await deleteDoc(commRef);
    await addLog(`${currentUserName} removeu compromisso`);
  };

  const addLog = async (action: string, details: string = '') => {
    if (!profile?.currentCoupleId || !user) return;
    const logRef = collection(db, 'couples', profile.currentCoupleId, 'logs');
    await addDoc(logRef, {
      userId: user.uid,
      coupleId: profile.currentCoupleId,
      action,
      details,
      timestamp: new Date().toISOString()
    });
  };

  return {
    coupleData,
    partner,
    transactions,
    debts,
    goals,
    creditCards,
    accounts,
    clients,
    investments,
    trafficCampaigns,
    commitments,
    logs,
    stats,
    loading,
    addTransaction,
    deleteTransaction,
    addDebt,
    deleteDebt,
    payDebtInstallment,
    addGoal,
    deleteGoal,
    updateGoalAmount,
    addCreditCard,
    deleteCreditCard,
    addAccount,
    deleteAccount,
    addClient,
    registerClientPayment,
    revertClientPayment,
    updateClientStatus,
    deleteClient,
    addInvestment,
    deleteInvestment,
    addTrafficCampaign,
    deleteTrafficCampaign,
    addCommitment,
    deleteCommitment,
    addLog
  };
}
