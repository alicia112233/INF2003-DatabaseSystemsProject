import { Game } from "./cart";

export interface Promotion {
  id: number;
  code: string;
  description: string;
  discountValue: number;
  discountType: 'percentage' | 'fixed';
  maxUsage?: number | null;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  applicableToAll: boolean;
  selectedGameIds?: number[];
  created_at: string;
  updated_at: string;
  selectedGames?: Game[];
}

export interface CreatePromotionRequest {
  code: string;
  description: string;
  discountValue: number;
  discountType: 'percentage' | 'fixed';
  maxUsage?: number | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  applicableToAll: boolean;
  selectedGameIds?: number[];
}

export interface UpdatePromotionRequest extends Partial<CreatePromotionRequest> {
  id: number;
}