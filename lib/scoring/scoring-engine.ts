import { NatalChart, Transit, ThemeScores, InterpretationEntry, CombinationRule } from '@/types';
import { supabaseAdmin } from '@/lib/db/supabase';

// Default theme scores
const DEFAULT_SCORES: ThemeScores = {
  emotional_intensity: 5,
  guardedness: 5,
  trust_sensitivity: 5,
  relationship_capacity: 5,
  action_orientation: 5,
  intellectual_engagement: 5,
  stability_seeking: 5,
  practical_expression: 5,
  communication_style: 5,
  identity: 5,
};

// Entity code generators
function getPlacementCode(planet: string, sign: string): string {
  return `${planet}_in_${sign}`.toLowerCase();
}

function getAspectCode(planet1: string, planet2: string, aspectType: string): string {
  const sorted = [planet1, planet2].sort();
  return `${sorted[0]}_${aspectType}_${sorted[1]}`.toLowerCase();
}

// Extract entity codes from natal chart
export function extractEntityCodes(natalChart: NatalChart): string[] {
  const codes: string[] = [];

  // Planet placements
  for (const planet of natalChart.planets) {
    codes.push(getPlacementCode(planet.name, planet.sign));
  }

  // Aspects
  for (const aspect of natalChart.aspects) {
    codes.push(getAspectCode(aspect.planet1, aspect.planet2, aspect.type));
  }

  // Ascendant
  codes.push(`ascendant_in_${natalChart.ascendant.sign}`.toLowerCase());

  return codes;
}

// Fetch interpretation entries for matched entities
export async function getInterpretationEntries(entityCodes: string[]): Promise<InterpretationEntry[]> {
  const admin = supabaseAdmin();

  const { data, error } = await admin
    .from('interpretation_entries')
    .select('*')
    .in('entity_code', entityCodes);

  if (error) {
    console.error('Error fetching interpretation entries:', error);
    return [];
  }

  return data || [];
}

// Fetch combination rules
export async function getCombinationRules(): Promise<CombinationRule[]> {
  const admin = supabaseAdmin();

  const { data, error } = await admin
    .from('combination_rules')
    .select('*')
    .order('priority', { ascending: false });

  if (error) {
    console.error('Error fetching combination rules:', error);
    return [];
  }

  return data || [];
}

// Calculate theme scores from interpretations
export function calculateThemeScores(
  interpretations: InterpretationEntry[],
  baseScores: ThemeScores = DEFAULT_SCORES
): ThemeScores {
  const scores = { ...baseScores };

  for (const entry of interpretations) {
    const contributions = entry.scoring_contributions;

    for (const [theme, value] of Object.entries(contributions)) {
      if (theme in scores && typeof value === 'number') {
        scores[theme as keyof ThemeScores] += value;
      }
    }
  }

  // Clamp scores to 0-10 range
  for (const key of Object.keys(scores) as (keyof ThemeScores)[]) {
    scores[key] = Math.max(0, Math.min(10, scores[key]));
  }

  return scores;
}

// Get applicable combination rules
export function getApplicableRules(
  rules: CombinationRule[],
  entityCodes: string[],
  themeScores: ThemeScores
): CombinationRule[] {
  return rules.filter((rule) => {
    const conditions = rule.conditions;

    // Check entity codes match
    if (conditions.entity_codes && conditions.entity_codes.length > 0) {
      const hasMatch = conditions.entity_codes.some((code) =>
        entityCodes.includes(code)
      );
      if (!hasMatch) return false;
    }

    // Check min scores
    if (conditions.min_score) {
      for (const [theme, minValue] of Object.entries(conditions.min_score)) {
        if (
          theme in themeScores &&
          themeScores[theme as keyof ThemeScores] < (minValue as number)
        ) {
          return false;
        }
      }
    }

    return true;
  });
}

// Main scoring function
export async function runScoringEngine(
  natalChart: NatalChart,
  _transits: Transit[]
): Promise<{
  entityCodes: string[];
  interpretations: InterpretationEntry[];
  themeScores: ThemeScores;
  applicableRules: CombinationRule[];
}> {
  // Extract entity codes
  const entityCodes = extractEntityCodes(natalChart);

  // Fetch interpretations
  const interpretations = await getInterpretationEntries(entityCodes);

  // Calculate theme scores
  const themeScores = calculateThemeScores(interpretations);

  // Get combination rules
  const rules = await getCombinationRules();

  // Filter applicable rules
  const applicableRules = getApplicableRules(rules, entityCodes, themeScores);

  return {
    entityCodes,
    interpretations,
    themeScores,
    applicableRules,
  };
}