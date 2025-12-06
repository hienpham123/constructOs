import { Request, Response } from 'express';
import { query } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import { toMySQLDateTime, toMySQLDate } from '../utils/dataHelpers.js';
import type { Contract } from '../types/index.js';

export const getContracts = async (req: Request, res: Response) => {
  try {
    const results = await query<any[]>(
      'SELECT * FROM contracts ORDER BY created_at DESC'
    );
    
    // Get documents for each contract
    const contractsWithDocuments = await Promise.all(
      results.map(async (contract) => {
        const documents = await query<any[]>(
          'SELECT url FROM contract_documents WHERE contract_id = ?',
          [contract.id]
        );
        return {
          ...contract,
          documents: documents.map((d) => d.url),
        };
      })
    );
    
    res.json(contractsWithDocuments);
  } catch (error: any) {
    console.error('Error fetching contracts:', error);
    res.status(500).json({ error: 'Không thể lấy danh sách hợp đồng' });
  }
};

export const getContractById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const results = await query<any[]>(
      'SELECT * FROM contracts WHERE id = ?',
      [id]
    );
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy hợp đồng' });
    }
    
    const contract = results[0];
    
    // Get documents
    const documents = await query<any[]>(
      'SELECT url FROM contract_documents WHERE contract_id = ?',
      [id]
    );
    
    res.json({
      ...contract,
      documents: documents.map((d) => d.url),
    });
  } catch (error: any) {
    console.error('Error fetching contract:', error);
    res.status(500).json({ error: 'Không thể lấy thông tin hợp đồng' });
  }
};

export const createContract = async (req: Request, res: Response) => {
  try {
    const contractData = req.body;
    const id = uuidv4();
    const createdAt = toMySQLDateTime();
    
    await query(
      `INSERT INTO contracts (
        id, code, name, type, client, project_id, project_name,
        value, start_date, end_date, status, signed_date, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        contractData.code,
        contractData.name,
        contractData.type,
        contractData.client,
        contractData.projectId || null,
        contractData.projectName || null,
        contractData.value,
        toMySQLDate(contractData.startDate),
        toMySQLDate(contractData.endDate),
        contractData.status || 'draft',
        contractData.signedDate ? toMySQLDate(contractData.signedDate) : null,
        createdAt,
        createdAt,
      ]
    );
    
    // Insert documents if provided
    if (contractData.documents && Array.isArray(contractData.documents)) {
      for (const docUrl of contractData.documents) {
        const docId = uuidv4();
        await query(
          'INSERT INTO contract_documents (id, contract_id, name, url, uploaded_by, uploaded_at) VALUES (?, ?, ?, ?, ?, ?)',
          [docId, id, docUrl.split('/').pop() || 'document', docUrl, contractData.createdBy || null, createdAt]
        );
      }
    }
    
    const newContract = await query<any[]>(
      'SELECT * FROM contracts WHERE id = ?',
      [id]
    );
    
    const documents = await query<any[]>(
      'SELECT url FROM contract_documents WHERE contract_id = ?',
      [id]
    );
    
    res.status(201).json({
      ...newContract[0],
      documents: documents.map((d) => d.url),
    });
  } catch (error: any) {
    console.error('Error creating contract:', error);
    res.status(500).json({ error: 'Không thể tạo hợp đồng' });
  }
};

export const updateContract = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const contractData = req.body;
    const updatedAt = toMySQLDateTime();
    
    // Check if exists
    const existing = await query<any[]>(
      'SELECT * FROM contracts WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy hợp đồng' });
    }
    
    await query(
      `UPDATE contracts SET
        code = ?, name = ?, type = ?, client = ?, project_id = ?, project_name = ?,
        value = ?, start_date = ?, end_date = ?, status = ?, signed_date = ?, updated_at = ?
      WHERE id = ?`,
      [
        contractData.code,
        contractData.name,
        contractData.type,
        contractData.client,
        contractData.projectId || null,
        contractData.projectName || null,
        contractData.value,
        toMySQLDate(contractData.startDate),
        toMySQLDate(contractData.endDate),
        contractData.status,
        contractData.signedDate ? toMySQLDate(contractData.signedDate) : null,
        updatedAt,
        id,
      ]
    );
    
    // Update documents if provided
    if (contractData.documents && Array.isArray(contractData.documents)) {
      // Delete existing documents
      await query('DELETE FROM contract_documents WHERE contract_id = ?', [id]);
      
      // Insert new documents
      for (const docUrl of contractData.documents) {
        const docId = uuidv4();
        await query(
          'INSERT INTO contract_documents (id, contract_id, name, url, uploaded_by, uploaded_at) VALUES (?, ?, ?, ?, ?, ?)',
          [docId, id, docUrl.split('/').pop() || 'document', docUrl, contractData.updatedBy || null, updatedAt]
        );
      }
    }
    
    const updated = await query<any[]>(
      'SELECT * FROM contracts WHERE id = ?',
      [id]
    );
    
    const documents = await query<any[]>(
      'SELECT url FROM contract_documents WHERE contract_id = ?',
      [id]
    );
    
    res.json({
      ...updated[0],
      documents: documents.map((d) => d.url),
    });
  } catch (error: any) {
    console.error('Error updating contract:', error);
    res.status(500).json({ error: 'Không thể cập nhật hợp đồng' });
  }
};

export const deleteContract = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if exists
    const existing = await query<any[]>(
      'SELECT * FROM contracts WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy hợp đồng' });
    }
    
    // Delete documents (CASCADE should handle this, but being explicit)
    await query('DELETE FROM contract_documents WHERE contract_id = ?', [id]);
    await query('DELETE FROM contracts WHERE id = ?', [id]);
    
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting contract:', error);
    res.status(500).json({ error: 'Không thể xóa hợp đồng' });
  }
};
