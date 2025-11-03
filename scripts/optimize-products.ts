import * as fs from 'fs';
import * as path from 'path';
import { logger } from '@/lib/utils/logger';

interface ProductJSON {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  vendor: string;
  product_type: string;
  tags: string[];
  variants: Array<{
    price: string;
    sku: string;
  }>;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function extractSpecs(bodyHtml: string): Record<string, string> {
  const specs: Record<string, string> = {};

  // Extract hash rate
  const hashMatch = bodyHtml.match(/(\d+\.?\d*)\s*(TH?\/s|GH?\/s|MH?\/s)/i);
  if (hashMatch) specs.hashRate = hashMatch[0];

  // Extract power consumption
  const powerMatch = bodyHtml.match(/(\d+\.?\d*)\s*W(?:att)?s?/i);
  if (powerMatch) specs.power = powerMatch[0];

  // Extract efficiency
  const effMatch = bodyHtml.match(/(\d+\.?\d*)\s*[JW]\/T?H/i);
  if (effMatch) specs.efficiency = effMatch[0];

  // Extract voltage
  const voltMatch = bodyHtml.match(/(\d+-\d+V)/i);
  if (voltMatch) specs.voltage = voltMatch[0];

  return specs;
}

function optimizeTitle(product: ProductJSON): string {
  const specs = extractSpecs(product.body_html);
  const originalTitle = product.title;

  // Extract model name
  let modelMatch = originalTitle.match(
    /(Antminer|Whatsminer)\s+(S\d+\w*|L\d+|T\d+|M\d+|KA\d+|E\d+)/i
  );
  if (!modelMatch) {
    modelMatch = originalTitle.match(/(Antminer|Whatsminer)\s+\w+\s+\w+/i);
  }

  const model = modelMatch ? modelMatch[0] : 'ASIC Miner';
  const hashRate = specs.hashRate || '';
  const power = specs.power || '';
  const brand = originalTitle.includes('Bitmain') ? 'Bitmain' : '';

  // Determine coin type
  let coinType = '';
  if (originalTitle.match(/bitcoin|btc/i)) coinType = 'Bitcoin';
  else if (originalTitle.match(/litecoin|ltc/i)) coinType = 'Litecoin';
  else if (originalTitle.match(/dogecoin|doge/i)) coinType = 'Dogecoin';
  else if (originalTitle.match(/kadena|kda/i)) coinType = 'Kadena';
  else if (originalTitle.match(/ethereum|eth|etc/i))
    coinType = 'Ethereum Classic';

  // Build optimized title
  const parts: string[] = [];

  if (brand) parts.push(brand);
  parts.push(model);
  if (hashRate) parts.push(hashRate);
  if (coinType) parts.push(coinType + ' Miner');
  else parts.push('ASIC Miner');

  // Add key features
  if (power) parts.push(`${power}`);
  if (originalTitle.match(/PSU|Power Supply/i)) parts.push('with PSU');

  return parts.join(' ');
}

function optimizeHandle(title: string): string {
  // Create a clean, SEO-friendly URL
  return slugify(title).replace(/\s+/g, '-').substring(0, 100); // Keep handles reasonable length
}

function cleanDescription(bodyHtml: string): string {
  // Remove excessive HTML and clean up description
  let cleaned = bodyHtml
    .replace(/<p><b>Brand:<\/b>.*?<\/p>/gi, '')
    .replace(/<p><b>Binding:<\/b>.*?<\/p>/gi, '')
    .replace(/<p><b>EAN:<\/b>.*?<\/p>/gi, '')
    .replace(/<p><b>Package Dimensions:<\/b>.*?<\/p>/gi, '')
    .replace(/\\u[\da-f]{4}/gi, (match) => {
      return String.fromCharCode(parseInt(match.replace('\\u', ''), 16));
    });

  // Remove excessive promotional text
  cleaned = cleaned.replace(/important.*?restocking.*?fee.*?<\/li>/gi, '');
  cleaned = cleaned.replace(/buy with confidence/gi, '');
  cleaned = cleaned.replace(
    /much cheaper than/gi,
    'Competitive alternative to'
  );
  cleaned = cleaned.replace(/much better than/gi, 'Superior performance to');

  return cleaned;
}

function generateMetaDescription(title: string, bodyHtml: string): string {
  const specs = extractSpecs(bodyHtml);
  const parts: string[] = [];

  parts.push(title + '.');
  if (specs.hashRate) parts.push(`Hash rate: ${specs.hashRate}.`);
  if (specs.efficiency) parts.push(`Efficiency: ${specs.efficiency}.`);
  if (bodyHtml.match(/PSU|Power Supply/i)) parts.push('Includes power supply.');
  parts.push('Professional cryptocurrency mining hardware.');

  return parts.join(' ').substring(0, 160);
}

function optimizeProduct(product: ProductJSON): ProductJSON {
  const optimizedTitle = optimizeTitle(product);
  const optimizedHandle = optimizeHandle(optimizedTitle);
  const cleanedDescription = cleanDescription(product.body_html);

  return {
    ...product,
    title: optimizedTitle,
    handle: optimizedHandle,
    body_html: cleanedDescription,
  };
}

async function main() {
  const jsonDir = path.join(process.cwd(), 'lib/data/json');
  const outputDir = path.join(process.cwd(), 'lib/data/json-optimized');

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Read all JSON files
  const files = fs.readdirSync(jsonDir).filter((f) => f.endsWith('.json'));

  logger.audit(`Found ${files.length} product files to optimize\n`);

  for (const file of files) {
    const filePath = path.join(jsonDir, file);
    const product: ProductJSON = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    logger.audit(`Original: ${product.title}`);

    const optimized = optimizeProduct(product);

    logger.audit(`Optimized: ${optimized.title}`);
    logger.audit(`Handle: ${optimized.handle}`);
    logger.audit(
      `Meta: ${generateMetaDescription(optimized.title, optimized.body_html)}`
    );
    logger.audit('---');

    // Write optimized version
    const outputPath = path.join(outputDir, file);
    fs.writeFileSync(outputPath, JSON.stringify(optimized, null, 2));
  }

  logger.audit(`\n✅ Optimized ${files.length} products`);
  logger.audit(`Output directory: ${outputDir}`);
}

main().catch((error) => {
  logger.error('optimize-products script failed', error as Error);
  process.exit(1);
});
