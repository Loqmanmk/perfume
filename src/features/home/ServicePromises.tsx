import { Gift, RefreshCw, ShieldCheck, Truck, type LucideIcon } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { SITE } from '@/config/site';
import { formatPrice } from '@/lib/format';

const PROMISES: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Truck,
    title: 'Free shipping',
    body: `On every order over ${formatPrice(SITE.freeShippingThreshold)}.`,
  },
  { icon: Gift, title: 'Two free samples', body: 'Chosen by you, with every bottle.' },
  { icon: RefreshCw, title: '30-day returns', body: 'Try the samples first, return unopened.' },
  { icon: ShieldCheck, title: 'Secure checkout', body: 'Encrypted payment, always.' },
];

export function ServicePromises() {
  return (
    <section className="container-page py-20" aria-label="Our services">
      <ul className="grid grid-cols-2 gap-y-10 lg:grid-cols-4">
        {PROMISES.map(({ icon: Icon, title, body }, index) => (
          <li key={title}>
            <Reveal delay={index * 0.08} className="flex flex-col items-center px-4 text-center">
              <Icon size={26} strokeWidth={1.3} className="text-gold" aria-hidden />
              <h3 className="mt-4 text-2xl">{title}</h3>
              <p className="mt-1 text-sm text-muted">{body}</p>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
