export type Branch = {
  id: string;
  slug: string;
  name_fa: string;
  name_ar: string;
  name_en: string;
  address_fa: string;
  address_ar: string;
  address_en: string;
  address?: string; // fallback
  phone_1: string;
  phone_2: string;
  phone?: string;
  phone_number?: string;
  Instagram: string;
  latitude: string;
  longitude: string;
  is_active: boolean;
  is_open?: boolean;
  created_at?: string;
  open?: number;
  close?: number;
};

export type BranchSimple = {
  id: string;
  name_fa: string;
  slug: string;
};
