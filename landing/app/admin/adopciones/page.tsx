'use client';

import { useEffect, useState } from 'react';
import { Loader2, TreePine, User, Calendar, CheckCircle, Clock, XCircle, Filter, Search, ChevronDown } from 'lucide-react';

interface Adoption {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  treeId: string;
  treeName: string;
  farmerId: string | null;
  farmerName: string | null;
  quantity: number;
  amount: number;
  currency: string;
  status: string;
  plantedAt: string | null;
  progress: number;
  createdAt: string;
}

interface Farmer {
  id: string;
  name: string;
  location: string;
  active: boolean;
}

export default function AdoptionsPage() {
  const [adoptions, setAdoptions] = useState<Adoption[]>([]);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [adoptionsRes, farmersRes] = await Promise.all([
        fetch('/api/admin/adoptions'),
        fetch('/api/admin/farmers'),
      ]);
      const adoptionsData = await adoptionsRes.json();
      const farmersData = await farmersRes.json();
      
      if (adoptionsData.success) setAdoptions(adoptionsData.adoptions);
      if (farmersData.success) setFarmers(farmersData.farmers.filter((f: Farmer) => f.active));
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const assignFarmer = async (adoptionId: string, farmerId: string) => {
    setActionLoading(adoptionId);
    try {
      const res = await fetch(`/api/admin/adoptions/${adoptionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmerId }),
      });
      if (res.ok) {
        loadData();
      }
    } catch (error) {
      console.error('Assign error:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const markPlanted = async (adoptionId: string) => {
    setActionLoading(adoptionId);
    try {
      const res = await fetch(`/api/admin/adoptions/${adoptionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plantedAt: new Date().toISOString() }),
      });
      if (res.ok) {
        loadData();
      }
    } catch (error) {
      console.error('Plant error:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const updateStatus = async (adoptionId: string, status: string) => {
    setActionLoading(adoptionId);
    try {
      const res = await fetch(`/api/admin/adoptions/${adoptionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        loadData();
      }
    } catch (error) {
      console.error('Status error:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredAdoptions = adoptions.filter(a => {
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      a.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.treeName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusCounts = {
    all: adoptions.length,
    pending: adoptions.filter(a => a.status === 'pending').length,
    paid: adoptions.filter(a => a.status === 'paid').length,
    active: adoptions.filter(a => a.status === 'active').length,
    completed: adoptions.filter(a => a.status === 'completed').length,
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestión de Adopciones</h1>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por usuario o árbol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-quetz-green focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            {Object.entries(statusCounts).map(([status, count]) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-quetz-green text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'Todos' : 
                 status === 'pending' ? 'Pendientes' :
                 status === 'paid' ? 'Pagados' :
                 status === 'active' ? 'Activos' : 'Completados'}
                <span className="ml-1 opacity-70">({count})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Adoptions Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Árbol</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cant.</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agricultor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plantado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAdoptions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                    <TreePine className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    No hay adopciones que mostrar
                  </td>
                </tr>
              ) : (
                filteredAdoptions.map((adoption) => (
                  <tr key={adoption.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{adoption.userName || 'Anónimo'}</div>
                      <div className="text-xs text-gray-500">{adoption.userEmail}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-900">{adoption.treeName}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-900">{adoption.quantity}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-900">
                        {adoption.currency === 'EUR' ? '€' : adoption.currency} {adoption.amount}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={adoption.status}
                        onChange={(e) => updateStatus(adoption.id, e.target.value)}
                        disabled={actionLoading === adoption.id}
                        className={`text-xs px-2 py-1 rounded-full border-0 cursor-pointer ${
                          adoption.status === 'paid' || adoption.status === 'active' 
                            ? 'bg-green-100 text-green-700'
                            : adoption.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : adoption.status === 'completed'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        <option value="pending">Pendiente</option>
                        <option value="paid">Pagado</option>
                        <option value="active">Activo</option>
                        <option value="completed">Completado</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {adoption.farmerName ? (
                        <span className="text-sm text-gray-900">{adoption.farmerName}</span>
                      ) : (
                        <select
                          onChange={(e) => assignFarmer(adoption.id, e.target.value)}
                          disabled={actionLoading === adoption.id}
                          className="text-xs px-2 py-1 rounded border border-gray-200 bg-white"
                          defaultValue=""
                        >
                          <option value="" disabled>Asignar...</option>
                          {farmers.map(f => (
                            <option key={f.id} value={f.id}>{f.name}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {adoption.plantedAt ? (
                        <span className="flex items-center gap-1 text-sm text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          {new Date(adoption.plantedAt).toLocaleDateString('es-ES')}
                        </span>
                      ) : (
                        <button
                          onClick={() => markPlanted(adoption.id)}
                          disabled={actionLoading === adoption.id || adoption.status === 'pending'}
                          className="flex items-center gap-1 text-xs px-2 py-1 bg-quetz-green/10 text-quetz-green rounded hover:bg-quetz-green/20 transition-colors disabled:opacity-50"
                        >
                          <TreePine className="w-3 h-3" />
                          Marcar plantado
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-gray-500">
                        {new Date(adoption.createdAt).toLocaleDateString('es-ES')}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-gray-900">
            {adoptions.reduce((sum, a) => sum + a.quantity, 0)}
          </p>
          <p className="text-sm text-gray-500">Total árboles</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-green-600">
            {adoptions.filter(a => a.plantedAt).reduce((sum, a) => sum + a.quantity, 0)}
          </p>
          <p className="text-sm text-gray-500">Plantados</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-blue-600">
            {adoptions.filter(a => a.farmerId).length}
          </p>
          <p className="text-sm text-gray-500">Con agricultor</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-yellow-600">
            {adoptions.filter(a => !a.farmerId && a.status !== 'pending').length}
          </p>
          <p className="text-sm text-gray-500">Sin asignar</p>
        </div>
      </div>
    </div>
  );
}
