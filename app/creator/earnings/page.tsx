'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  useCreatorBalance, 
  useBankAccounts, 
  useAddBankAccount, 
  useDeleteBankAccount,
  usePayouts,
  useRequestPayout,
  useCancelPayout,
  formatCurrency,
  INDONESIAN_BANKS,
  type BankAccount,
  type Payout
} from '@/lib/api/payout';
import { useAuth } from '@/lib/store';
import Button from '@/components/Button';
import { Input } from '@/components/Input';
import Modal from '@/components/Modal';
import { 
  Wallet, 
  Building2, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Plus,
  Trash2,
  CreditCard,
  AlertCircle,
  ChevronRight,
  Landmark
} from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/lib/animations';

// Status badge component
function StatusBadge({ status }: { status: Payout['status'] }) {
  const styles = {
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    processing: 'bg-blue-50 text-blue-700 border-blue-200',
    completed: 'bg-green-50 text-green-700 border-green-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
    cancelled: 'bg-gray-50 text-gray-600 border-gray-200',
  };

  const icons = {
    pending: Clock,
    processing: Loader2,
    completed: CheckCircle2,
    rejected: XCircle,
    cancelled: XCircle,
  };

  const Icon = icons[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
      <Icon size={12} className={status === 'processing' ? 'animate-spin' : ''} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// Bank Account Card
function BankAccountCard({ 
  account, 
  onDelete 
}: { 
  account: BankAccount; 
  onDelete: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white border border-gray-200 rounded-xl p-4 relative group"
    >
      {account.is_primary && (
        <span className="absolute top-2 right-2 px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
          Primary
        </span>
      )}
      
      <div className="flex items-start gap-3">
        <div className="p-2 bg-gray-50 rounded-lg">
          <Landmark className="w-5 h-5 text-gray-600" />
        </div>
        
        <div className="flex-1">
          <p className="font-semibold text-gray-900">{account.bank_name}</p>
          <p className="text-sm text-gray-500">{account.account_name}</p>
          <p className="text-sm font-mono text-gray-600 mt-1">{account.account_number}</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onDelete(account.id)}
          className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
        >
          <Trash2 size={16} />
        </motion.button>
      </div>
    </motion.div>
  );
}

// Add Bank Account Modal
function AddBankAccountModal({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void;
}) {
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  
  const addBankAccount = useAddBankAccount();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const bank = INDONESIAN_BANKS.find(b => b.code === bankCode);
    if (!bank) return;

    try {
      await addBankAccount.mutateAsync({
        bank_name: bank.name,
        bank_code: bank.code,
        account_number: accountNumber,
        account_name: accountName,
        is_primary: false,
      });
      onClose();
      setBankCode('');
      setAccountNumber('');
      setAccountName('');
    } catch (error) {
      console.error('Failed to add bank account:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Bank Account">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bank</label>
          <select
            value={bankCode}
            onChange={(e) => setBankCode(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            required
          >
            <option value="">Select Bank</option>
            {INDONESIAN_BANKS.map((bank) => (
              <option key={bank.code} value={bank.code}>
                {bank.name}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Account Number"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          placeholder="1234567890"
          required
        />

        <Input
          label="Account Name"
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
          placeholder="John Doe"
          required
        />

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="flex-1"
            loading={addBankAccount.isPending}
          >
            Add Account
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// Request Payout Modal
function RequestPayoutModal({ 
  isOpen, 
  onClose, 
  availableBalance,
  bankAccounts
}: { 
  isOpen: boolean; 
  onClose: () => void;
  availableBalance: number;
  bankAccounts: BankAccount[];
}) {
  const [amount, setAmount] = useState('');
  const [selectedBankId, setSelectedBankId] = useState('');
  const [notes, setNotes] = useState('');
  
  const requestPayout = useRequestPayout();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await requestPayout.mutateAsync({
        amount: parseInt(amount),
        bank_account_id: selectedBankId || undefined,
        notes: notes || undefined,
      });
      onClose();
      setAmount('');
      setSelectedBankId('');
      setNotes('');
    } catch (error) {
      console.error('Failed to request payout:', error);
    }
  };

  const primaryAccount = bankAccounts.find(a => a.is_primary) || bankAccounts[0];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request Payout">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">Available Balance</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(availableBalance)}</p>
        </div>

        <Input
          label="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          min={10000}
          max={availableBalance}
          required
        />

        {bankAccounts.length > 1 ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account</label>
            <select
              value={selectedBankId}
              onChange={(e) => setSelectedBankId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="">Use Primary Account ({primaryAccount?.bank_name})</option>
              {bankAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.bank_name} - {account.account_number.slice(-4)}
                </option>
              ))}
            </select>
          </div>
        ) : primaryAccount ? (
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-sm text-blue-600">Will be transferred to: {primaryAccount.bank_name} - {primaryAccount.account_number}</p>
          </div>
        ) : null}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional information..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
            rows={3}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="flex-1"
            loading={requestPayout.isPending}
            disabled={!amount || parseInt(amount) < 10000 || parseInt(amount) > availableBalance}
          >
            Request Payout
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function CreatorEarningsPage() {
  const { user, isAuthenticated } = useAuth();
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  // Fetch data
  const { data: balance, isLoading: balanceLoading } = useCreatorBalance();
  const { data: bankAccounts = [], isLoading: banksLoading } = useBankAccounts();
  const { data: payoutsData, isLoading: payoutsLoading } = usePayouts({ limit: 10 });
  
  const deleteBankAccount = useDeleteBankAccount();
  const cancelPayout = useCancelPayout();

  if (!isAuthenticated || (user?.role !== 'creator' && user?.role !== 'admin')) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen pt-32 pb-12 flex flex-col items-center justify-center text-center px-4"
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Creator Access Required</h1>
        <p className="text-gray-500 mb-6">Please log in as a creator to access earnings.</p>
        <Link href="/login">
          <Button>Log In</Button>
        </Link>
      </motion.div>
    );
  }

  const isLoading = balanceLoading || banksLoading || payoutsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 pb-12 flex flex-col items-center justify-center">
        <Loader2 size={32} className="animate-spin text-gray-400 mb-4" />
        <p className="text-gray-500">Loading earnings data...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 max-w-7xl mx-auto"
    >
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900">Earnings</h1>
        <p className="text-gray-500 mt-1">Manage your payouts and bank accounts</p>
      </motion.div>

      {/* Balance Overview */}
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
      >
        {/* Available Balance */}
        <motion.div 
          variants={fadeInUp}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-green-100 text-sm font-medium">Available Balance</span>
            <Wallet className="w-5 h-5 text-green-100" />
          </div>
          <p className="text-3xl font-bold">{formatCurrency(balance?.available_balance || 0)}</p>
          <p className="text-green-100 text-sm mt-1">Ready to withdraw</p>
        </motion.div>

        {/* Pending Balance */}
        <motion.div 
          variants={fadeInUp}
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm font-medium">Pending Balance</span>
            <Clock className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(balance?.pending_balance || 0)}</p>
          <p className="text-gray-500 text-sm mt-1">From recent sales</p>
        </motion.div>

        {/* Total Earnings */}
        <motion.div 
          variants={fadeInUp}
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm font-medium">Total Earnings</span>
            <ArrowUpRight className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(balance?.total_earnings || 0)}</p>
          <p className="text-gray-500 text-sm mt-1">Lifetime earnings</p>
        </motion.div>

        {/* Withdrawn */}
        <motion.div 
          variants={fadeInUp}
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm font-medium">Withdrawn</span>
            <ArrowDownRight className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(balance?.withdrawn_balance || 0)}</p>
          <p className="text-gray-500 text-sm mt-1">Total withdrawn</p>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bank Accounts */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1"
        >
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Bank Accounts</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddBankModal(true)}
                className="p-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Plus size={18} />
              </motion.button>
            </div>
            
            <div className="p-6 space-y-4">
              <AnimatePresence mode="popLayout">
                {bankAccounts.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8"
                  >
                    <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No bank accounts added yet</p>
                    <button 
                      onClick={() => setShowAddBankModal(true)}
                      className="text-blue-600 text-sm font-medium mt-2 hover:underline"
                    >
                      Add your first account
                    </button>
                  </motion.div>
                ) : (
                  bankAccounts.map((account) => (
                    <BankAccountCard
                      key={account.id}
                      account={account}
                      onDelete={(id) => {
                        if (confirm('Are you sure you want to delete this bank account?')) {
                          deleteBankAccount.mutate(id);
                        }
                      }}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 bg-blue-50 rounded-2xl p-6 border border-blue-100">
            <h3 className="font-semibold text-blue-900 mb-2">Request Payout</h3>
            <p className="text-sm text-blue-700 mb-4">
              Withdraw your available balance to your bank account
            </p>
            <Button
              onClick={() => setShowPayoutModal(true)}
              disabled={!balance?.available_balance || balance.available_balance < 10000}
              fullWidth
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Request Payout
            </Button>
            {(balance?.available_balance || 0) < 10000 && (
              <p className="text-xs text-blue-600 mt-2 text-center">
                Minimum payout: Rp 10.000
              </p>
            )}
          </div>
        </motion.div>

        {/* Payout History */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Payout History</h2>
            </div>
            
            <div className="divide-y divide-gray-100">
              {payoutsData?.payouts.length === 0 ? (
                <div className="text-center py-12">
                  <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No payouts yet</p>
                  <p className="text-sm text-gray-400 mt-1">Your payout history will appear here</p>
                </div>
              ) : (
                payoutsData?.payouts.map((payout, index) => (
                  <motion.div
                    key={payout.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-100 rounded-xl">
                          <Wallet className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{formatCurrency(payout.amount)}</p>
                          <p className="text-sm text-gray-500">
                            {payout.bank_name} • {payout.bank_account_number.slice(-4)}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(payout.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <StatusBadge status={payout.status} />
                        
                        {payout.status === 'pending' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              if (confirm('Are you sure you want to cancel this payout request?')) {
                                cancelPayout.mutate(payout.id);
                              }
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <XCircle size={18} />
                          </motion.button>
                        )}
                      </div>
                    </div>
                    
                    {payout.status_message && (
                      <p className="text-sm text-gray-500 mt-3 pl-16">
                        {payout.status_message}
                      </p>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <AddBankAccountModal 
        isOpen={showAddBankModal} 
        onClose={() => setShowAddBankModal(false)} 
      />
      
      {balance && (
        <RequestPayoutModal
          isOpen={showPayoutModal}
          onClose={() => setShowPayoutModal(false)}
          availableBalance={balance.available_balance}
          bankAccounts={bankAccounts}
        />
      )}
    </motion.div>
  );
}
