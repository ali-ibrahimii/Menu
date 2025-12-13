// contexts/BranchContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Branch {
  id: string;
  slug: string;
  name_fa: string;
  name_ar: string;
  name_en: string;
  address: string;
  phone: string;
  is_active: boolean;
}

interface BranchContextType {
  selectedBranch: Branch | null;
  branches: Branch[];
  setSelectedBranch: (branch: Branch | null) => void;
  clearSelectedBranch: () => void; // اضافه کردن این تابع
  fetchBranches: () => Promise<void>;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export const useBranch = () => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error('useBranch must be used within BranchProvider');
  }
  return context;
};

export const BranchProvider = ({ children }: { children: ReactNode }) => {
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);

  const fetchBranches = async () => {
    try {
      // اینجا باید API call به سوپابیس داشته باشید
      const storedBranch = localStorage.getItem('selectedBranch');
      if (storedBranch) {
        setSelectedBranch(JSON.parse(storedBranch));
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleSetBranch = (branch: Branch | null) => {
    setSelectedBranch(branch);
    if (branch) {
      localStorage.setItem('selectedBranch', JSON.stringify(branch));
    } else {
      localStorage.removeItem('selectedBranch');
    }
  };

  // اضافه کردن تابع clearSelectedBranch
  const clearSelectedBranch = () => {
    setSelectedBranch(null);
    localStorage.removeItem('selectedBranch');
  };

  return (
    <BranchContext.Provider
      value={{
        selectedBranch,
        branches,
        setSelectedBranch: handleSetBranch,
        clearSelectedBranch, // اضافه کردن به context
        fetchBranches,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
};