import { v4 as uuidv4 } from 'uuid';
import type { 
  Material, 
  Project, 
  Personnel, 
  MaterialTransaction, 
  PurchaseRequest
} from '../types/index.js';

// In-memory data stores (in production, use a database)
export const materials: Material[] = [];
export const projects: Project[] = [];
export const personnel: Personnel[] = [];
export const transactions: MaterialTransaction[] = [];
export const purchaseRequests: PurchaseRequest[] = [];

// Helper functions
export const generateId = () => uuidv4();

export const findMaterialById = (id: string) => materials.find((m) => m.id === id);
export const findProjectById = (id: string) => projects.find((p) => p.id === id);
export const findPersonnelById = (id: string) => personnel.find((p) => p.id === id);
