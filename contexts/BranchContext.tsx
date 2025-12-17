// contexts/BranchContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Branch } from '@/types';

interface BranchContextType {
  selectedBranch: Branch | null;
  branches: Branch[];
  setSelectedBranch: (branch: Branch | null) => void;
  clearSelectedBranch: () => void;
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

  useEffect(() => {
    // بارگذاری شعبه از localStorage هنگام لود اولیه
    const storedBranch = localStorage.getItem('selectedBranch');
    if (storedBranch) {
      try {
        setSelectedBranch(JSON.parse(storedBranch));
      } catch (error) {
        console.error('Error parsing stored branch:', error);
        localStorage.removeItem('selectedBranch');
      }
    }
  }, []);

  const fetchBranches = async () => {
    // اینجا می‌توانید از سوپابیس شعبه‌ها را بگیرید
    // فعلاً خالی می‌گذاریم
  };

  const handleSetBranch = (branch: Branch | null) => {
    setSelectedBranch(branch);
    if (branch) {
      localStorage.setItem('selectedBranch', JSON.stringify(branch));
    } else {
      localStorage.removeItem('selectedBranch');
    }
  };

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
        clearSelectedBranch,
        fetchBranches,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
};