import { supabaseAdmin } from '@/lib/db/supabase';

export default async function AdminDashboard() {
  const admin = supabaseAdmin();

  // Get counts
  const [
    { count: entitiesCount },
    { count: interpretationsCount },
    { count: languageBankCount },
    { count: rulesCount },
    { count: readingsCount },
  ] = await Promise.all([
    admin.from('astro_entities').select('*', { count: 'exact', head: true }),
    admin.from('interpretation_entries').select('*', { count: 'exact', head: true }),
    admin.from('language_bank').select('*', { count: 'exact', head: true }),
    admin.from('combination_rules').select('*', { count: 'exact', head: true }),
    admin.from('readings').select('*', { count: 'exact', head: true }),
  ]);

  // Get recent readings
  const { data: recentReadings } = await admin
    .from('readings')
    .select('id, created_at, focus_area')
    .order('created_at', { ascending: false })
    .limit(5);

  const stats = [
    { label: 'Astro Entities', count: entitiesCount || 0, color: '#8b5cf6' },
    { label: 'Interpretations', count: interpretationsCount || 0, color: '#06b6d4' },
    { label: 'Language Bank', count: languageBankCount || 0, color: '#10b981' },
    { label: 'Combination Rules', count: rulesCount || 0, color: '#f59e0b' },
    { label: 'Total Readings', count: readingsCount || 0, color: '#ec4899' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-serif mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-4 rounded-xl"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              {stat.label}
            </p>
            <p className="text-3xl font-bold mt-1" style={{ color: stat.color }}>
              {stat.count}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Readings */}
      <div
        className="rounded-xl p-6"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <h2 className="text-lg font-serif mb-4">Recent Readings</h2>

        {recentReadings && recentReadings.length > 0 ? (
          <div className="space-y-3">
            {recentReadings.map((reading) => (
              <div
                key={reading.id}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ background: 'var(--background)' }}
              >
                <div>
                  <p className="font-medium capitalize">{reading.focus_area}</p>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>
                    {new Date(reading.created_at).toLocaleDateString()}
                  </p>
                </div>
                <a
                  href={`/reading/${reading.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm px-3 py-1 rounded-lg"
                  style={{ background: 'var(--accent)' }}
                >
                  View
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--muted)' }}>No readings yet</p>
        )}
      </div>
    </div>
  );
}