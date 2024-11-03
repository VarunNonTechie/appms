export interface Measurement {
  id: number;
  userId: number;
  shoulderWidth: number;
  chestCircumference: number;
  waistCircumference: number;
  hipCircumference: number;
  inseamLength: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
} 