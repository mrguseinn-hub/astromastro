import { supabaseAdmin } from '@/lib/db/supabase';
import { LanguageBankList } from './LanguageBankList';

export default async function LanguageBankPage() {
  const admin = supabaseAdmin();

  const { data: sentences } = await admin
    .from('language_bank')
    .select('*')
    .order('theme')
    .order('subtype');

  return (
    <div>
      <h1 className="text-2xl font-serif mb-6">Language Bank</h1>
      <LanguageBankList initialSentences={sentences || []} />
    </div>
  );
}