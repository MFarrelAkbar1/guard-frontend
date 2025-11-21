import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Power, MapPin, Zap } from 'lucide-react';
import Button from '../common/Button';
import { ConfirmModal } from '../common/Modal';
import FridgeModal from './FridgeModal';
import { deleteFridge } from '../../services/fridgeService';
import type { Fridge } from '../../types/database';

interface FridgeManagementProps {
  fridges: Fridge[];
  fridgeStats: Record<string, any>;
  onRefresh: () => void;
}

const FridgeManagement: React.FC<FridgeManagementProps> = ({
  fridges,
  fridgeStats,
  onRefresh
}) => {
  const [showFridgeModal, setShowFridgeModal] = useState(false);
  const [selectedFridge, setSelectedFridge] = useState<Fridge | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [fridgeToDelete, setFridgeToDelete] = useState<Fridge | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleAddFridge = () => {
    setSelectedFridge(null);
    setModalMode('create');
    setShowFridgeModal(true);
  };

  const handleEditFridge = (fridge: Fridge) => {
    setSelectedFridge(fridge);
    setModalMode('edit');
    setShowFridgeModal(true);
  };

  const handleDeleteClick = (fridge: Fridge) => {
    setFridgeToDelete(fridge);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!fridgeToDelete) return;

    setDeleteLoading(true);
    try {
      await deleteFridge(fridgeToDelete.id);
      setShowDeleteConfirm(false);
      setFridgeToDelete(null);
      onRefresh();
    } catch (error) {
      console.error('Error deleting fridge:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleModalSuccess = () => {
    onRefresh();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (hasRecentData: boolean) => {
    return hasRecentData ? (
      <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
    ) : (
      <div className="h-2 w-2 bg-gray-300 rounded-full" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Device Management</h2>
          <p className="text-gray-500 mt-1">Manage your connected devices</p>
        </div>
        <Button
          variant="primary"
          onClick={handleAddFridge}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Device
        </Button>
      </div>

      {/* Fridge List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fridges.map((fridge) => {
          const stats = fridgeStats[fridge.id];
          const hasRecentData = stats?.lastUpdated &&
            (new Date().getTime() - new Date(stats.lastUpdated).getTime()) < 5 * 60 * 1000;

          return (
            <div
              key={fridge.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(hasRecentData)}
                  <h3 className="font-semibold text-gray-900">{fridge.name}</h3>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(fridge.status)}`}>
                  {fridge.status}
                </span>
              </div>

              {/* Info */}
              <div className="space-y-2 mb-4">
                {fridge.model && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Power className="h-4 w-4" />
                    <span>{fridge.model}</span>
                  </div>
                )}
                {fridge.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{fridge.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Zap className="h-4 w-4" />
                  <span>Design: {fridge.design_power_consumption}W</span>
                </div>
              </div>

              {/* Stats */}
              {stats && (
                <div className="bg-gray-50 rounded-md p-3 mb-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Current Power</p>
                      <p className="font-semibold text-gray-900">{stats.latestPowerWatts?.toFixed(1) || '0'}W</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Today's Energy</p>
                      <p className="font-semibold text-gray-900">{stats.todayPowerKwh?.toFixed(2) || '0'} kWh</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditFridge(fridge)}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <Edit2 className="h-3 w-3" />
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteClick(fridge)}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </Button>
              </div>
            </div>
          );
        })}

        {fridges.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Power className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No devices added yet</p>
            <Button variant="primary" onClick={handleAddFridge}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Device
            </Button>
          </div>
        )}
      </div>

      {/* Modals */}
      <FridgeModal
        isOpen={showFridgeModal}
        onClose={() => setShowFridgeModal(false)}
        onSuccess={handleModalSuccess}
        fridge={selectedFridge}
        mode={modalMode}
      />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Device"
        message={`Are you sure you want to delete "${fridgeToDelete?.name}"? This action cannot be undone.`}
        type="danger"
        confirmText="Delete"
        loading={deleteLoading}
      />
    </div>
  );
};

export default FridgeManagement;
