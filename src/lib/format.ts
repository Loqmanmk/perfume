import { SITE } from '@/config/site';

const currencyFormatter = new Intl.NumberFormat(SITE.locale, {
  style: 'currency',
  currency: SITE.currency,
  maximumFractionDigits: 0,
});

export function formatPrice(amount: number): string {
  return currencyFormatter.format(amount);
}
