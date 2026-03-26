import { supabaseAdmin } from '@/lib/db/supabase';
import { InterpretationsList } from './InterpretationsList';

export default async function InterpretationsPage() {
  const admin = supabaseAdmin();

  const { data: interpretations } = await admin
    .from('interpretation_entries')
    .select('*')
    .order('created_at', { ascending: false });

  const { data: entities } = await admin
    .from('astro_entities')
    .select('code, name, type')
    .order('name');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif">Interpretation Entries</h1>
        <InterpretationsList
          initialInterpretations={interpretations || []}
          entities={entities || []}
        />
      </div>
    </div>
  );
}