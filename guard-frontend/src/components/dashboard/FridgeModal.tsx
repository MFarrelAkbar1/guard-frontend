import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { createFridge, updateFridge } from '../../services/fridgeService';
import type { Fridge, FridgeFormData } from '../../types/database';

interface FridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  fridge?: Fridge | null;
  mode: 'create' | 'edit';
}

const FridgeModal: React.FC<FridgeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  fridge,
  mode
}) => {
  const [formData, setFormData] = useState<FridgeFormData>({
    name: '',
    model: '',
    location: '',
    design_power_consumption: 0,
    status: 'active'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form when modal opens/closes or fridge changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && fridge) {
        setFormData({
          name: fridge.name,
          model: fridge.model || '',
          location: fridge.location || '',
          design_power_consumption: fridge.design_power_consumption,
          status: fridge.status
        });
      } else {
        setFormData({
          name: '',
          model: '',
          location: '',
          design_power_consumption: 0,
          status: 'active'
        });
      }
      setError('');
    }
  }, [isOpen, fridge, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'create') {
        await createFridge(formData);
      } else if (mode === 'edit' && fridge) {
        await updateFridge(fridge.id, {
          name: formData.name,
          model: formData.model || undefined,
          location: formData.location || undefined,
          design_power_consumption: formData.design_power_consumption,
          status: formData.status
        });
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save fridge');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'design_power_consumption' ? parseFloat(value) || 0 : value
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Add New Fridge' : 'Edit Fridge'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Fridge Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Fridge A"
          />
        </div>

        <div>
          <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
            Model
          </label>
          <input
            type="text"
            id="model"
            name="model"
            value={formData.model}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Samsung RT38K5032S8"
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Kitchen, Warehouse 1"
          />
        </div>

        <div>
          <label htmlFor="design_power_consumption" className="block text-sm font-medium text-gray-700 mb-1">
            Design Power Consumption (Watts) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="design_power_consumption"
            name="design_power_consumption"
            value={formData.design_power_consumption}
            onChange={handleChange}
            required
            min="0"
            step="0.1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 180"
          />
          <p className="mt-1 text-xs text-gray-500">Expected power consumption in watts</p>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
          >
            {mode === 'create' ? 'Add Fridge' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default FridgeModal;
