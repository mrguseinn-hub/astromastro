'use client';

import { useState } from 'react';

interface Interpretation {
  id: string;
  entity_code: string;
  name: string;
  description: string;
  psychological_theme: string;
  scoring_contributions: Record<string, number>;
  created_at: string;
}

interface Entity {
  code: string;
  name: string;
  type: string;
}

interface Props {
  initialInterpretations: Interpretation[];
  entities: Entity[];
}

export function InterpretationsList({ initialInterpretations, entities }: Props) {
  const [interpretations, setInterpretations] = useState(initialInterpretations);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    entity_code: '',
    name: '',
    description: '',
    psychological_theme: '',
    scoring_contributions: {} as Record<string, number>,
  });

  const themeKeys = [
    'emotional_intensity', 'guardedness', 'trust_sensitivity', 'relationship_capacity',
    'action_orientation', 'intellectual_engagement', 'stability_seeking',
    'practical_expression', 'communication_style', 'identity'
  ];

  const resetForm = () => {
    setFormData({
      entity_code: '',
      name: '',
      description: '',
      psychological_theme: '',
      scoring_contributions: {},
    });
    setEditingId(null);
    setIsCreating(false);
  };

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/admin/interpretations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create');

      const { data } = await response.json();
      setInterpretations([data, ...interpretations]);
      resetForm();
    } catch (error) {
      console.error('Create error:', error);
      alert('Failed to create interpretation');
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;

    try {
      const response = await fetch('/api/admin/interpretations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, ...formData }),
      });

      if (!response.ok) throw new Error('Failed to update');

      const { data } = await response.json();
      setInterpretations(interpretations.map(i => i.id === editingId ? data : i));
      resetForm();
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update interpretation');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this interpretation?')) return;

    try {
      const response = await fetch(`/api/admin/interpretations?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      setInterpretations(interpretations.filter(i => i.id !== id));
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete interpretation');
    }
  };

  const startEdit = (interp: Interpretation) => {
    setFormData({
      entity_code: interp.entity_code,
      name: interp.name,
      description: interp.description,
      psychological_theme: interp.psychological_theme,
      scoring_contributions: interp.scoring_contributions || {},
    });
    setEditingId(interp.id);
    setIsCreating(true);
  };

  const updateScore = (theme: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      scoring_contributions: {
        ...prev.scoring_contributions,
        [theme]: Math.max(-5, Math.min(5, value)),
      },
    }));
  };

  return (
    <div className="w-full">
      {/* Create Button */}
      {!isCreating && (
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 rounded-lg font-medium"
          style={{ background: 'var(--primary)', color: 'white' }}
        >
          + New Interpretation
        </button>
      )}

      {/* Form Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl p-6"
            style={{ background: 'var(--card)' }}
          >
            <h2 className="text-xl font-serif mb-4">
              {editingId ? 'Edit Interpretation' : 'New Interpretation'}
            </h2>

            <div className="space-y-4">
              {/* Entity Select */}
              <div>
                <label className="block text-sm font-medium mb-1">Entity</label>
                <select
                  value={formData.entity_code}
                  onChange={(e) => setFormData({ ...formData, entity_code: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
                >
                  <option value="">Select an entity...</option>
                  {entities.map((entity) => (
                    <option key={entity.code} value={entity.code}>
                      {entity.name} ({entity.type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Name */}
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

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
                  placeholder="Astrological description..."
                />
              </div>

              {/* Psychological Theme */}
              <div>
                <label className="block text-sm font-medium mb-1">Psychological Theme</label>
                <textarea
                  value={formData.psychological_theme}
                  onChange={(e) => setFormData({ ...formData, psychological_theme: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
                  placeholder="Psychological interpretation..."
                />
              </div>

              {/* Scoring Contributions */}
              <div>
                <label className="block text-sm font-medium mb-2">Scoring Contributions (-5 to +5)</label>
                <div className="grid grid-cols-2 gap-2">
                  {themeKeys.map((theme) => (
                    <div key={theme} className="flex items-center gap-2">
                      <span className="text-xs flex-1 truncate">{theme.replace(/_/g, ' ')}</span>
                      <input
                        type="number"
                        min="-5"
                        max="5"
                        value={formData.scoring_contributions[theme] || 0}
                        onChange={(e) => updateScore(theme, parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 rounded border text-sm"
                        style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={resetForm}
                className="px-4 py-2 rounded-lg"
                style={{ background: 'var(--accent)' }}
              >
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
      <div className="mt-6 space-y-3">
        {interpretations.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>No interpretations yet. Create your first one!</p>
        ) : (
          interpretations.map((interp) => (
            <div
              key={interp.id}
              className="p-4 rounded-xl"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs px-2 py-0.5 rounded"
                      style={{ background: 'var(--accent)' }}
                    >
                      {interp.entity_code}
                    </span>
                    <h3 className="font-medium">{interp.name}</h3>
                  </div>
                  <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
                    {(interp.description || '').substring(0, 100)}...
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(interp)}
                    className="text-sm px-3 py-1 rounded"
                    style={{ background: 'var(--accent)' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(interp.id)}
                    className="text-sm px-3 py-1 rounded text-red-600"
                    style={{ background: '#fee2e2' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}