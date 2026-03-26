import { LLMRequest, ReadingOutput, InterpretationEntry, LanguageBankEntry, ThemeScores } from '@/types';

const DASHSCOPE_URL = process.env.DASHSCOPE_BASE_URL || 'https://coding-intl.dashscope.aliyuncs.com/v1';
const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY;

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Build the prompt for LLM
function buildPrompt(request: LLMRequest): ChatMessage[] {
  const systemPrompt = `You are an expert psychological interpreter. Your task is to create a deeply personal, psychologically insightful reading based on astrological data.

CRITICAL RULES:
1. NEVER use astrological terms (planets, signs, aspects, houses, transits, etc.) in your output
2. NEVER use generic AI phrases like "embrace your journey" or "unlock your potential"
3. ONLY use the provided interpretation material - do not invent or add information
4. Maximum 20 words per sentence
5. Be specific and concrete, not abstract
6. Write in second person ("you")
7. Be empathetic but direct

OUTPUT STRUCTURE:
You must produce exactly 6 sections with these exact headers:
1. YOUR CORE PATTERN
2. HOW YOU BUILD CONNECTION
3. WHAT TRIGGERS YOUR PROTECTION MODE
4. WHAT'S ACTIVE RIGHT NOW
5. THIS WEEK — DON'T DO THIS
6. THIS WEEK — DO THIS INSTEAD

Each section should be 2-4 sentences.`;

  const userPrompt = `Create a personalized reading for someone seeking ${request.focusArea === 'relationship' ? 'relationship insights' : 'self-awareness'}.

INTERPRETATION ENTRIES:
${request.interpretationEntries.map(e => `- ${e.title}: ${e.short_line}\n  Profile: ${e.psychological_profile}`).join('\n')}

THEME SCORES (0-10 scale):
${Object.entries(request.themeScores).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

LANGUAGE SENTENCES (use these phrases):
${request.languageSentences.map(s => `- [${s.theme}/${s.subtype}]: ${s.sentence}`).join('\n')}

${request.combinationRules.length > 0 ? `SPECIAL PATTERNS:\n${request.combinationRules.map(r => `- ${r.rule_name}: ${r.narrative_template}`).join('\n')}` : ''}

${request.userContext ? `USER CONTEXT: ${request.userContext}` : ''}

Generate the 6-section reading now. Respond with valid JSON:
{"sections":{"core_pattern":"...","connection_style":"...","protection_mode":"...","current_transits":"...","avoid_this_week":"...","do_this_week":"..."}}`;

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];
}

// Call DashScope API (GLM-5)
export async function generateReading(request: LLMRequest): Promise<ReadingOutput> {
  if (!DASHSCOPE_API_KEY) {
    console.warn('DASHSCOPE_API_KEY not set, using mock response');
    return getMockReading();
  }

  const messages = buildPrompt(request);

  try {
    const response = await fetch(`${DASHSCOPE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'glm-4', // Using GLM-4 as GLM-5 might not be available
        messages,
        max_tokens: 2048,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LLM API error:', errorText);
      return getMockReading();
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('No content in LLM response');
      return getMockReading();
    }

    // Parse JSON from response
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.sections) {
          return parsed.sections;
        }
      }
    } catch (parseError) {
      console.error('Failed to parse LLM response as JSON:', parseError);
    }

    // Fallback: parse sections from text
    return parseSectionsFromText(content);
  } catch (error) {
    console.error('LLM request failed:', error);
    return getMockReading();
  }
}

// Parse sections from text response
function parseSectionsFromText(text: string): ReadingOutput {
  const sections: ReadingOutput = {
    core_pattern: '',
    connection_style: '',
    protection_mode: '',
    current_transits: '',
    avoid_this_week: '',
    do_this_week: '',
  };

  const sectionMap: Record<string, keyof ReadingOutput> = {
    'YOUR CORE PATTERN': 'core_pattern',
    'HOW YOU BUILD CONNECTION': 'connection_style',
    'WHAT TRIGGERS YOUR PROTECTION MODE': 'protection_mode',
    "WHAT'S ACTIVE RIGHT NOW": 'current_transits',
    'THIS WEEK — DON\'T DO THIS': 'avoid_this_week',
    'THIS WEEK — DO THIS INSTEAD': 'do_this_week',
  };

  let currentSection: keyof ReadingOutput | null = null;
  const lines = text.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    for (const [header, key] of Object.entries(sectionMap)) {
      if (trimmed.toUpperCase().includes(header.toUpperCase())) {
        currentSection = key;
        break;
      }
    }

    if (currentSection && !trimmed.match(/^[A-Z\s—']+$/)) {
      sections[currentSection] += (sections[currentSection] ? ' ' : '') + trimmed;
    }
  }

  return sections;
}

// Mock reading for development
function getMockReading(): ReadingOutput {
  return {
    core_pattern: 'You move through life with intention, even when the path isn\'t clear. Your core operates on instinct more than analysis.',
    connection_style: 'You build trust slowly, through small moments of consistency. Connection for you isn\'t about intensity—it\'s about reliability.',
    protection_mode: 'When you feel unseen, you withdraw. It\'s not punishment for others—it\'s preservation of self.',
    current_transits: 'A period of reassessment is underway. Old patterns are surfacing not to hurt you, but to be released.',
    avoid_this_week: 'Don\'t make major decisions from a place of doubt. The discomfort you feel is temporary, not a sign to act.',
    do_this_week: 'Take one small action that honors your needs without explanation. You don\'t owe anyone the reasoning behind your boundaries.',
  };
}