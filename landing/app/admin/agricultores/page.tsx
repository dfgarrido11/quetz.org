'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Loader2, User, MapPin, DollarSign } from 'lucide-react';
import FarmerModal from './farmer-modal';

interface Farmer {
  id: string;
  name: string;
  photoUrl: string | null;
  location: string;
  storyEs: string | null;
  active: boolean;
  adoptionCount: number;
  totalPayments: number;
  createdAt: string;
}

export default function FarmersPage() {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState<Farmer | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadFarmers = () => {
    setLoading(true);
    fetch('/api/admin/farmers')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setFarmers(data.farmers);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadFarmers();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/farmers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadFarmers();
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
    setDeleteConfirm(null);
  };

  const openEdit = (farmer: Farmer) => {
    setEditingFarmer(farmer);
    setModalOpen(true);
  };

  const openCreate = () => {
    setEditingFarmer(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingFarmer(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-quetz-green" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Agricultores</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-quetz-green text-white rounded-lg hover:bg-quetz-green/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Agricultor
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-3xl font-bold text-gray-900">{farmers.length}</p>
          <p className="text-sm text-gray-500">Total Agricultores</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-3xl font-bold text-green-600">{farmers.filter(f => f.active).length}</p>
          <p className="text-sm text-gray-500">Activos</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-3xl font-bold text-blue-600">
            €{farmers.reduce((sum, f) => sum + f.totalPayments, 0).toLocaleString('es-ES')}
          </p>
          <p className="text-sm text-gray-500">Pagos Totales</p>
        </div>
      </div>

      {/* Farmers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {farmers.map((farmer) => (
          <div key={farmer.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="aspect-[16/9] bg-gray-100 relative">
              {farmer.photoUrl ? (
                <img
                  src={farmer.photoUrl}
                  alt={farmer.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-16 h-16 text-gray-300" />
                </div>
              )}
              <span className={`absolute top-2 right-2 px-2 py-1 text-xs rounded-full ${
                farmer.active ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
              }`}>
                {farmer.active ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 text-lg">{farmer.name}</h3>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4" /> {farmer.location}
              </p>
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {farmer.storyEs || 'Sin historia'}
              </p>
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm">
                  <span className="text-gray-500">Adopciones:</span>{' '}
                  <span className="font-medium text-gray-900">{farmer.adoptionCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(farmer)}
                    className="p-2 text-gray-500 hover:text-quetz-blue hover:bg-quetz-blue/10 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(farmer.id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {farmers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No hay agricultores registrados</p>
          <button
            onClick={openCreate}
            className="mt-4 text-quetz-green hover:underline"
          >
            Crear el primero
          </button>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">¿Eliminar agricultor?</h3>
            <p className="text-gray-600 mb-4">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Farmer Modal */}
      {modalOpen && (
        <FarmerModal
          farmer={editingFarmer}
          onClose={closeModal}
          onSave={() => {
            closeModal();
            loadFarmers();
          }}
        />
      )}
    </div>
  );
}
