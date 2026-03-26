import { supabaseAdmin } from '@/lib/db/supabase';

export default async function ReadingsPage() {
  const admin = supabaseAdmin();

  const { data: readings } = await admin
    .from('readings')
    .select('id, created_at, focus_area, birth_date')
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-serif mb-6">Generated Readings</h1>

      {!readings || readings.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>No readings generated yet.</p>
      ) : (
        <div className="space-y-3">
          {readings.map((reading) => (
            <div
              key={reading.id}
              className="p-4 rounded-xl flex items-center justify-between"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <div>
                <div className="flex items-center gap-3">
                  <span
                    className="text-xs px-2 py-0.5 rounded capitalize"
                    style={{ background: 'var(--accent)' }}
                  >
                    {reading.focus_area}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--muted)' }}>
                    {new Date(reading.birth_date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
                  Created: {new Date(reading.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <a
                  href={`/reading/${reading.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm px-3 py-1 rounded-lg"
                  style={{ background: 'var(--primary)', color: 'white' }}
                >
                  View
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}