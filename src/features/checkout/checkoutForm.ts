export interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel';
  autoComplete: string;
  /** Tailwind column span on the two-column form grid. */
  span: 'full' | 'half';
  validate: (value: string) => string | undefined;
}

const required = (message: string) => (value: string) => (value.trim() ? undefined : message);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The checkout form is data: add, remove or reorder fields here. */
export const CHECKOUT_FIELDS = [
  {
    name: 'email',
    label: 'Email address',
    type: 'email',
    autoComplete: 'email',
    span: 'full',
    validate: (value) =>
      EMAIL_PATTERN.test(value.trim()) ? undefined : 'Enter a valid email, like name@example.com.',
  },
  {
    name: 'firstName',
    label: 'First name',
    type: 'text',
    autoComplete: 'given-name',
    span: 'half',
    validate: required('Enter your first name.'),
  },
  {
    name: 'lastName',
    label: 'Last name',
    type: 'text',
    autoComplete: 'family-name',
    span: 'half',
    validate: required('Enter your last name.'),
  },
  {
    name: 'address',
    label: 'Address',
    type: 'text',
    autoComplete: 'street-address',
    span: 'full',
    validate: required('Enter your street address.'),
  },
  {
    name: 'city',
    label: 'City',
    type: 'text',
    autoComplete: 'address-level2',
    span: 'half',
    validate: required('Enter your city.'),
  },
  {
    name: 'postalCode',
    label: 'Postal code',
    type: 'text',
    autoComplete: 'postal-code',
    span: 'half',
    validate: required('Enter your postal code.'),
  },
  {
    name: 'country',
    label: 'Country',
    type: 'text',
    autoComplete: 'country-name',
    span: 'half',
    validate: required('Enter your country.'),
  },
  {
    name: 'phone',
    label: 'Phone (optional)',
    type: 'tel',
    autoComplete: 'tel',
    span: 'half',
    validate: () => undefined,
  },
] as const satisfies readonly FieldConfig[];

export type CheckoutFieldName = (typeof CHECKOUT_FIELDS)[number]['name'];
export type CheckoutValues = Record<CheckoutFieldName, string>;
export type CheckoutErrors = Partial<Record<CheckoutFieldName, string>>;

export const EMPTY_CHECKOUT_VALUES = Object.fromEntries(
  CHECKOUT_FIELDS.map((field) => [field.name, '']),
) as CheckoutValues;

export function validateCheckout(values: CheckoutValues): CheckoutErrors {
  const errors: CheckoutErrors = {};
  for (const field of CHECKOUT_FIELDS) {
    const message = field.validate(values[field.name]);
    if (message) errors[field.name] = message;
  }
  return errors;
}

export function createOrderNumber(): string {
  return `NU-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}
