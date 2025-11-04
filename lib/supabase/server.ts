import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return (cookieStore as any).getAll();
        },
        setAll: (
          cookiesToSet: Array<{
            name: string;
            value: string;
            options: CookieOptions;
          }>
        ) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (cookieStore as any).set(name, value, options);
          });
        },
      },
    }
  );
}
