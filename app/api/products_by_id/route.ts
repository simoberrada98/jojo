import { NextResponse, type NextRequest } from "next/server";
import { logger } from "@/lib/utils/logger";
import {
  searchProducts as localSearch,
  findProductById,
  findProductByHandle,
  findProductsByIds,
} from "@/lib/data/local-product-store";

export const revalidate = 60;

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const params = url.searchParams;

  const id = params.get("id") || undefined;
  const handle = params.get("handle") || undefined;
  const idsParam = params.get("ids") || undefined;
  const q = params.get("q") || params.get("search") || "";
  const limit = Math.min(Math.max(Number(params.get("limit")) || 20, 1), 100);
  const offset = Math.max(Number(params.get("offset")) || 0, 0);

  try {
    // Single product by handle (SEO-friendly)
    if (handle) {
logger?.api?.("GET", "/api/products_by_id");
      const product = await findProductByHandle(handle);
      if (!product) {
        return NextResponse.json({ error: "Not Found" }, { status: 404 });
      }
      const res = NextResponse.json(product);
      res.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
      return res;
    }

    // Single product by ID
    if (id) {
logger?.api?.("GET", "/api/products_by_id");
      const product = await findProductById(id);
      if (!product) {
        return NextResponse.json({ error: "Not Found" }, { status: 404 });
      }
      const res = NextResponse.json(product);
      res.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
      return res;
    }

    // Multiple products by IDs (comma-separated)
    if (idsParam) {
      const ids = idsParam.split(",").map((s) => s.trim()).filter(Boolean);
logger?.api?.("GET", "/api/products_by_id");
      const products = await findProductsByIds(ids);
      const res = NextResponse.json(products);
      res.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
      return res;
    }

    // Search/paginate products
logger?.api?.("GET", "/api/products_by_id");
    const { results, total } = await localSearch({ q, limit, offset });

    const payload = {
      total,
      offset,
      limit,
      results,
      hasMore: offset + limit < total,
    };

    const res = NextResponse.json(payload);
    res.headers.set("Cache-Control", "public, s-maxage=120, stale-while-revalidate=600");
    return res;
  } catch (error) {
    const isTimeout = error instanceof Error && /timed out/i.test(error.message);
    const status = isTimeout ? 504 : 500;
    logger?.error?.("/api/products_by_id failure", error, { id, q, limit, offset });
    return NextResponse.json(
      {
        error: isTimeout ? "Request timed out" : "Internal Server Error",
        total: 0,
        offset: 0,
        limit: 0,
        results: [],
        hasMore: false,
      },
      { status }
    );
  }
}
