'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { geocodeLocation } from '@/lib/astro/geocoding';

export default function NewReadingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');
  const [locationResults, setLocationResults] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<any | null>(null);
  const [focusArea, setFocusArea] = useState<'relationship' | 'self_awareness'>('self_awareness');
  const [context, setContext] = useState('');

  // Search locations
  const handleLocationSearch = async (query: string) => {
    setLocationQuery(query);
    if (query.length < 3) {
      setLocationResults([]);
      return;
    }

    const results = await geocodeLocation(query);
    setLocationResults(results);
  };

  // Select location
  const handleSelectLocation = (loc: any) => {
    setSelectedLocation(loc);
    setLocationQuery(loc.city);
    setLocationResults([]);
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!birthDate) {
      setError('Please enter your birth date');
      return;
    }

    if (!selectedLocation) {
      setError('Please select a birth location');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/readings/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birth_date: birthDate,
          birth_time: timeUnknown ? null : birthTime,
          birth_location: {
            city: selectedLocation.city,
            lat: selectedLocation.lat,
            lng: selectedLocation.lng,
          },
          focus_area: focusArea,
          user_context: context || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate reading');
      }

      router.push(`/reading/${data.reading.id}`);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-serif mb-2 text-center">Your Birth Moment</h1>
        <p className="text-center mb-8" style={{ color: 'var(--muted)' }}>
          Enter your birth details to receive your personalized reading.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Birth Date */}
          <div>
            <label className="block text-sm font-medium mb-2">Birth Date</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          {/* Birth Time */}
          <div>
            <label className="block text-sm font-medium mb-2">Birth Time</label>
            <div className="flex gap-4 items-center">
              <input
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                disabled={timeUnknown}
                className="flex-1"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={timeUnknown}
                  onChange={(e) => setTimeUnknown(e.target.checked)}
                />
                I don&apos;t know
              </label>
            </div>
            {timeUnknown && (
              <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
                We&apos;ll use noon as a default time.
              </p>
            )}
          </div>

          {/* Birth Location */}
          <div className="relative">
            <label className="block text-sm font-medium mb-2">Birth Location</label>
            <input
              type="text"
              value={locationQuery}
              onChange={(e) => handleLocationSearch(e.target.value)}
              placeholder="Start typing a city..."
              autoComplete="off"
            />
            {locationResults.length > 0 && (
              <ul
                className="absolute z-10 w-full mt-1 rounded-lg shadow-lg overflow-hidden"
                style={{ background: 'var(--card)', border: '1px solid var(--card-border)' }}
              >
                {locationResults.map((loc, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => handleSelectLocation(loc)}
                      className="w-full text-left px-4 py-3 hover:opacity-80 transition-colors"
                      style={{ background: i === 0 ? 'var(--secondary)' : 'transparent' }}
                    >
                      {loc.city}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {selectedLocation && (
              <p className="text-sm mt-1" style={{ color: 'var(--success)' }}>
                ✓ {selectedLocation.city}
              </p>
            )}
          </div>

          {/* Focus Area */}
          <div>
            <label className="block text-sm font-medium mb-2">What would you like to explore?</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFocusArea('self_awareness')}
                className="p-4 rounded-lg text-center transition-all"
                style={{
                  background: focusArea === 'self_awareness' ? 'var(--primary)' : 'var(--card)',
                  color: focusArea === 'self_awareness' ? 'white' : 'var(--foreground)',
                  border: '1px solid var(--card-border)',
                }}
              >
                Self-Awareness
              </button>
              <button
                type="button"
                onClick={() => setFocusArea('relationship')}
                className="p-4 rounded-lg text-center transition-all"
                style={{
                  background: focusArea === 'relationship' ? 'var(--primary)' : 'var(--card)',
                  color: focusArea === 'relationship' ? 'white' : 'var(--foreground)',
                  border: '1px solid var(--card-border)',
                }}
              >
                Relationships
              </button>
            </div>
          </div>

          {/* Optional Context */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Anything specific on your mind? <span style={{ color: 'var(--muted)' }}>(optional)</span>
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value.slice(0, 200))}
              placeholder="e.g., 'I've been feeling stuck in my career' or 'A relationship just ended'"
              rows={3}
              maxLength={200}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
              {context.length}/200 characters
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              className="p-4 rounded-lg text-sm"
              style={{ background: 'var(--error)', color: 'white' }}
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-lg"
          >
            {loading ? 'Generating your reading...' : 'Get My Reading'}
          </button>
        </form>
      </div>
    </main>
  );
}