'use client';

import { useState } from 'react';

interface Sentence {
  id: string;
  theme: string;
  subtype: string;
  sentence_text: string;
  created_at: string;
}

interface Props {
  initialSentences: Sentence[];
}

const themes = [
  'emotional_intensity', 'guardedness', 'trust_sensitivity', 'relationship_capacity',
  'action_orientation', 'intellectual_engagement', 'stability_seeking',
  'practical_expression', 'communication_style', 'identity'
];

const subtypes = ['low', 'medium', 'high'];

export function LanguageBankList({ initialSentences }: Props) {
  const [sentences, setSentences] = useState(initialSentences);
  const [filter, setFilter] = useState({ theme: '', subtype: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    theme: '',
    subtype: '',
    sentence_text: '',
  });

  const resetForm = () => {
    setFormData({ theme: '', subtype: '', sentence_text: '' });
    setEditingId(null);
    setIsCreating(false);
  };

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/admin/language-bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create');

      const { data } = await response.json();
      setSentences([...sentences, data]);
      resetForm();
    } catch (error) {
      console.error('Create error:', error);
      alert('Failed to create sentence');
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;

    try {
      const response = await fetch('/api/admin/language-bank', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, ...formData }),
      });

      if (!response.ok) throw new Error('Failed to update');

      const { data } = await response.json();
      setSentences(sentences.map(s => s.id === editingId ? data : s));
      resetForm();
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update sentence');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this sentence?')) return;

    try {
      const response = await fetch(`/api/admin/language-bank?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      setSentences(sentences.filter(s => s.id !== id));
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete sentence');
    }
  };

  const startEdit = (sentence: Sentence) => {
    setFormData({
      theme: sentence.theme,
      subtype: sentence.subtype,
      sentence_text: sentence.sentence_text,
    });
    setEditingId(sentence.id);
    setIsCreating(true);
  };

  const filteredSentences = sentences.filter(s => {
    if (filter.theme && s.theme !== filter.theme) return false;
    if (filter.subtype && s.subtype !== filter.subtype) return false;
    return true;
  });

  // Group by theme
  const groupedByTheme = filteredSentences.reduce((acc, s) => {
    if (!acc[s.theme]) acc[s.theme] = [];
    acc[s.theme].push(s);
    return acc;
  }, {} as Record<string, Sentence[]>);

  return (
    <div>
      {/* Controls */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 rounded-lg font-medium text-white"
          style={{ background: 'var(--primary)' }}
        >
          + New Sentence
        </button>

        <select
          value={filter.theme}
          onChange={(e) => setFilter({ ...filter, theme: e.target.value })}
          className="px-3 py-2 rounded-lg border"
          style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
        >
          <option value="">All Themes</option>
          {themes.map(t => (
            <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
          ))}
        </select>

        <select
          value={filter.subtype}
          onChange={(e) => setFilter({ ...filter, subtype: e.target.value })}
          className="px-3 py-2 rounded-lg border"
          style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
        >
          <option value="">All Subtypes</option>
          {subtypes.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className="w-full max-w-lg rounded-xl p-6"
            style={{ background: 'var(--card)' }}
          >
            <h2 className="text-xl font-serif mb-4">
              {editingId ? 'Edit Sentence' : 'New Sentence'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Theme</label>
                <select
                  value={formData.theme}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
                >
                  <option value="">Select theme...</option>
                  {themes.map(t => (
                    <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Subtype</label>
                <select
                  value={formData.subtype}
                  onChange={(e) => setFormData({ ...formData, subtype: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
                >
                  <option value="">Select subtype...</option>
                  {subtypes.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Sentence Text</label>
                <textarea
                  value={formData.sentence_text}
                  onChange={(e) => setFormData({ ...formData, sentence_text: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
                  placeholder="Human-readable sentence..."
                />
              </div>
            </div>

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

      {/* Grouped List */}
      {Object.keys(groupedByTheme).length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>No sentences found.</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByTheme).map(([theme, items]) => (
            <div
              key={theme}
              className="rounded-xl overflow-hidden"
              style={{ border: '1px solid var(--border)' }}
            >
              <div
                className="px-4 py-2 font-medium capitalize"
                style={{ background: 'var(--accent)' }}
              >
                {theme.replace(/_/g, ' ')}
              </div>
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3"
                    style={{ background: 'var(--card)' }}
                  >
                    <div className="flex-1">
                      <span
                        className="text-xs px-2 py-0.5 rounded mr-2"
                        style={{ background: 'var(--secondary)', color: 'white' }}
                      >
                        {item.subtype}
                      </span>
                      <span>{item.sentence_text}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(item)}
                        className="text-xs px-2 py-1 rounded"
                        style={{ background: 'var(--accent)' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-xs px-2 py-1 rounded text-red-600"
                        style={{ background: '#fee2e2' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}