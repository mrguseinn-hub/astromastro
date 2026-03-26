import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-2xl text-center animate-fade-in">
        {/* Hero Section */}
        <h1 className="text-4xl md:text-5xl font-serif mb-6" style={{ color: 'var(--foreground)' }}>
          Understand Your Patterns
        </h1>

        <p className="text-lg md:text-xl mb-8" style={{ color: 'var(--muted)' }}>
          A personalized reading based on your birth moment — revealing core patterns,
          relationship dynamics, and what&apos;s active for you right now.
        </p>

        {/* Value Props */}
        <div className="grid gap-6 mb-12 text-left">
          <div className="p-6 rounded-xl" style={{ background: 'var(--card)', border: '1px solid var(--card-border)' }}>
            <h3 className="font-serif text-xl mb-2">Your Core Pattern</h3>
            <p style={{ color: 'var(--muted)' }}>
              The fundamental way you move through life — not what you do, but how you do it.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ background: 'var(--card)', border: '1px solid var(--card-border)' }}>
            <h3 className="font-serif text-xl mb-2">How You Connect</h3>
            <p style={{ color: 'var(--muted)' }}>
              Your relationship patterns — what builds trust, what triggers protection.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ background: 'var(--card)', border: '1px solid var(--card-border)' }}>
            <h3 className="font-serif text-xl mb-2">What&apos;s Active Now</h3>
            <p style={{ color: 'var(--muted)' }}>
              Current themes and practical guidance for this moment in your life.
            </p>
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/reading/new"
          className="btn-primary inline-block text-lg"
        >
          Get Your Reading
        </Link>

        <p className="mt-8 text-sm" style={{ color: 'var(--muted)' }}>
          No astrological jargon. Just clear, personal insights.
        </p>
      </div>
    </main>
  );
}