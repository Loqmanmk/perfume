import type { PublicUser } from '@/domain/user';
import type { ShippingAddress } from '@/domain/order';

export interface CheckoutFieldConfig {
  name: keyof ShippingAddress;
  label: string;
  type: 'text' | 'email' | 'tel';
  autoComplete: string;
  /** Column span on the two-column form grid. */
  span: 'full' | 'half';
}

/**
 * How the delivery form is laid out. Validation lives in `shippingAddressSchema`
 * (shared with the server); this list only decides order, labels and autofill.
 */
export const CHECKOUT_FIELDS: readonly CheckoutFieldConfig[] = [
  { name: 'email', label: 'Email address', type: 'email', autoComplete: 'email', span: 'full' },
  { name: 'firstName', label: 'First name', type: 'text', autoComplete: 'given-name', span: 'half' },
  { name: 'lastName', label: 'Last name', type: 'text', autoComplete: 'family-name', span: 'half' },
  { name: 'address', label: 'Address', type: 'text', autoComplete: 'street-address', span: 'full' },
  { name: 'city', label: 'City', type: 'text', autoComplete: 'address-level2', span: 'half' },
  { name: 'postalCode', label: 'Postal code', type: 'text', autoComplete: 'postal-code', span: 'half' },
  { name: 'country', label: 'Country', type: 'text', autoComplete: 'country-name', span: 'half' },
  { name: 'phone', label: 'Phone (optional)', type: 'tel', autoComplete: 'tel', span: 'half' },
];

/** Pre-fills what we already know about the shopper. */
export function initialShipping(user: PublicUser): ShippingAddress {
  const [firstName = '', ...rest] = user.name.split(' ');
  return {
    email: user.email,
    firstName,
    lastName: rest.join(' '),
    address: '',
    city: '',
    postalCode: '',
    country: '',
    phone: '',
  };
}
