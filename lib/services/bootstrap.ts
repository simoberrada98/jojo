/**
 * Service Bootstrap
 * Register all services in the container
 */

import { container, Services } from "./ServiceContainer";
import { PricingService } from "./pricing.service";
import { createPaymentStorage } from "./payment-storage.service";
import { createPaymentDbService } from "./payment-db.service";
import { supabaseConfig } from "@/lib/supabase/config";

/**
 * Initialize and register all services
 */
export function bootstrapServices() {
  // Register PricingService (static class, register the class itself)
  container.instance(Services.PRICING, PricingService);

  // Register PaymentStorageService factory
  container.register(
    Services.PAYMENT_STORAGE,
    () => createPaymentStorage(),
    true // singleton
  );

  // Register PaymentDatabaseService factory
  container.register(
    Services.PAYMENT_DB,
    () => {
      try {
        return createPaymentDbService(
          supabaseConfig.url,
          supabaseConfig.serviceRoleKey
        );
      } catch (error) {
        console.warn("PaymentDatabaseService not available:", error);
        return null;
      }
    },
    true
  );
}

/**
 * Reset services (useful for testing)
 */
export function resetServices() {
  container.clear();
  bootstrapServices();
}

// Auto-bootstrap on import (can be disabled for testing)
if (typeof window !== "undefined" || process.env.NODE_ENV !== "test") {
  bootstrapServices();
}
