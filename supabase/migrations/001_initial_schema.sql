-- Personal Insight Engine - Initial Schema
-- Created: 2026-03-26

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. ASTRO_ENTITIES
-- Placement/aspect definitions with base meanings
-- ============================================
CREATE TABLE astro_entities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type VARCHAR(50) NOT NULL, -- 'planet', 'sign', 'house', 'aspect'
  entity_code VARCHAR(50) NOT NULL, -- e.g., 'sun', 'aries', 'house_1', 'conjunction'
  display_name VARCHAR(100) NOT NULL,
  base_theme VARCHAR(50), -- related theme key
  keywords JSONB DEFAULT '[]'::jsonb, -- ["identity", "ego", "self-expression"]
  element VARCHAR(20), -- fire, earth, air, water
  quality VARCHAR(20), -- cardinal, fixed, mutable
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entity_type, entity_code)
);

-- ============================================
-- 2. INTERPRETATION_ENTRIES
-- Expert knowledge base for specific placements/aspects
-- ============================================
CREATE TABLE interpretation_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_code VARCHAR(100) NOT NULL, -- e.g., 'sun_in_aries', 'moon_square_venus'
  title VARCHAR(200) NOT NULL,
  short_line TEXT, -- One-line summary (max 20 words)
  psychological_profile TEXT, -- Deep psychological interpretation
  behavioral_patterns JSONB DEFAULT '[]'::jsonb, -- ["pattern1", "pattern2"]
  trigger_conditions JSONB DEFAULT '[]'::jsonb, -- What triggers this pattern
  growth_edge TEXT, -- Growth opportunity
  shadow_aspect TEXT, -- Shadow side of this placement
  scoring_contributions JSONB DEFAULT '{}'::jsonb, -- {"emotional_intensity": 2, "guardedness": -1}
  human_line TEXT, -- Human-crafted sentence for output
  focus_area VARCHAR(50), -- 'relationship', 'self_awareness', 'both'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_interpretation_entity_code ON interpretation_entries(entity_code);
CREATE INDEX idx_interpretation_focus_area ON interpretation_entries(focus_area);

-- ============================================
-- 3. LANGUAGE_BANK
-- Human-language sentence library
-- ============================================
CREATE TABLE language_bank (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  theme VARCHAR(50) NOT NULL, -- emotional_intensity, guardedness, etc.
  subtype VARCHAR(50), -- 'high', 'medium', 'low', 'trigger', 'growth'
  sentence TEXT NOT NULL,
  word_count INT,
  tone VARCHAR(20) DEFAULT 'empathetic', -- empathetic, direct, gentle
  context_tag VARCHAR(50), -- For filtering
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_language_theme ON language_bank(theme);
CREATE INDEX idx_language_subtype ON language_bank(subtype);

-- ============================================
-- 4. COMBINATION_RULES
-- Narrative combinations for multi-entity patterns
-- ============================================
CREATE TABLE combination_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_name VARCHAR(100) NOT NULL,
  description TEXT,
  conditions JSONB NOT NULL, -- {"entity_codes": ["sun_in_aries", "moon_in_scorpio"], "min_score": 5}
  narrative_template TEXT, -- Template with placeholders
  output_section VARCHAR(100), -- Which section this applies to
  priority INT DEFAULT 0, -- Higher = processed first
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. OUTPUT_TEMPLATES
-- Reading structure templates
-- ============================================
CREATE TABLE output_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_key VARCHAR(50) NOT NULL, -- 'core_pattern', 'connection_style', etc.
  section_title VARCHAR(100) NOT NULL,
  description TEXT,
  content_guidelines JSONB, -- Rules for this section
  ordering INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. READINGS
-- Generated user readings
-- ============================================
CREATE TABLE readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  birth_date DATE NOT NULL,
  birth_time TIME,
  birth_location JSONB NOT NULL, -- {"city": "Baku", "lat": 40.4093, "lng": 49.8671}
  focus_area VARCHAR(50) NOT NULL,
  user_context TEXT, -- Optional context from user
  natal_chart JSONB, -- Calculated chart data
  transits JSONB, -- Current transits
  theme_scores JSONB, -- Final theme scores
  matched_entities JSONB, -- Entity codes matched
  output JSONB, -- Generated reading content
  pdf_url TEXT, -- URL to generated PDF
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_readings_created_at ON readings(created_at DESC);

-- ============================================
-- 7. ADMIN USERS
-- Managed via Supabase Auth
-- ============================================
CREATE TABLE admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on admin_profiles
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own profile
CREATE POLICY "Users can view own profile" ON admin_profiles
  FOR SELECT USING (auth.uid() = id);

-- ============================================
-- SEED DATA: Output Templates
-- ============================================
INSERT INTO output_templates (section_key, section_title, description, ordering) VALUES
('core_pattern', 'YOUR CORE PATTERN', 'Fundamental psychological makeup', 1),
('connection_style', 'HOW YOU BUILD CONNECTION', 'Relationship and attachment patterns', 2),
('protection_mode', 'WHAT TRIGGERS YOUR PROTECTION MODE', 'Defense mechanisms and triggers', 3),
('current_transits', 'WHAT''S ACTIVE RIGHT NOW', 'Current astrological influences', 4),
('avoid_this_week', 'THIS WEEK — DON''T DO THIS', 'What to avoid', 5),
('do_this_week', 'THIS WEEK — DO THIS INSTEAD', 'Positive actions to take', 6);

-- ============================================
-- SEED DATA: Sample Astro Entities
-- ============================================
INSERT INTO astro_entities (entity_type, entity_code, display_name, base_theme, element, quality) VALUES
('planet', 'sun', 'Sun', 'identity', NULL, NULL),
('planet', 'moon', 'Moon', 'emotional_intensity', NULL, NULL),
('planet', 'mercury', 'Mercury', 'communication_style', NULL, NULL),
('planet', 'venus', 'Venus', 'relationship_capacity', NULL, NULL),
('planet', 'mars', 'Mars', 'action_orientation', NULL, NULL),
('sign', 'aries', 'Aries', 'action_orientation', 'fire', 'cardinal'),
('sign', 'taurus', 'Taurus', 'stability_seeking', 'earth', 'fixed'),
('sign', 'gemini', 'Gemini', 'intellectual_engagement', 'air', 'mutable'),
('sign', 'cancer', 'Cancer', 'emotional_intensity', 'water', 'cardinal'),
('sign', 'leo', 'Leo', 'identity', 'fire', 'fixed'),
('sign', 'virgo', 'Virgo', 'practical_expression', 'earth', 'mutable'),
('sign', 'libra', 'Libra', 'relationship_capacity', 'air', 'cardinal'),
('sign', 'scorpio', 'Scorpio', 'emotional_intensity', 'water', 'fixed'),
('sign', 'sagittarius', 'Sagittarius', 'intellectual_engagement', 'fire', 'mutable'),
('sign', 'capricorn', 'Capricorn', 'practical_expression', 'earth', 'cardinal'),
('sign', 'aquarius', 'Aquarius', 'intellectual_engagement', 'air', 'fixed'),
('sign', 'pisces', 'Pisces', 'emotional_intensity', 'water', 'mutable'),
('aspect', 'conjunction', 'Conjunction', NULL, NULL, NULL),
('aspect', 'opposition', 'Opposition', NULL, NULL, NULL),
('aspect', 'trine', 'Trine', NULL, NULL, NULL),
('aspect', 'square', 'Square', NULL, NULL, NULL),
('aspect', 'sextile', 'Sextile', NULL, NULL, NULL);

-- ============================================
-- SEED DATA: Sample Interpretation Entries
-- ============================================
INSERT INTO interpretation_entries (entity_code, title, short_line, psychological_profile, scoring_contributions, focus_area) VALUES
('sun_in_aries', 'Sun in Aries', 'You move before you think, and that''s your gift.',
 'Your sense of self is tied to action. You discover who you are through doing, trying, and sometimes failing. Identity is not a concept for you—it''s an act of courage.',
 '{"action_orientation": 3, "identity": 3, "guardedness": -1}',
 'both'),
('moon_in_scorpio', 'Moon in Scorpio', 'Your feelings run deeper than you show.',
 'Your emotional world is intensely private. You feel everything at maximum depth but rarely let others see the full picture. Trust is earned slowly, through tests others don''t even know they''re taking.',
 '{"emotional_intensity": 3, "guardedness": 2, "trust_sensitivity": 2}',
 'both'),
('venus_square_mars', 'Venus Square Mars', 'Your desires and values often pull in different directions.',
 'There''s a tension between what you want and what you value. This creates passion but also internal conflict in relationships. Learning to honor both is your journey.',
 '{"relationship_tension": 2, "passion": 2, "inner_conflict": 2}',
 'relationship'),
('moon_conjunction_venus', 'Moon Conjunct Venus', 'Your heart and your needs speak the same language.',
 'Your emotional nature and capacity for love are deeply integrated. You seek harmony and beauty in your emotional life. Relationships feel natural when they honor both.',
 '{"relationship_capacity": 3, "emotional_harmony": 2, "receptivity": 2}',
 'relationship'),
('sun_square_saturn', 'Sun Square Saturn', 'You carry a heavy sense of expectation, often from yourself.',
 'There''s a strict inner voice that questions your worth. Achievement feels necessary for self-acceptance. Learning to be enough without proving is your growth edge.',
 '{"self_critical_tendency": 2, "responsibility": 2, "authenticity_tension": 1}',
 'self_awareness');

-- ============================================
-- SEED DATA: Sample Language Bank
-- ============================================
INSERT INTO language_bank (theme, subtype, sentence, word_count) VALUES
('emotional_intensity', 'high', 'Your feelings arrive like waves—sometimes gentle, sometimes overwhelming.', 10),
('emotional_intensity', 'medium', 'You process emotions steadily, neither suppressing nor drowning in them.', 9),
('emotional_intensity', 'low', 'Your emotional responses tend to be measured and predictable.', 8),
('guardedness', 'high', 'Your inner world has walls. Not everyone gets a key.', 9),
('guardedness', 'medium', 'You share selectively, testing the waters before diving in.', 9),
('guardedness', 'low', 'Your heart stays open, even when it''s been hurt before.', 9),
('trust_sensitivity', 'high', 'Trust, for you, is built in moments, not declared.', 8),
('trust_sensitivity', 'medium', 'You give trust conditionally, with room to adjust.', 8),
('relationship_capacity', 'high', 'Connection feels like breathing—natural and necessary.', 8),
('relationship_capacity', 'medium', 'You seek meaningful bonds, but on your own terms.', 9),
('action_orientation', 'high', 'When you know, you move. Thinking comes after.', 8),
('action_orientation', 'medium', 'You pause, consider, then act with intention.', 7),
('intellectual_engagement', 'high', 'Your mind needs stimulation the way your body needs food.', 10),
('intellectual_engagement', 'medium', 'You enjoy ideas, especially when they connect to something real.', 10),
('stability_seeking', 'high', 'Predictability isn''t boring to you—it''s safety.', 8),
('stability_seeking', 'medium', 'You appreciate routine, with room for surprises.', 8);

-- ============================================
-- SEED DATA: Sample Combination Rules
-- ============================================
INSERT INTO combination_rules (rule_name, description, conditions, narrative_template, output_section, priority) VALUES
('Intense Emotional Core', 'Combines Moon in water signs with high emotional intensity score',
 '{"entity_codes": ["moon_in_cancer", "moon_in_scorpio", "moon_in_pisces"], "min_score": {"emotional_intensity": 6}}',
 'Your emotional world is vast and layered. What others see is just the surface.',
 'core_pattern',
 10),
('Guarded Heart', 'High guardedness with trust sensitivity',
 '{"min_score": {"guardedness": 7, "trust_sensitivity": 7}}',
 'You''ve learned that protection isn''t the same as closing off.',
 'protection_mode',
 8);

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;