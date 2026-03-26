'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Reading, ReadingOutput } from '@/types';

export default function ReadingPage() {
  const params = useParams();
  const [reading, setReading] = useState<Reading | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReading = async () => {
      try {
        const response = await fetch(`/api/readings/${params.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load reading');
        }

        setReading(data.reading);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchReading();
    }
  }, [params.id]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <div className="w-16 h-16 rounded-full mx-auto" style={{ background: 'var(--secondary)' }} />
          </div>
          <p style={{ color: 'var(--muted)' }}>Generating your personalized reading...</p>
        </div>
      </main>
    );
  }

  if (error || !reading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-serif mb-4">Something went wrong</h1>
          <p style={{ color: 'var(--muted)' }}>{error || 'Reading not found'}</p>
        </div>
      </main>
    );
  }

  const sections: Partial<ReadingOutput> = reading.output || {};

  const sectionOrder = [
    { key: 'core_pattern', title: 'Your Core Pattern' },
    { key: 'connection_style', title: 'How You Build Connection' },
    { key: 'protection_mode', title: 'What Triggers Your Protection Mode' },
    { key: 'current_transits', title: "What's Active Right Now" },
    { key: 'avoid_this_week', title: 'This Week — Don\'t Do This' },
    { key: 'do_this_week', title: 'This Week — Do This Instead' },
  ];

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-serif mb-4">Your Personal Reading</h1>
          <p style={{ color: 'var(--muted)' }}>
            Based on your birth moment and current themes
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sectionOrder.map(({ key, title }, index) => (
            <div
              key={key}
              className="reading-section animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <h2>{title}</h2>
              <p>{sections[key as keyof ReadingOutput] || 'This section is being generated...'}</p>
            </div>
          ))}
        </div>

        {/* Download PDF */}
        <div className="mt-12 text-center flex gap-4 justify-center">
          <button
            onClick={() => window.print()}
            className="btn-secondary"
          >
            Print / Save as PDF
          </button>
          <a
            href={`/api/readings/${params.id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            Open PDF
          </a>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            This reading is for reflection and personal insight.
            <br />
            Trust what resonates, leave what doesn&apos;t.
          </p>
        </div>
      </div>
    </main>
  );
}