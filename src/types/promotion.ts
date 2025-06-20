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
  created_at: string;
  updated_at: string;
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
}

export interface UpdatePromotionRequest extends Partial<CreatePromotionRequest> {
  id: number;
}