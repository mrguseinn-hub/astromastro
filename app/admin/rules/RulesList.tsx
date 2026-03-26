'use client';

import { useState } from 'react';

interface Rule {
  id: string;
  name: string;
  description: string;
  conditions: Record<string, any>;
  output_template: string;
  priority: number;
}

interface Props {
  initialRules: Rule[];
}

export function RulesList({ initialRules }: Props) {
  const [rules, setRules] = useState(initialRules);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    conditions: {} as Record<string, any>,
    output_template: '',
    priority: 0,
  });

  const resetForm = () => {
    setFormData({ name: '', description: '', conditions: {}, output_template: '', priority: 0 });
    setEditingId(null);
    setIsCreating(false);
  };

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/admin/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create');

      const { data } = await response.json();
      setRules([data, ...rules]);
      resetForm();
    } catch (error) {
      alert('Failed to create rule');
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;

    try {
      const response = await fetch('/api/admin/rules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, ...formData }),
      });

      if (!response.ok) throw new Error('Failed to update');

      const { data } = await response.json();
      setRules(rules.map(r => r.id === editingId ? data : r));
      resetForm();
    } catch (error) {
      alert('Failed to update rule');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this rule?')) return;

    try {
      const response = await fetch(`/api/admin/rules?id=${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      setRules(rules.filter(r => r.id !== id));
    } catch (error) {
      alert('Failed to delete rule');
    }
  };

  const startEdit = (rule: Rule) => {
    setFormData({
      name: rule.name,
      description: rule.description || '',
      conditions: rule.conditions || {},
      output_template: rule.output_template || '',
      priority: rule.priority || 0,
    });
    setEditingId(rule.id);
    setIsCreating(true);
  };

  return (
    <div>
      <button
        onClick={() => setIsCreating(true)}
        className="px-4 py-2 rounded-lg font-medium text-white mb-6"
        style={{ background: 'var(--primary)' }}
      >
        + New Rule
      </button>

      {/* Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-lg rounded-xl p-6" style={{ background: 'var(--card)' }}>
            <h2 className="text-xl font-serif mb-4">{editingId ? 'Edit Rule' : 'New Rule'}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
                />
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

              <div>
                <label className="block text-sm font-medium mb-1">Conditions (JSON)</label>
                <textarea
                  value={JSON.stringify(formData.conditions, null, 2)}
                  onChange={(e) => {
                    try {
                      setFormData({ ...formData, conditions: JSON.parse(e.target.value) });
                    } catch {}
                  }}
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border font-mono text-sm"
                  style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Output Template</label>
                <textarea
                  value={formData.output_template}
                  onChange={(e) => setFormData({ ...formData, output_template: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
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
      <div className="space-y-3">
        {rules.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>No rules yet.</p>
        ) : (
          rules.map((rule) => (
            <div
              key={rule.id}
              className="p-4 rounded-xl"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{rule.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--accent)' }}>
                      P{rule.priority}
                    </span>
                  </div>
                  <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
                    {rule.description}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(rule)} className="text-xs px-2 py-1 rounded" style={{ background: 'var(--accent)' }}>Edit</button>
                  <button onClick={() => handleDelete(rule.id)} className="text-xs px-2 py-1 rounded text-red-600" style={{ background: '#fee2e2' }}>Delete</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}