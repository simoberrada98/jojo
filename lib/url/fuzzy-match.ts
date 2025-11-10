import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/supabase.types';
import { SupabaseClient } from '@supabase/supabase-js';

type Product = Database['public']['Tables']['products']['Row'];
interface FuzzyMatchResult {
  matchedSlug: string | null;
  score: number;
}

interface ScoredMatch {
  slug: string;
  score: number;
}

/**
 * Find the best matching product slug using fuzzy matching
 */
export async function findBestMatchingProduct(slug: string): Promise<FuzzyMatchResult | null> {
  const supabase: SupabaseClient<Database> = await createClient();
  
  // First try exact match (case insensitive)
  const { data: exactMatch } = await supabase
    .from('products')
    .select('slug')
    .ilike('slug', slug)
    .eq('is_active', true)
    .eq('is_archived', false)
    .single();

  if (exactMatch) {
    return { matchedSlug: exactMatch.slug, score: 1 };
  }

  // If no exact match, try fuzzy matching
  const { data: allProducts } = await supabase
    .from('products')
    .select('slug')
    .eq('is_active', true)
    .eq('is_archived', false);

  if (!allProducts?.length) return null;

  // Simple fuzzy matching - you might want to use a more sophisticated algorithm
  const normalizedSlug = slug.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  const matches = (allProducts || [])
    .map((product: { slug: string }) => {
      const productSlug = product.slug.toLowerCase().replace(/[^a-z0-9]/g, '');
      let score = 0;
      
      // Simple scoring: count matching character sequences
      for (let i = 0; i < normalizedSlug.length; i++) {
        if (productSlug.includes(normalizedSlug[i])) {
          score++;
        }
      }
      
      // Normalize score to 0-1 range
      return {
        slug: product.slug,
        score: score / Math.max(normalizedSlug.length, productSlug.length)
      };
    })
    .filter((match: ScoredMatch) => match.score > 0.5) // Only consider matches with >50% similarity
    .sort((a: ScoredMatch, b: ScoredMatch) => b.score - a.score) as ScoredMatch[];

  return matches.length > 0 
    ? { matchedSlug: matches[0].slug, score: matches[0].score }
    : null;
}
