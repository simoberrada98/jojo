
# Refactoring and Code Cleanup Initiative

This document outlines a series of refactoring tasks to improve the quality, maintainability, and testability of the codebase. The focus is on adhering to the DRY (Don't Repeat Yourself) and Singleton principles, as well as improving the overall structure of the application.

## 1. Consolidate Hoodpay Payment Session Creation

**Problem:** The logic for creating a Hoodpay payment session is duplicated in `app/actions/create-hoodpay-session.ts` and `lib/services/payment-strategies/hoodpay.strategy.server.ts`. This violates the DRY principle and makes the code harder to maintain.

**Action:**

*   **Create a single, authoritative function for creating Hoodpay payment sessions.** This function should reside in `lib/services/payment-strategies/hoodpay.strategy.server.ts`.
*   **Refactor `app/actions/create-hoodpay-session.ts` to use this new, consolidated function.** The action should be responsible for handling the request and response, but the core logic of creating the payment session should be delegated.
*   **Centralize Hoodpay configuration.** Create a single source of truth for Hoodpay configuration values (API key, business ID, URLs, etc.) and ensure all related modules use it.

## 2. Decompose the `hoodpayModule.ts` Monolith

**Problem:** The `lib/hoodpayModule.ts` file has become a monolith, containing API handlers, data access logic, and utility functions. This makes the code difficult to understand, test, and maintain.

**Action:**

*   **Move API handlers to the `app/api` directory.** The `paymentsApiHandler` and `webhooksApiHandler` should be moved to their own route handlers in the `app/api/hoodpay` directory.
*   **Create a dedicated Supabase service for Hoodpay data.** The `savePaymentsToSupabase` function and any other Supabase-related logic should be moved to a new service, e.g., `lib/services/hoodpay.service.ts`. This service should be registered as a singleton in the `ServiceContainer`.
*   **Move utility functions to `lib/utils`.** Any general-purpose utility functions should be moved to the appropriate files in the `lib/utils` directory.

## 3. Refactor Webhook Handling

**Problem:** The webhook handling logic in `app/api/hoodpay/webhook/route.ts` is verbose and repetitive. The functions for handling different event types all have a similar structure.

**Action:**

*   **Implement a data-driven approach for webhook handling.** Create a map or a switch statement that dispatches to the appropriate handler based on the event type.
*   **Consolidate common logic.** Extract any common logic, such as fetching the payment record from the database, into a shared function.

## 4. Enforce Singleton and Service Locator Patterns

**Problem:** The `ServiceContainer` is not being used consistently, and services are being instantiated manually in multiple places. This leads to multiple instances of services that should be singletons, making the code less efficient and harder to test.

**Action:**

*   **Register all services as singletons in the `ServiceContainer`.** This includes `PaymentDatabaseService`, `PaymentStateManager`, `PaymentHooksManager`, `PaymentProcessor`, and `PaymentRecoveryService`.
*   **Refactor the code to resolve services from the `ServiceContainer` instead of creating new instances.** This applies to `PaymentOrchestrator.ts`, `create-hoodpay-session.ts`, `app/api/hoodpay/webhook/route.ts`, and any other places where services are being instantiated manually.
*   **Ensure the Supabase client is a singleton.** The `getSupabaseClient` function in `lib/hoodpayModule.ts` should be replaced with a service that is registered in the `ServiceContainer`.

By completing these refactoring tasks, we will significantly improve the quality and maintainability of the codebase, making it easier to develop and test new features in the future.
