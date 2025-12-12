// contexts/BranchContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Branch {
  id: string;
  slug: string;
  name_fa: string;
  name_ar: string;
  name_en: string;
  address_fa: string;
  address_ar: string;
  address_en: string;
  phone: string;
  is_active: boolean;
}

interface BranchContextType {
  branches: Branch[];
  selectedBranch: Branch | null;
  setSelectedBranch: (branch: Branch | null) => void;
  clearSelectedBranch: () => void;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

// داده‌های ثابت شعب (می‌توانید بعداً از API بیاورید)
const DEFAULT_BRANCHES: Branch[] = [
  {
    id: 'main',
    slug: 'main',
    name_fa: 'وطندار شعبه مرکزی',
    name_ar: 'وطندار الفرع المرکزی',
    name_en: 'Watandar Main Branch',
    address_fa: 'تهران، خیابان ولیعصر، پلاک ۱۰۰',
    address_ar: 'طهران، شارع ولیعصر، رقم ۱۰۰',
    address_en: 'Tehran, Valiasr St, No. 100',
    phone: '021-12345678',
    is_active: true
  },
  {
    id: 'branch2',
    slug: 'branch2',
    name_fa: 'وطندار شعبه غرب',
    name_ar: 'وطندار الفرع الغربي',
    name_en: 'Watandar West Branch',
    address_fa: 'تهران، سعادت آباد، بلوار دریا',
    address_ar: 'طهران، سعادت آباد، بولوار دریا',
    address_en: 'Tehran, Saadat Abad, Darya Blvd',
    phone: '021-87654321',
    is_active: true
  }
];

export function BranchProvider({ children }: { children: ReactNode }) {
  const [branches] = useState<Branch[]>(DEFAULT_BRANCHES);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  // بارگذاری شعبه انتخاب شده از localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedBranch = localStorage.getItem('selectedBranch');
      if (savedBranch) {
        try {
          setSelectedBranch(JSON.parse(savedBranch));
        } catch (error) {
          console.error('Error parsing saved branch:', error);
        }
      }
    }
  }, []);

  // ذخیره شعبه انتخاب شده در localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && selectedBranch) {
      localStorage.setItem('selectedBranch', JSON.stringify(selectedBranch));
    }
  }, [selectedBranch]);

  const clearSelectedBranch = () => {
    setSelectedBranch(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('selectedBranch');
    }
  };

  return (
    <BranchContext.Provider value={{
      branches,
      selectedBranch,
      setSelectedBranch,
      clearSelectedBranch
    }}>
      {children}
    </BranchContext.Provider>
  );
}

export const useBranch = () => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error('useBranch must be used within BranchProvider');
  }
  return context;
};