import { create } from 'zustand';
import { Material, MaterialTransaction, PurchaseRequest } from '../types';
import { materialsAPI } from '../services/api';
import { normalizeMaterial } from '../utils/normalize';
import { showSuccess, showError } from '../utils/notifications';

interface MaterialState {
  materials: Material[];
  transactions: MaterialTransaction[];
  purchaseRequests: PurchaseRequest[];
  selectedMaterial: Material | null;
  isLoading: boolean;
  error: string | null;
  fetchMaterials: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  fetchPurchaseRequests: () => Promise<void>;
  addMaterial: (material: Omit<Material, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateMaterial: (id: string, material: Partial<Material>) => Promise<void>;
  deleteMaterial: (id: string) => Promise<void>;
  addTransaction: (transaction: Omit<MaterialTransaction, 'id' | 'performedAt'>) => Promise<void>;
  addPurchaseRequest: (request: Omit<PurchaseRequest, 'id' | 'requestedAt' | 'status'>) => Promise<void>;
  updatePurchaseRequest: (id: string, status: PurchaseRequest['status'], approvedBy?: string) => Promise<void>;
  setSelectedMaterial: (material: Material | null) => void;
}

export const useMaterialStore = create<MaterialState>((set) => ({
  materials: [],
  transactions: [],
  purchaseRequests: [],
  selectedMaterial: null,
  isLoading: false,
  error: null,

  fetchMaterials: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await materialsAPI.getAll();
      const materials = Array.isArray(data) ? data.map(normalizeMaterial) : [];
      set({ materials, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch materials', isLoading: false });
      console.error('Error fetching materials:', error);
    }
  },

  fetchTransactions: async () => {
    set({ isLoading: true, error: null });
    try {
      const transactions = await materialsAPI.getTransactions();
      set({ transactions, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch transactions', isLoading: false });
      console.error('Error fetching transactions:', error);
    }
  },

  fetchPurchaseRequests: async () => {
    set({ isLoading: true, error: null });
    try {
      const purchaseRequests = await materialsAPI.getPurchaseRequests();
      set({ purchaseRequests, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch purchase requests', isLoading: false });
      console.error('Error fetching purchase requests:', error);
    }
  },

  addMaterial: async (materialData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await materialsAPI.create(materialData);
      const newMaterial = normalizeMaterial(data);
      set((state) => ({
        materials: [...state.materials, newMaterial],
        isLoading: false,
      }));
      showSuccess('Thêm vật tư thành công');
    } catch (error: any) {
      set({ error: error.message || 'Không thể thêm vật tư', isLoading: false });
      throw error;
    }
  },

  updateMaterial: async (id, materialData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await materialsAPI.update(id, materialData);
      const updatedMaterial = normalizeMaterial(data);
      set((state) => ({
        materials: state.materials.map((m) => (m.id === id ? updatedMaterial : m)),
        isLoading: false,
      }));
      showSuccess('Cập nhật vật tư thành công');
    } catch (error: any) {
      set({ error: error.message || 'Không thể cập nhật vật tư', isLoading: false });
      throw error;
    }
  },

  deleteMaterial: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await materialsAPI.delete(id);
      set((state) => ({
        materials: state.materials.filter((material) => material.id !== id),
        isLoading: false,
      }));
      showSuccess('Xóa vật tư thành công');
    } catch (error: any) {
      set({ error: error.message || 'Không thể xóa vật tư', isLoading: false });
      throw error;
    }
  },

  addTransaction: async (transactionData) => {
    set({ isLoading: true, error: null });
    try {
      const newTransaction = await materialsAPI.createTransaction(transactionData);
      set((state) => ({
        transactions: [newTransaction, ...state.transactions],
        isLoading: false,
      }));
      // Refresh materials to get updated stock
      const data = await materialsAPI.getAll();
      const materials = Array.isArray(data) ? data.map(normalizeMaterial) : [];
      set({ materials });
      showSuccess('Tạo giao dịch thành công');
    } catch (error: any) {
      set({ error: error.message || 'Không thể tạo giao dịch', isLoading: false });
      throw error;
    }
  },

  addPurchaseRequest: async (requestData) => {
    set({ isLoading: true, error: null });
    try {
      const newRequest = await materialsAPI.createPurchaseRequest(requestData);
      set((state) => ({
        purchaseRequests: [newRequest, ...state.purchaseRequests],
        isLoading: false,
      }));
      showSuccess('Tạo yêu cầu mua hàng thành công');
    } catch (error: any) {
      set({ error: error.message || 'Không thể tạo yêu cầu mua hàng', isLoading: false });
      throw error;
    }
  },

  updatePurchaseRequest: async (id, status, approvedBy) => {
    set({ isLoading: true, error: null });
    try {
      const updatedRequest = await materialsAPI.updatePurchaseRequest(id, { status, approvedBy });
      set((state) => ({
        purchaseRequests: state.purchaseRequests.map((request) =>
          request.id === id ? updatedRequest : request
        ),
        isLoading: false,
      }));
      showSuccess('Cập nhật yêu cầu mua hàng thành công');
    } catch (error: any) {
      set({ error: error.message || 'Không thể cập nhật yêu cầu mua hàng', isLoading: false });
      throw error;
    }
  },

  setSelectedMaterial: (material) => set({ selectedMaterial: material }),
}));

