import { supabaseAdmin } from '@/lib/db/supabase';
import { RulesList } from './RulesList';

export default async function RulesPage() {
  const admin = supabaseAdmin();

  const { data: rules } = await admin
    .from('combination_rules')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-serif mb-6">Combination Rules</h1>
      <RulesList initialRules={rules || []} />
    </div>
  );
}