import { container, Services } from './ServiceContainer';
import type { ServiceContainer as ServiceContainerType } from './ServiceContainer';
import { SupabaseAdminService } from './supabase-admin.service';
import { HoodpayDataService } from './hoodpay-data.service';
import { createPaymentStorage, type PaymentStorageService } from './payment-storage.service';
import { PaymentStateManager } from './payment/PaymentStateManager';
import { PaymentHooksManager } from './payment/PaymentHooksManager';
import { PaymentProcessor } from './payment/PaymentProcessor';
import { PaymentRecoveryService } from './payment/PaymentRecoveryService';
import { PaymentDatabaseService } from './payment-db.service';
import { NotificationService } from './notification.service';

type ServiceName = (typeof Services)[keyof typeof Services];

let registered = false;

function registerCoreServices() {
  if (registered) {
    return;
  }

  registered = true;

  container.register(Services.SUPABASE_ADMIN, () => new SupabaseAdminService(), true);

  container.register(
    Services.HOODPAY_DATA,
    () => {
      const admin = container.resolve<SupabaseAdminService>(Services.SUPABASE_ADMIN);
      return new HoodpayDataService(admin.getClient());
    },
    true
  );

  container.register(
    Services.PAYMENT_STORAGE,
    () => createPaymentStorage(),
    true
  );

  container.register(
    Services.PAYMENT_STATE_MANAGER,
    () => {
      const storage = container.resolve<PaymentStorageService>(Services.PAYMENT_STORAGE);
      return new PaymentStateManager(storage);
    },
    true
  );

  container.register(
    Services.PAYMENT_HOOKS_MANAGER,
    () => new PaymentHooksManager(),
    true
  );

  container.register(
    Services.PAYMENT_DB,
    () => {
      const admin = container.resolve<SupabaseAdminService>(Services.SUPABASE_ADMIN);
      return new PaymentDatabaseService(admin.getClient());
    },
    true
  );

  container.register(
    Services.PAYMENT_PROCESSOR,
    () => {
      const dbService = container.resolve<PaymentDatabaseService>(Services.PAYMENT_DB);
      return new PaymentProcessor(dbService);
    },
    true
  );

  container.register(
    Services.PAYMENT_RECOVERY,
    () => {
      const storage = container.resolve<PaymentStorageService>(Services.PAYMENT_STORAGE);
      return new PaymentRecoveryService(storage);
    },
    true
  );

  container.register(
    Services.NOTIFICATION,
    () => new NotificationService(),
    true
  );
}

export function resolveService<T>(name: ServiceName): T {
  registerCoreServices();
  return container.resolve<T>(name);
}

export { container as serviceContainer, Services };
