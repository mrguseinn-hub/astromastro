import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import { ReadingOutput } from '@/types';

// Simple HTML to PDF using browser print
// For server-side PDF, we'd use @react-pdf/renderer

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = supabaseAdmin();

    const { data: reading, error } = await admin
      .from('readings')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !reading) {
      return NextResponse.json({ error: 'Reading not found' }, { status: 404 });
    }

    const output = reading.output as ReadingOutput;

    // Generate HTML for PDF
    const html = generatePDFHtml(reading, output);

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}

function generatePDFHtml(reading: any, output: ReadingOutput): string {
  const sectionTitles: Record<string, string> = {
    core_pattern: 'Your Core Pattern',
    connection_style: 'How You Build Connection',
    protection_mode: 'What Triggers Your Protection Mode',
    current_transits: "What's Active Right Now",
    avoid_this_week: 'This Week — Don\'t Do This',
    do_this_week: 'This Week — Do This Instead',
  };

  const sections = Object.entries(sectionTitles)
    .map(([key, title]) => {
      const content = output[key as keyof ReadingOutput] || '';
      return `
        <div class="section">
          <h2>${title}</h2>
          <p>${content}</p>
        </div>
      `;
    })
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Personal Reading</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600&family=Inter:wght@400;500&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', sans-serif;
          line-height: 1.6;
          color: #1a1a2e;
          background: #fdf8f5;
          padding: 40px;
          max-width: 600px;
          margin: 0 auto;
        }

        h1 {
          font-family: 'Crimson Pro', serif;
          font-size: 28px;
          font-weight: 600;
          text-align: center;
          margin-bottom: 8px;
          color: #2d2d44;
        }

        .subtitle {
          text-align: center;
          color: #6b6b8d;
          font-size: 14px;
          margin-bottom: 40px;
        }

        .section {
          margin-bottom: 32px;
          padding: 24px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        h2 {
          font-family: 'Crimson Pro', serif;
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 12px;
          color: #2d2d44;
        }

        p {
          font-size: 15px;
          line-height: 1.7;
          color: #4a4a6a;
        }

        .footer {
          text-align: center;
          margin-top: 48px;
          padding-top: 24px;
          border-top: 1px solid #e8e8ed;
          color: #6b6b8d;
          font-size: 13px;
        }

        @media print {
          body {
            background: white;
            padding: 20px;
          }
          .section {
            box-shadow: none;
            border: 1px solid #e8e8ed;
          }
        }
      </style>
    </head>
    <body>
      <h1>Your Personal Reading</h1>
      <p class="subtitle">Based on your birth moment and current themes</p>

      ${sections}

      <div class="footer">
        <p>This reading is for reflection and personal insight.</p>
        <p>Trust what resonates, leave what doesn't.</p>
      </div>
    </body>
    </html>
  `;
}