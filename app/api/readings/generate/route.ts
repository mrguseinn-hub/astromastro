import { NextRequest, NextResponse } from 'next/server';
import { BirthData, NatalChart, Transit, ThemeScores } from '@/types';
import { calculateNatalChart, calculateTransits } from '@/lib/astro/chart-calculator';
import { runScoringEngine } from '@/lib/scoring/scoring-engine';
import { generateReading } from '@/lib/llm/glm-client';
import { supabaseAdmin } from '@/lib/db/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const { birth_date, birth_time, birth_location, focus_area, user_context } = body;

    if (!birth_date || !birth_location || !focus_area) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Prepare birth data
    const birthData: BirthData = {
      date: new Date(birth_date),
      time: birth_time || '12:00',
      location: birth_location,
      focusArea: focus_area,
      context: user_context,
    };

    // Calculate natal chart
    let natalChart: NatalChart;
    try {
      natalChart = await calculateNatalChart(birthData);
    } catch (error) {
      console.error('Chart calculation error:', error);
      return NextResponse.json(
        { error: 'Failed to calculate birth chart' },
        { status: 500 }
      );
    }

    // Calculate transits
    let transits: Transit[];
    try {
      transits = await calculateTransits(natalChart, new Date());
    } catch (error) {
      console.error('Transit calculation error:', error);
      transits = [];
    }

    // Run scoring engine
    const { entityCodes, interpretations, themeScores, applicableRules } =
      await runScoringEngine(natalChart, transits);

    // Get language sentences based on theme scores
    const languageSentences = await getLanguageSentences(themeScores);

    // Generate reading via LLM
    const readingOutput = await generateReading({
      interpretationEntries: interpretations,
      languageSentences,
      themeScores,
      combinationRules: applicableRules,
      userContext: user_context,
      focusArea: focus_area,
    });

    // Save reading to database
    const admin = supabaseAdmin();
    const { data: reading, error: dbError } = await admin
      .from('readings')
      .insert({
        birth_date: birth_date,
        birth_time: birth_time || null,
        birth_location: birth_location,
        focus_area: focus_area,
        user_context: user_context || null,
        natal_chart: natalChart,
        transits: transits,
        theme_scores: themeScores,
        matched_entities: entityCodes,
        output: readingOutput,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save reading' },
        { status: 500 }
      );
    }

    return NextResponse.json({ reading });
  } catch (error) {
    console.error('Reading generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get language sentences based on theme scores
async function getLanguageSentences(themeScores: ThemeScores) {
  const admin = supabaseAdmin();
  const sentences: any[] = [];

  for (const [theme, score] of Object.entries(themeScores)) {
    const subtype = score >= 7 ? 'high' : score >= 4 ? 'medium' : 'low';

    const { data } = await admin
      .from('language_bank')
      .select('*')
      .eq('theme', theme)
      .eq('subtype', subtype)
      .limit(1);

    if (data && data.length > 0) {
      sentences.push(data[0]);
    }
  }

  return sentences;
}