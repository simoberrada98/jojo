/**
 * Service Container
 * Lightweight dependency injection container
 * Provides service locator pattern for better testability
 */

type ServiceFactory<T> = () => T
type ServiceInstance<T> = T

export class ServiceContainer {
  private services = new Map<string, ServiceInstance<any>>()
  private factories = new Map<string, ServiceFactory<any>>()
  private singletons = new Set<string>()

  /**
   * Register a service factory
   */
  register<T>(
    name: string,
    factory: ServiceFactory<T>,
    singleton: boolean = true
  ): void {
    this.factories.set(name, factory)
    if (singleton) {
      this.singletons.add(name)
    }
  }

  /**
   * Register a service instance directly
   */
  instance<T>(name: string, instance: T): void {
    this.services.set(name, instance)
    this.singletons.add(name)
  }

  /**
   * Resolve a service
   */
  resolve<T>(name: string): T {
    // Check if instance already exists
    if (this.services.has(name)) {
      return this.services.get(name) as T
    }

    // Get factory
    const factory = this.factories.get(name)
    if (!factory) {
      throw new Error(`Service "${name}" not registered`)
    }

    // Create instance
    const instance = factory()

    // Cache if singleton
    if (this.singletons.has(name)) {
      this.services.set(name, instance)
    }

    return instance
  }

  /**
   * Check if service is registered
   */
  has(name: string): boolean {
    return this.services.has(name) || this.factories.has(name)
  }

  /**
   * Clear all services
   */
  clear(): void {
    this.services.clear()
    this.factories.clear()
    this.singletons.clear()
  }

  /**
   * Remove a specific service
   */
  remove(name: string): void {
    this.services.delete(name)
    this.factories.delete(name)
    this.singletons.delete(name)
  }

  /**
   * Get all registered service names
   */
  getServiceNames(): string[] {
    const names = new Set<string>()
    this.services.forEach((_, key) => names.add(key))
    this.factories.forEach((_, key) => names.add(key))
    return Array.from(names)
  }
}

/**
 * Global service container instance
 */
export const container = new ServiceContainer()

/**
 * Service names (constants for type safety)
 */
export const Services = {
  PRICING: 'PricingService',
  PAYMENT_STORAGE: 'PaymentStorageService',
  PAYMENT_DB: 'PaymentDatabaseService',
  PAYMENT_STATE_MANAGER: 'PaymentStateManager',
  PAYMENT_HOOKS_MANAGER: 'PaymentHooksManager',
  PAYMENT_PROCESSOR: 'PaymentProcessor',
  PAYMENT_RECOVERY: 'PaymentRecoveryService',
  PAYMENT_ORCHESTRATOR: 'PaymentOrchestrator'
} as const
