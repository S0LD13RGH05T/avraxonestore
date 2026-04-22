import { useState, useEffect } from 'react';
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
  getDoc
} from 'firebase/firestore';
import { useAuth } from './useAuth';

export interface Transaction {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  goalId?: string;
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
}

export interface CreditCard {
  id: string;
  name: string;
  limit: number;
  balance: number;
  closingDay: number;
  dueDate: number;
}

export interface Goal {
  id: string;
  title: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  status: 'in_progress' | 'completed';
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
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

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
        
        // Find partner
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

    // Logs sync
    const logsQuery = query(
      collection(db, 'couples', profile.currentCoupleId, 'logs'),
      orderBy('timestamp', 'desc')
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
      unsubLogs();
    };
  }, [profile?.currentCoupleId, user?.uid]);

  const addTransaction = async (data: Omit<Transaction, 'id' | 'userId'>) => {
    if (!profile?.currentCoupleId || !user) return;
    const transRef = collection(db, 'couples', profile.currentCoupleId, 'transactions');
    await addDoc(transRef, { ...data, userId: user.uid, coupleId: profile.currentCoupleId });
    
    // If goalId is provided, update goal amount
    if (data.goalId) {
      const goal = goals.find(g => g.id === data.goalId);
      if (goal) {
        await updateGoalAmount(goal.id, goal.currentAmount + (data.type === 'income' ? data.amount : -data.amount));
      }
    }
    
    await addLog(`Adicionou ${data.type === 'income' ? 'uma entrada' : 'uma saída'}: ${data.description}`);
  };

  const addDebt = async (data: Omit<Debt, 'id'>) => {
    if (!profile?.currentCoupleId || !user) return;
    const debtRef = collection(db, 'couples', profile.currentCoupleId, 'debts');
    await addDoc(debtRef, { ...data, userId: user.uid, coupleId: profile.currentCoupleId });
    await addLog(`Adicionou uma nova dívida: ${data.title}`);
  };

  const addGoal = async (data: Omit<Goal, 'id'>) => {
    if (!profile?.currentCoupleId) return;
    const goalRef = collection(db, 'couples', profile.currentCoupleId, 'goals');
    await addDoc(goalRef, { ...data, coupleId: profile.currentCoupleId });
    await addLog(`Criou uma nova meta: ${data.title}`);
  };

  const addCreditCard = async (data: Omit<CreditCard, 'id'>) => {
    if (!profile?.currentCoupleId) return;
    const cardRef = collection(db, 'couples', profile.currentCoupleId, 'creditCards');
    await addDoc(cardRef, { ...data, coupleId: profile.currentCoupleId });
    await addLog(`Adicionou cartão de crédito: ${data.name}`);
  };

  const deleteCreditCard = async (id: string) => {
    if (!profile?.currentCoupleId) return;
    const cardRef = doc(db, 'couples', profile.currentCoupleId, 'creditCards', id);
    await deleteDoc(cardRef);
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

  const deleteTransaction = async (id: string) => {
    if (!profile?.currentCoupleId) return;
    
    // Find the transaction first to check for goalId
    const trans = transactions.find(t => t.id === id);
    if (trans?.goalId) {
      const goal = goals.find(g => g.id === trans.goalId);
      if (goal) {
        // Reverse the amount: if it was income (add), we subtract. if it was expense (sub), we add back.
        await updateGoalAmount(goal.id, goal.currentAmount - (trans.type === 'income' ? trans.amount : -trans.amount));
      }
    }

    const transRef = doc(db, 'couples', profile.currentCoupleId, 'transactions', id);
    await deleteDoc(transRef);
    await addLog(`Removeu um lançamento: ${trans?.description || ''}`);
  };

  const deleteGoal = async (id: string) => {
    if (!profile?.currentCoupleId) return;
    const goalRef = doc(db, 'couples', profile.currentCoupleId, 'goals', id);
    await deleteDoc(goalRef);
    await addLog(`Removeu uma meta`);
  };

  const deleteDebt = async (id: string) => {
    if (!profile?.currentCoupleId) return;
    const debtRef = doc(db, 'couples', profile.currentCoupleId, 'debts', id);
    await deleteDoc(debtRef);
    await addLog(`Removeu uma dívida`);
  };

  const payDebtInstallment = async (debt: Debt, isDelayed: boolean = false) => {
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

    // Also add as a transaction so it shows in the calendar and history
    await addTransaction({
      description: `Parcela: ${debt.title}`,
      amount: debt.monthlyPayment,
      category: 'Dívidas',
      date: new Date().toISOString(),
      type: 'expense'
    });

    await addLog(`Pagou parcela de ${debt.title}${isDelayed ? ' (em atraso)' : ''}`);
  };

  const updateGoalAmount = async (id: string, newAmount: number) => {
    if (!profile?.currentCoupleId) return;
    const goalRef = doc(db, 'couples', profile.currentCoupleId, 'goals', id);
    const goalDoc = await getDoc(goalRef);
    if (!goalDoc.exists()) return;
    const target = goalDoc.data().targetAmount;
    const status = target <= newAmount ? 'completed' : 'in_progress';
    await updateDoc(goalRef, { 
      currentAmount: newAmount,
      status
    });
    await addLog(`Atualizou progresso de uma meta`);
  };

  return {
    coupleData,
    partner,
    transactions,
    debts,
    goals,
    creditCards,
    logs,
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
    addLog
  };
}
