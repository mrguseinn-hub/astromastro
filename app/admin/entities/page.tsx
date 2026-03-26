import { supabaseAdmin } from '@/lib/db/supabase';
import { EntitiesList } from './EntitiesList';

export default async function EntitiesPage() {
  const admin = supabaseAdmin();

  const { data: entities } = await admin
    .from('astro_entities')
    .select('*')
    .order('type')
    .order('name');

  return (
    <div>
      <h1 className="text-2xl font-serif mb-6">Astro Entities</h1>
      <EntitiesList initialEntities={entities || []} />
    </div>
  );
}