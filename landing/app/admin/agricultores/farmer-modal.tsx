'use client';

import { useState } from 'react';
import { X, Loader2, Upload } from 'lucide-react';

interface Farmer {
  id: string;
  name: string;
  photoUrl: string | null;
  location: string;
  storyEs: string | null;
  active: boolean;
}

interface Props {
  farmer: Farmer | null;
  onClose: () => void;
  onSave: () => void;
}

export default function FarmerModal({ farmer, onClose, onSave }: Props) {
  const [formData, setFormData] = useState({
    name: farmer?.name || '',
    location: farmer?.location || '',
    photoUrl: farmer?.photoUrl || '',
    storyEs: farmer?.storyEs || '',
    storyDe: '',
    storyEn: '',
    storyFr: '',
    storyAr: '',
    active: farmer?.active ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = farmer ? `/api/admin/farmers/${farmer.id}` : '/api/admin/farmers';
      const method = farmer ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al guardar');
      }

      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">
            {farmer ? 'Editar Agricultor' : 'Nuevo Agricultor'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-quetz-green focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ej: Aldea Jumuzna, Zacapa"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-quetz-green focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL de Foto</label>
            <input
              type="url"
              value={formData.photoUrl}
              onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
              placeholder="https://i.ytimg.com/vi/E8nm7b9i4X0/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLArfxTaO9mmPATC0IqvFfSu4-PqLA"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-quetz-green focus:border-transparent"
            />
            {formData.photoUrl && (
              <div className="mt-2 w-32 h-20 bg-gray-100 rounded-lg overflow-hidden">
                <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Historia (Español) *</label>
            <textarea
              value={formData.storyEs}
              onChange={(e) => setFormData({ ...formData, storyEs: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-quetz-green focus:border-transparent"
              placeholder="Cuéntanos la historia de este agricultor..."
              required
            />
          </div>

          {/* Collapsible section for other languages */}
          <details className="border rounded-lg">
            <summary className="px-4 py-2 cursor-pointer text-sm font-medium text-gray-700 hover:bg-gray-50">
              Traducciones (opcional)
            </summary>
            <div className="p-4 space-y-3 border-t">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Alemán</label>
                <textarea
                  value={formData.storyDe}
                  onChange={(e) => setFormData({ ...formData, storyDe: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Inglés</label>
                <textarea
                  value={formData.storyEn}
                  onChange={(e) => setFormData({ ...formData, storyEn: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Francés</label>
                <textarea
                  value={formData.storyFr}
                  onChange={(e) => setFormData({ ...formData, storyFr: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Árabe</label>
                <textarea
                  value={formData.storyAr}
                  onChange={(e) => setFormData({ ...formData, storyAr: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  dir="rtl"
                />
              </div>
            </div>
          </details>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-4 h-4 text-quetz-green rounded"
            />
            <label htmlFor="active" className="text-sm text-gray-700">Agricultor activo</label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-quetz-green text-white rounded-lg hover:bg-quetz-green/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {farmer ? 'Guardar Cambios' : 'Crear Agricultor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
