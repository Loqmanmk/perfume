export const SITE = {
  name: 'Nuée',
  descriptor: 'Maison de Parfum',
  locale: 'en-US',
  currency: 'EUR',
  freeShippingThreshold: 150,
  shippingFee: 8,
  supportEmail: 'bonjour@nuee.example',
} as const;

export const NAV_LINKS = [
  { to: '/shop', label: 'Shop' },
  { to: '/scent-finder', label: 'Scent Finder' },
  { to: '/#story', label: 'Our Story' },
] as const;
