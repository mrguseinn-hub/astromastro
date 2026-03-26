// Birth Data Input
export interface BirthData {
  date: Date;
  time: string; // HH:MM format
  location: Location;
  focusArea: 'relationship' | 'self_awareness';
  context?: string; // Optional user context (max 200 chars)
}

export interface Location {
  city: string;
  lat: number;
  lng: number;
}

// Natal Chart
export interface NatalChart {
  planets: PlanetPosition[];
  houses: HousePlacement[];
  aspects: Aspect[];
  ascendant: SignInfo;
}

export interface PlanetPosition {
  name: string;
  sign: string;
  degree: number;
  house: number;
  retrograde: boolean;
}

export interface HousePlacement {
  number: number;
  sign: string;
  degree: number;
}

export interface Aspect {
  planet1: string;
  planet2: string;
  type: string; // conjunction, opposition, trine, square, sextile
  orb: number;
  applying: boolean;
}

export interface SignInfo {
  sign: string;
  degree: number;
}

// Transits
export interface Transit {
  transitingPlanet: string;
  natalPoint: string;
  aspectType: string;
  orb: number;
  exactDate?: Date;
}

// Theme Scores
export interface ThemeScores {
  emotional_intensity: number;
  guardedness: number;
  trust_sensitivity: number;
  relationship_capacity: number;
  action_orientation: number;
  intellectual_engagement: number;
  stability_seeking: number;
  practical_expression: number;
  communication_style: number;
  identity: number;
}

// Database Types
export interface AstroEntity {
  id: string;
  entity_type: 'planet' | 'sign' | 'house' | 'aspect';
  entity_code: string;
  display_name: string;
  base_theme: string | null;
  keywords: string[];
  element: 'fire' | 'earth' | 'air' | 'water' | null;
  quality: 'cardinal' | 'fixed' | 'mutable' | null;
}

export interface InterpretationEntry {
  id: string;
  entity_code: string;
  title: string;
  short_line: string | null;
  psychological_profile: string | null;
  behavioral_patterns: string[];
  trigger_conditions: string[];
  growth_edge: string | null;
  shadow_aspect: string | null;
  scoring_contributions: Partial<ThemeScores>;
  human_line: string | null;
  focus_area: 'relationship' | 'self_awareness' | 'both';
}

export interface LanguageBankEntry {
  id: string;
  theme: keyof ThemeScores;
  subtype: 'high' | 'medium' | 'low' | 'trigger' | 'growth';
  sentence: string;
  word_count: number;
  tone: 'empathetic' | 'direct' | 'gentle';
}

export interface CombinationRule {
  id: string;
  rule_name: string;
  description: string | null;
  conditions: {
    entity_codes?: string[];
    min_score?: Partial<ThemeScores>;
  };
  narrative_template: string | null;
  output_section: string;
  priority: number;
}

export interface OutputTemplate {
  id: string;
  section_key: string;
  section_title: string;
  description: string | null;
  ordering: number;
}

export interface Reading {
  id: string;
  birth_date: string;
  birth_time: string | null;
  birth_location: Location;
  focus_area: 'relationship' | 'self_awareness';
  user_context: string | null;
  natal_chart: NatalChart | null;
  transits: Transit[] | null;
  theme_scores: ThemeScores | null;
  matched_entities: string[] | null;
  output: ReadingOutput | null;
  pdf_url: string | null;
  created_at: string;
}

export interface ReadingOutput {
  core_pattern: string;
  connection_style: string;
  protection_mode: string;
  current_transits: string;
  avoid_this_week: string;
  do_this_week: string;
}

// LLM Request/Response
export interface LLMRequest {
  interpretationEntries: InterpretationEntry[];
  languageSentences: LanguageBankEntry[];
  themeScores: ThemeScores;
  combinationRules: CombinationRule[];
  userContext?: string;
  focusArea: 'relationship' | 'self_awareness';
}

export interface LLMResponse {
  sections: ReadingOutput;
}