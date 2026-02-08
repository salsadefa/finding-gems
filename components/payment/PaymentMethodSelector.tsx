'use client';

import { useVABanks, useEWalletOptions, type VABank, type EWalletOption } from '@/lib/api/billing';
import { Loader2, QrCode, Building2, Wallet, CreditCard } from 'lucide-react';

export type PaymentMethod = 'qris' | 'virtual_account' | 'ewallet' | 'credit_card';

interface PaymentMethodSelectorProps {
  selected: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
}

const paymentMethods = [
  {
    id: 'qris' as PaymentMethod,
    name: 'QRIS',
    description: 'Scan dengan aplikasi e-wallet atau mobile banking',
    icon: QrCode,
    color: 'bg-blue-600',
  },
  {
    id: 'virtual_account' as PaymentMethod,
    name: 'Virtual Account',
    description: 'Transfer via ATM atau mobile banking',
    icon: Building2,
    color: 'bg-green-600',
  },
  {
    id: 'ewallet' as PaymentMethod,
    name: 'E-Wallet',
    description: 'OVO, DANA, LinkAja, ShopeePay',
    icon: Wallet,
    color: 'bg-purple-600',
  },
  {
    id: 'credit_card' as PaymentMethod,
    name: 'Kartu Kredit',
    description: 'Visa, Mastercard, JCB',
    icon: CreditCard,
    color: 'bg-orange-600',
  },
];

export function PaymentMethodSelector({ selected, onSelect }: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Pilih Metode Pembayaran</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          const isSelected = selected === method.id;
          
          return (
            <button
              key={method.id}
              onClick={() => onSelect(method.id)}
              className={`flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                isSelected
                  ? `border-${method.color.split('-')[1]}-600 bg-${method.color.split('-')[1]}-50`
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className={`${method.color} text-white p-3 rounded-lg`}>
                <Icon size={24} />
              </div>
              
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{method.name}</h4>
                <p className="text-sm text-gray-500 mt-1">{method.description}</p>
              </div>
              
              <div className="mt-1">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? `border-${method.color.split('-')[1]}-600` : 'border-gray-300'
                  }`}
                >
                  {isSelected && (
                    <div className={`w-3 h-3 rounded-full ${method.color}`} />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface BankSelectorProps {
  selected: string | null;
  onSelect: (bankCode: string) => void;
}

interface EWalletSelectorProps {
  selected: EWalletOption | null;
  onSelect: (option: EWalletOption) => void;
}

export function BankSelector({ selected, onSelect }: BankSelectorProps) {
  const { data: banks, isLoading } = useVABanks();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }
  
  if (!banks || banks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Tidak ada bank yang tersedia
      </div>
    );
  }
  
  // Bank color mapping
  const bankColors: Record<string, string> = {
    BCA: 'bg-blue-600',
    BNI: 'bg-orange-600',
    BRI: 'bg-blue-700',
    MANDIRI: 'bg-yellow-500',
    PERMATA: 'bg-purple-600',
    BSI: 'bg-green-600',
    BJB: 'bg-green-700',
    SAHABAT_SAMPOERNA: 'bg-red-700',
    CIMB: 'bg-red-600',
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Pilih Bank</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {banks.map((bank) => {
          const isSelected = selected === bank.code;
          const colorClass = bankColors[bank.code] || 'bg-gray-600';
          
          return (
            <button
              key={bank.code}
              onClick={() => onSelect(bank.code)}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                isSelected
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className={`${colorClass} text-white w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold`}>
                {bank.code.slice(0, 3)}
              </div>
              
              <span className="flex-1 font-medium text-gray-900">{bank.name}</span>
              
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  isSelected ? 'border-blue-600' : 'border-gray-300'
                }`}
              >
                {isSelected && <div className="w-3 h-3 rounded-full bg-blue-600" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function EWalletSelector({ selected, onSelect }: EWalletSelectorProps) {
  const { data: ewallets, isLoading } = useEWalletOptions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!ewallets || ewallets.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Tidak ada e-wallet yang tersedia
      </div>
    );
  }

  const ewalletColors: Record<string, string> = {
    OVO: 'bg-purple-600',
    DANA: 'bg-blue-500',
    SHOPEEPAY: 'bg-orange-500',
    LINKAJA: 'bg-red-600',
    GOPAY: 'bg-blue-600',
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Pilih E-Wallet</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ewallets.map((wallet) => {
          const isSelected = selected?.code === wallet.code;
          const colorClass = ewalletColors[wallet.code] || 'bg-gray-600';

          return (
            <button
              key={wallet.code}
              onClick={() => onSelect(wallet)}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                isSelected
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className={`${colorClass} text-white w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold`}>
                {wallet.code.slice(0, 3)}
              </div>

              <div className="flex-1">
                <span className="font-medium text-gray-900">{wallet.name}</span>
                {wallet.requiresMobileNumber && (
                  <div className="text-xs text-gray-500 mt-1">Perlu nomor HP</div>
                )}
              </div>

              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  isSelected ? 'border-blue-600' : 'border-gray-300'
                }`}
              >
                {isSelected && <div className="w-3 h-3 rounded-full bg-blue-600" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { type VABank, type EWalletOption };
