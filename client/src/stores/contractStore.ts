import { create } from 'zustand';
import { Contract } from '../types';
import { contractsAPI } from '../services/api';
import { normalizeContract } from '../utils/normalize';
import { showSuccess } from '../utils/notifications';

interface ContractState {
  contracts: Contract[];
  selectedContract: Contract | null;
  isLoading: boolean;
  error: string | null;
  fetchContracts: () => Promise<void>;
  addContract: (contract: Omit<Contract, 'id' | 'createdAt'>) => Promise<void>;
  updateContract: (id: string, contract: Partial<Contract>) => Promise<void>;
  deleteContract: (id: string) => Promise<void>;
  setSelectedContract: (contract: Contract | null) => void;
}

export const useContractStore = create<ContractState>((set) => ({
  contracts: [],
  selectedContract: null,
  isLoading: false,
  error: null,

  fetchContracts: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await contractsAPI.getAll();
      const contracts = Array.isArray(data) ? data.map(normalizeContract) : [];
      set({ contracts, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch contracts', isLoading: false });
      console.error('Error fetching contracts:', error);
    }
  },

  addContract: async (contractData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await contractsAPI.create(contractData);
      const newContract = normalizeContract(data);
      set((state) => ({
        contracts: [...state.contracts, newContract],
        isLoading: false,
      }));
      showSuccess('Thêm hợp đồng thành công');
    } catch (error: any) {
      set({ error: error.message || 'Không thể thêm hợp đồng', isLoading: false });
      throw error;
    }
  },

  updateContract: async (id, contractData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await contractsAPI.update(id, contractData);
      const updatedContract = normalizeContract(data);
      set((state) => ({
        contracts: state.contracts.map((contract) =>
          contract.id === id ? updatedContract : contract
        ),
        isLoading: false,
      }));
      showSuccess('Cập nhật hợp đồng thành công');
    } catch (error: any) {
      set({ error: error.message || 'Không thể cập nhật hợp đồng', isLoading: false });
      throw error;
    }
  },

  deleteContract: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await contractsAPI.delete(id);
      set((state) => ({
        contracts: state.contracts.filter((contract) => contract.id !== id),
        isLoading: false,
      }));
      showSuccess('Xóa hợp đồng thành công');
    } catch (error: any) {
      set({ error: error.message || 'Không thể xóa hợp đồng', isLoading: false });
      throw error;
    }
  },

  setSelectedContract: (contract) => set({ selectedContract: contract }),
}));

