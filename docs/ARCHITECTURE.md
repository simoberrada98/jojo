# Project Architecture

## Overview

This document outlines the refactored architecture following SOLID, DRY, and KISS principles.

## Directory Structure

```
jhuangnyc/
├── lib/
│   ├── config/                    # Centralized configuration
│   │   ├── app.config.ts          # App-wide settings
│   │   ├── currency.config.ts     # Currency rates & settings
│   │   ├── payment.config.ts      # Payment configuration
│   │   └── pricing.config.ts      # Pricing rules
│   │
│   ├── constants/                 # Shared constants
│   │   └── navigation.ts          # Navigation menu items
│   │
│   ├── contexts/                  # React contexts
│   │   ├── auth-context.tsx       # Authentication state
│   │   ├── cart-context.tsx       # Shopping cart state
│   │   └── currency-context.tsx   # Currency selection
│   │
│   ├── services/                  # Business logic services
│   │   ├── db-operation.wrapper.ts      # Generic DB retry logic
│   │   ├── payment-db.service.ts        # Payment database ops
│   │   ├── payment-storage.service.ts   # Payment localStorage
│   │   ├── pricing.service.ts           # Pricing calculations
│   │   └── payment-strategies/          # Payment method strategies
│   │       ├── payment-strategy.interface.ts
│   │       ├── hoodpay.strategy.ts
│   │       ├── web-payment.strategy.ts
│   │       ├── strategy-registry.ts
│   │       └── index.ts
│   │
│   ├── supabase/                  # Supabase clients
│   │   ├── config.ts              # Centralized config
│   │   ├── client.ts              # Browser client
│   │   └── server.ts              # Server client
│   │
│   ├── types/                     # TypeScript types
│   │   ├── cart.ts                # Cart types
│   │   ├── database.ts            # Database types
│   │   └── product.ts             # Product types
│   │
│   ├── utils/                     # Utility functions
│   │   ├── string.ts              # String utilities
│   │   └── pricing.ts             # Legacy pricing (deprecated)
│   │
│   └── env.ts                     # Environment validation (T3 Env)
│
├── components/                    # React components
│   ├── ui/                        # Base UI components
│   ├── layout/                    # Layout components
│   └── ...                        # Feature components
│
├── app/                           # Next.js app directory
└── docs/                          # Documentation
    ├── ARCHITECTURE.md            # This file
    └── REFACTORING_SUMMARY.md     # Refactoring details
```

---

## Layer Architecture

### 1. Configuration Layer

**Purpose**: Single source of truth for all configuration

```
lib/env.ts (validates env vars)
    ↓
lib/config/* (app configuration)
    ↓
Used by services and components
```

**Files**:

- `lib/env.ts` - Environment variable validation
- `lib/config/app.config.ts` - General app settings
- `lib/config/currency.config.ts` - Currency configuration
- `lib/config/payment.config.ts` - Payment settings
- `lib/config/pricing.config.ts` - Pricing rules

**Principles**:

- ✅ DRY - One place for each config value
- ✅ Type-safe via Zod schemas
- ✅ Validated at build time

---

### 2. Service Layer

**Purpose**: Business logic and data operations

```
Services (business logic)
    ↓
Contexts (React state management)
    ↓
Components (UI)
```

**Services**:

#### `PricingService` (Static Methods)

```typescript
PricingService.convertPrice(usdPrice, currency);
PricingService.formatPrice(usdPrice, currency);
PricingService.calculateCartSummary(items);
```

#### `PaymentDatabaseService` (Class)

```typescript
const dbService = new PaymentDatabaseService(url, key);
await dbService.createPayment(paymentData);
await dbService.getPayment(id);
await dbService.updatePaymentStatus(id, status);
```

#### `PaymentStorageService` (Class with DI)

```typescript
const storage = createPaymentStorage(storageAdapter);
storage.initializeSession(paymentIntent, checkoutData);
storage.updateStep(PaymentStep.PROCESSING);
storage.markCompleted(transactionId);
```

#### Payment Strategies (Strategy Pattern)

```typescript
const strategy = paymentStrategyRegistry.getStrategy(method);
const result = await strategy.process(state, paymentData);
```

**Principles**:

- ✅ SRP - Each service has one responsibility
- ✅ DIP - Depends on interfaces, not concrete implementations
- ✅ OCP - Easy to extend (e.g., add payment strategies)

---

### 3. Data Access Layer

**Purpose**: Database operations with retry logic

```
PaymentDatabaseService
    ↓
dbOperation() wrapper
    ↓
withRetry() logic
    ↓
Supabase client
```

**Flow**:

1. Service method calls `dbOperation()`
2. `dbOperation()` wraps Supabase query
3. Automatic retry with exponential backoff
4. Consistent error handling
5. Returns `ServiceResponse<T>`

**Benefits**:

- ✅ DRY - No repetitive try-catch blocks
- ✅ Consistent error handling
- ✅ Centralized retry logic
- ✅ Performance metrics (duration tracking)

---

### 4. React Context Layer

**Purpose**: State management for React components

**Contexts**:

#### `AuthContext`

```typescript
const { user, profile, signOut } = useAuth();
```

#### `CartContext`

```typescript
const { items, addItem, removeItem, itemCount, total } = useCart();
```

#### `CurrencyContext`

```typescript
const { currency, setCurrency, formatPrice } = useCurrency();
```

**Integration**:
Contexts now use services for business logic:

```typescript
// CurrencyContext delegates to PricingService
const formatPrice = (usdPrice: number) => {
  return PricingService.formatPrice(usdPrice, currency);
};

// CartContext uses PricingService
const itemCount = PricingService.calculateItemCount(items);
const total = PricingService.calculateSubtotal(items);
```

**Principles**:

- ✅ SRP - Contexts only manage React state
- ✅ DRY - Business logic in services, not contexts
- ✅ Testable - Services can be tested independently

---

## Design Patterns Used

### 1. Strategy Pattern

**Location**: `lib/services/payment-strategies/`

**Problem**: Switch statement for payment methods was hard to extend

**Solution**:

```typescript
interface PaymentStrategy {
  process(state, data): Promise<PaymentResult>;
  isAvailable(): boolean;
  validate(data): { valid: boolean; error?: string };
}

// Easy to add new strategies
class StripeStrategy implements PaymentStrategy { ... }
class PayPalStrategy implements PaymentStrategy { ... }

// Register in registry
registry.register(PaymentMethod.STRIPE, new StripeStrategy());
```

**Benefits**:

- Open/Closed Principle
- Easy to test each strategy
- No code changes needed to add new methods

---

### 2. Factory Pattern

**Location**: Multiple places

```typescript
// Supabase clients
export function createClient() { ... }

// Payment services
export function createPaymentStorage(storage?: StorageAdapter) { ... }
export function createPaymentDbService(url?, key?) { ... }

// Strategy registry
export function createPaymentStrategyRegistry() { ... }
```

**Benefits**:

- Dependency injection
- Easier testing (inject mocks)
- Consistent instantiation

---

### 3. Adapter Pattern

**Location**: `PaymentStorageService`

```typescript
interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  keys(): string[];
}

class BrowserStorageAdapter implements StorageAdapter {
  // Wraps localStorage
}

class MockStorageAdapter implements StorageAdapter {
  // For testing
}
```

**Benefits**:

- Testable storage operations
- Can swap implementations
- Abstracts storage mechanism

---

### 4. Service Layer Pattern

**Location**: `lib/services/`

Business logic extracted into services:

- `PricingService` - All pricing calculations
- `PaymentDatabaseService` - Payment persistence
- `PaymentStorageService` - Session state

Components and contexts use services:

```typescript
// Component
const total = PricingService.calculateCartTotal(items, currency);

// Context
const itemCount = PricingService.calculateItemCount(items);
```

**Benefits**:

- Reusable business logic
- Testable without React
- Consistent behavior

---

## Dependency Flow

```
┌─────────────────────────────────────────┐
│         Components (UI)                 │
│  - Display data                         │
│  - User interactions                    │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│         Contexts (State)                │
│  - React state management               │
│  - Delegates to services                │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│         Services (Business Logic)       │
│  - PricingService                       │
│  - PaymentDatabaseService               │
│  - PaymentStorageService                │
│  - Payment Strategies                   │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│         Data Layer                      │
│  - Supabase client                      │
│  - localStorage                         │
│  - External APIs                        │
└─────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│         Configuration                   │
│  - lib/env.ts (validated vars)          │
│  - lib/config/* (app settings)          │
└─────────────────────────────────────────┘
```

---

## Testing Strategy

### Unit Tests

#### Services (Easy to test)

```typescript
describe("PricingService", () => {
  it("converts USD to BTC", () => {
    const result = PricingService.convertPrice(1000, "BTC");
    expect(result).toBeCloseTo(0.029);
  });
});
```

#### Storage with Mock

```typescript
describe("PaymentStorageService", () => {
  const mockStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    keys: jest.fn(() => []),
  };

  const storage = createPaymentStorage(mockStorage);

  it("saves payment state", () => {
    storage.saveState(testState);
    expect(mockStorage.setItem).toHaveBeenCalled();
  });
});
```

#### Strategies

```typescript
describe("HoodPayStrategy", () => {
  const strategy = new HoodPayStrategy("test-key", "test-id");

  it("processes payment", async () => {
    const result = await strategy.process(mockState, mockData);
    expect(result.success).toBe(true);
  });
});
```

### Integration Tests

- Test contexts with services
- Test payment flow end-to-end
- Test database operations with test DB

---

## Key Principles Applied

### SOLID

✅ **Single Responsibility Principle**

- Each service has one clear purpose
- Contexts only manage React state
- Components only handle UI

✅ **Open/Closed Principle**

- Easy to add new payment strategies
- Easy to add new storage adapters
- Configuration extensible

✅ **Liskov Substitution Principle**

- Any `PaymentStrategy` can be used interchangeably
- Any `StorageAdapter` can be swapped

✅ **Interface Segregation Principle**

- Services expose only needed methods
- Interfaces are focused and minimal

✅ **Dependency Inversion Principle**

- Services depend on interfaces (StorageAdapter)
- High-level modules don't depend on low-level details

### DRY

✅ **No Code Duplication**

- Pricing logic: `PricingService`
- String utilities: `lib/utils/string.ts`
- Navigation: `lib/constants/navigation.ts`
- Database operations: `dbOperation()` wrapper

### KISS

✅ **Keep It Simple**

- Small, focused services
- Clear naming conventions
- Minimal abstractions
- Direct dependency injection

---

## Migration Path

1. ✅ **Phase 1: Infrastructure** (Completed)

   - Environment validation
   - Configuration centralization
   - Shared utilities

2. ✅ **Phase 2: Services** (Completed)

   - Pricing service
   - Database service
   - Storage service
   - Payment strategies

3. 🔄 **Phase 3: Components** (In Progress)

   - Refactor Header component
   - Simplify Product Catalog
   - Extract hooks

4. ⏳ **Phase 4: Testing**
   - Unit tests for services
   - Integration tests
   - E2E tests

---

## Best Practices

### Adding New Payment Method

1. Create strategy class:

```typescript
// lib/services/payment-strategies/new-method.strategy.ts
export class NewMethodStrategy extends BasePaymentStrategy {
  getName() {
    return "New Method";
  }
  async process(state, data) {
    /* implementation */
  }
}
```

2. Register strategy:

```typescript
// lib/services/payment-strategies/strategy-registry.ts
private registerDefaults() {
  this.register(PaymentMethod.NEW_METHOD, new NewMethodStrategy());
}
```

3. Done! No other code changes needed.

### Adding New Configuration

1. Add to appropriate config file:

```typescript
// lib/config/app.config.ts
export const APP_CONFIG = {
  // ... existing config
  newFeature: {
    enabled: true,
    timeout: 5000,
  },
};
```

2. Use throughout app:

```typescript
import { APP_CONFIG } from '@/lib/config/app.config';
if (APP_CONFIG.newFeature.enabled) { ... }
```

### Creating New Service

1. Follow SRP - one responsibility
2. Use dependency injection
3. Add factory function
4. Document with JSDoc

```typescript
/**
 * MyService handles X
 */
export class MyService {
  constructor(private dependency: SomeDependency) {}

  doSomething() {
    /* ... */
  }
}

export function createMyService(dep?: SomeDependency) {
  return new MyService(dep || defaultDep);
}
```

---

## Questions?

For more details:

- See `docs/REFACTORING_SUMMARY.md` for migration guide
- Check individual service files for JSDoc comments
- Review test files for usage examples
