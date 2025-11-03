const DEFAULT_BASE_URL = 'https://jhuangnyc.com';

function resolveBaseUrl() {
  const candidate = process.env.NEXT_PUBLIC_BASE_URL || DEFAULT_BASE_URL;

  try {
    return new URL(candidate);
  } catch {
    return new URL(DEFAULT_BASE_URL);
  }
}

export const siteMetadata = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'Jhuangnyc',
  title: 'Jhuangnyc - Crypto Mining Hardware Store',
  description:
    'Premium mining hardware with crypto payment support. ASIC products, GPU rigs, and enterprise solutions.',
  locale: 'en_US',
  siteName: 'Jhuangnyc',
  keywords: [
    'crypto mining hardware',
    'ASIC products',
    'GPU mining rigs',
    'bitcoin products',
    'crypto payments',
  ],
  category: 'Technology',
  baseUrl: resolveBaseUrl(),
  creator: 'MineHub',
  publisher: 'MineHub',
  twitterHandle: '@jhuangnyc',
};
