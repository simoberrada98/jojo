/**
 * Checkout storage utility for persisting checkout form data
 * Saves/loads checkout state to/from localStorage
 */

export interface CheckoutState {
  shippingData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentStep?: 'shipping' | 'review' | 'payment' | 'confirmation';
  orderData?: any;
  timestamp?: string;
}

const STORAGE_KEY = 'mintyos_checkout_state';
const EXPIRY_HOURS = 24; // Clear data after 24 hours

/**
 * Save checkout state to localStorage
 */
export function saveCheckoutState(state: CheckoutState): void {
  if (typeof window !== 'undefined') {
    try {
      const dataToSave = {
        ...state,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.warn('Failed to save checkout state:', error);
    }
  }
}

/**
 * Load checkout state from localStorage
 * Returns null if no data or data is expired
 */
export function loadCheckoutState(): CheckoutState | null {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const data = JSON.parse(stored) as CheckoutState & { timestamp: string };

      // Check if data is expired
      if (data.timestamp) {
        const savedTime = new Date(data.timestamp).getTime();
        const now = new Date().getTime();
        const hoursPassed = (now - savedTime) / (1000 * 60 * 60);

        if (hoursPassed > EXPIRY_HOURS) {
          clearCheckoutState();
          return null;
        }
      }

      return data;
    } catch (error) {
      console.warn('Failed to load checkout state:', error);
      return null;
    }
  }
  return null;
}

/**
 * Clear checkout state from localStorage
 */
export function clearCheckoutState(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear checkout state:', error);
    }
  }
}

/**
 * Update only shipping data in the stored state
 */
export function updateShippingData(
  shippingData: CheckoutState['shippingData']
): void {
  if (typeof window !== 'undefined') {
    const currentState = loadCheckoutState();
    saveCheckoutState({
      ...currentState,
      shippingData,
    });
  }
}

/**
 * Check if there's saved checkout data
 */
export function hasCheckoutState(): boolean {
  if (typeof window !== 'undefined') {
    return loadCheckoutState() !== null;
  }
  return false;
}
