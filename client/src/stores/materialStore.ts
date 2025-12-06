import { create } from 'zustand';
import { Material, MaterialTransaction, PurchaseRequest } from '../types';
import { materialsAPI } from '../services/api';
import { normalizeMaterial, normalizeMaterialTransaction, normalizePurchaseRequest } from '../utils/normalize';
import { showSuccess, showError } from '../utils/notifications';

interface MaterialState {
  materials: Material[];
  materialsTotal: number;
  transactions: MaterialTransaction[];
  transactionsTotal: number;
  purchaseRequests: PurchaseRequest[];
  purchaseRequestsTotal: number;
  selectedMaterial: Material | null;
  isLoading: boolean;
  error: string | null;
  fetchMaterials: (pageSize?: number, pageIndex?: number) => Promise<void>;
  fetchTransactions: (pageSize?: number, pageIndex?: number) => Promise<void>;
  fetchPurchaseRequests: (pageSize?: number, pageIndex?: number) => Promise<void>;
  addMaterial: (material: Omit<Material, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateMaterial: (id: string, material: Partial<Material>) => Promise<void>;
  deleteMaterial: (id: string) => Promise<void>;
  addTransaction: (transaction: Omit<MaterialTransaction, 'id' | 'performedAt'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<MaterialTransaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addPurchaseRequest: (request: Omit<PurchaseRequest, 'id' | 'requestedAt' | 'status'>) => Promise<void>;
  updatePurchaseRequest: (id: string, status: PurchaseRequest['status']) => Promise<void>;
  deletePurchaseRequest: (id: string) => Promise<void>;
  setSelectedMaterial: (material: Material | null) => void;
}

export const useMaterialStore = create<MaterialState>((set) => ({
  materials: [],
  materialsTotal: 0,
  transactions: [],
  transactionsTotal: 0,
  purchaseRequests: [],
  purchaseRequestsTotal: 0,
  selectedMaterial: null,
  isLoading: false,
  error: null,

  fetchMaterials: async (pageSize = 10, pageIndex = 0) => {
    set({ isLoading: true, error: null });
    try {
      const response = await materialsAPI.getAll(pageSize, pageIndex);
      // Handle both old format (array) and new format (object with data, total)
      const materials = Array.isArray(response) 
        ? response.map(normalizeMaterial) 
        : (response.data || []).map(normalizeMaterial);
      const total = Array.isArray(response) ? materials.length : (response.total || 0);
      set({ materials, materialsTotal: total, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch materials', isLoading: false });
      console.error('Error fetching materials:', error);
    }
  },

  fetchTransactions: async (pageSize = 10, pageIndex = 0) => {
    set({ isLoading: true, error: null });
    try {
      const response = await materialsAPI.getTransactions(pageSize, pageIndex);
      // Handle both old format (array) and new format (object with data, total)
      const transactionsData = Array.isArray(response) 
        ? response 
        : (response.data || []);
      const transactions = transactionsData
        .map((item: any, index: number) => {
          try {
            const normalized = normalizeMaterialTransaction(item);
            return normalized;
          } catch (error) {
            console.error(`Error normalizing item ${index}:`, error, item);
            return null;
          }
        })
        .filter((t: any) => t !== null && t !== undefined);
      const total = Array.isArray(response) ? transactions.length : (response.total || 0);
      set({ transactions, transactionsTotal: total, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch transactions', isLoading: false });
      console.error('Error fetching transactions:', error);
    }
  },

  fetchPurchaseRequests: async (pageSize = 10, pageIndex = 0) => {
    set({ isLoading: true, error: null });
    try {
      const response = await materialsAPI.getPurchaseRequests(pageSize, pageIndex);
      // Handle both old format (array) and new format (object with data, total)
      const purchaseRequestsData = Array.isArray(response) 
        ? response 
        : (response.data || []);
      const purchaseRequests = purchaseRequestsData.map(normalizePurchaseRequest);
      const total = Array.isArray(response) ? purchaseRequests.length : (response.total || 0);
      set({ purchaseRequests, purchaseRequestsTotal: total, isLoading: false });
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

  updateTransaction: async (id, transactionData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await materialsAPI.updateTransaction(id, transactionData);
      const updatedTransaction = normalizeMaterialTransaction(response);
      set((state) => ({
        transactions: state.transactions.map((transaction) =>
          transaction.id === id ? updatedTransaction : transaction
        ),
        isLoading: false,
      }));
      // Refresh materials to get updated stock
      const data = await materialsAPI.getAll();
      const materials = Array.isArray(data) ? data.map(normalizeMaterial) : [];
      set({ materials });
      showSuccess('Cập nhật giao dịch thành công');
    } catch (error: any) {
      set({ error: error.message || 'Không thể cập nhật giao dịch', isLoading: false });
      throw error;
    }
  },

  deleteTransaction: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await materialsAPI.deleteTransaction(id);
      set((state) => ({
        transactions: state.transactions.filter((transaction) => transaction.id !== id),
        isLoading: false,
      }));
      // Refresh materials to get updated stock
      const data = await materialsAPI.getAll();
      const materials = Array.isArray(data) ? data.map(normalizeMaterial) : [];
      set({ materials });
      showSuccess('Xóa giao dịch thành công');
    } catch (error: any) {
      set({ error: error.message || 'Không thể xóa giao dịch', isLoading: false });
      throw error;
    }
  },

  addPurchaseRequest: async (requestData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await materialsAPI.createPurchaseRequest(requestData);
      const newRequest = normalizePurchaseRequest(response);
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

  updatePurchaseRequest: async (id, status) => {
    set({ isLoading: true, error: null });
    try {
      const response = await materialsAPI.updatePurchaseRequest(id, { status });
      const updatedRequest = normalizePurchaseRequest(response);
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

  deletePurchaseRequest: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await materialsAPI.deletePurchaseRequest(id);
      set((state) => ({
        purchaseRequests: state.purchaseRequests.filter((request) => request.id !== id),
        isLoading: false,
      }));
      showSuccess('Xóa yêu cầu mua hàng thành công');
    } catch (error: any) {
      set({ error: error.message || 'Không thể xóa yêu cầu mua hàng', isLoading: false });
      throw error;
    }
  },

  setSelectedMaterial: (material) => set({ selectedMaterial: material }),
}));

