'use client';

import { useState } from 'react';

interface Entity {
  id: string;
  code: string;
  name: string;
  type: string;
  description?: string;
}

interface Props {
  initialEntities: Entity[];
}

const entityTypes = ['planet', 'sign', 'house', 'aspect'];

export function EntitiesList({ initialEntities }: Props) {
  const [entities, setEntities] = useState(initialEntities);
  const [filter, setFilter] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'planet',
    description: '',
  });

  const resetForm = () => {
    setFormData({ code: '', name: '', type: 'planet', description: '' });
    setEditingId(null);
    setIsCreating(false);
  };

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/admin/entities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create');

      const { data } = await response.json();
      setEntities([...entities, data]);
      resetForm();
    } catch (error) {
      alert('Failed to create entity');
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;

    try {
      const response = await fetch('/api/admin/entities', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, ...formData }),
      });

      if (!response.ok) throw new Error('Failed to update');

      const { data } = await response.json();
      setEntities(entities.map(e => e.id === editingId ? data : e));
      resetForm();
    } catch (error) {
      alert('Failed to update entity');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this entity?')) return;

    try {
      const response = await fetch(`/api/admin/entities?id=${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      setEntities(entities.filter(e => e.id !== id));
    } catch (error) {
      alert('Failed to delete entity');
    }
  };

  const startEdit = (entity: Entity) => {
    setFormData({
      code: entity.code,
      name: entity.name,
      type: entity.type,
      description: entity.description || '',
    });
    setEditingId(entity.id);
    setIsCreating(true);
  };

  const filtered = filter
    ? entities.filter(e => e.type === filter)
    : entities;

  const grouped = filtered.reduce((acc, e) => {
    if (!acc[e.type]) acc[e.type] = [];
    acc[e.type].push(e);
    return acc;
  }, {} as Record<string, Entity[]>);

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 rounded-lg font-medium text-white"
          style={{ background: 'var(--primary)' }}
        >
          + New Entity
        </button>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border"
          style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
        >
          <option value="">All Types</option>
          {entityTypes.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md rounded-xl p-6" style={{ background: 'var(--card)' }}>
            <h2 className="text-xl font-serif mb-4">
              {editingId ? 'Edit Entity' : 'New Entity'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
                  placeholder="e.g., sun_aries"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
                  placeholder="e.g., Sun in Aries"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
                >
                  {entityTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={resetForm} className="px-4 py-2 rounded-lg" style={{ background: 'var(--accent)' }}>
                Cancel
              </button>
              <button
                onClick={editingId ? handleUpdate : handleCreate}
                className="px-4 py-2 rounded-lg text-white"
                style={{ background: 'var(--primary)' }}
              >
                {editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-6">
        {Object.entries(grouped).map(([type, items]) => (
          <div key={type} className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <div className="px-4 py-2 font-medium capitalize" style={{ background: 'var(--accent)' }}>
              {type}s ({items.length})
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {items.map((entity) => (
                <div key={entity.id} className="flex items-center justify-between p-3" style={{ background: 'var(--card)' }}>
                  <div>
                    <code className="text-sm bg-gray-100 px-2 py-0.5 rounded">{entity.code}</code>
                    <span className="ml-2">{entity.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(entity)} className="text-xs px-2 py-1 rounded" style={{ background: 'var(--accent)' }}>Edit</button>
                    <button onClick={() => handleDelete(entity.id)} className="text-xs px-2 py-1 rounded text-red-600" style={{ background: '#fee2e2' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}