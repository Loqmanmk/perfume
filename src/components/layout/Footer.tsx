import { useState, type FormEvent } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SITE } from '@/config/site';
import { FAMILY_LABELS, SCENT_FAMILIES } from '@/domain/product';

const HELP_LINKS = ['Shipping & returns', 'Track an order', 'Contact us', 'FAQ'];

function NewsletterForm() {
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Connect to your email provider here.
    setIsSubscribed(true);
  };

  if (isSubscribed) {
    return (
      <p role="status" className="flex items-center gap-2 text-sm text-gold">
        <Check size={16} aria-hidden /> Thank you — you are on the list.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="hairline flex items-center border-b focus-within:border-gold">
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        name="email"
        required
        autoComplete="email"
        placeholder="Your email address"
        className="min-h-12 flex-1 bg-transparent text-sm placeholder:text-muted focus:outline-none"
      />
      <button
        type="submit"
        className="grid size-11 place-items-center text-cream transition-colors hover:text-gold"
        aria-label="Subscribe to the newsletter"
      >
        <ArrowRight size={18} aria-hidden />
      </button>
    </form>
  );
}

export function Footer() {
  return (
    <footer className="hairline border-t bg-ink-900">
      <div className="container-page grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr_1.4fr] md:py-20">
        <div>
          <p className="font-display text-3xl font-semibold uppercase tracking-[0.35em]">{SITE.name}</p>
          <p className="mt-4 max-w-xs text-sm text-muted">
            Rare perfumes composed slowly, in small batches, from the finest raw materials.
          </p>
        </div>

        <nav aria-label="Shop by family">
          <h2 className="eyebrow">Shop</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {SCENT_FAMILIES.map((family) => (
              <li key={family}>
                <Link to={`/shop?family=${family}`} className="text-muted transition-colors hover:text-cream">
                  {FAMILY_LABELS[family]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="eyebrow">Help</h2>
          <ul className="mt-5 space-y-3 text-sm text-muted">
            {HELP_LINKS.map((label) => (
              <li key={label}>{label}</li>
            ))}
            <li>
              <a href={`mailto:${SITE.supportEmail}`} className="transition-colors hover:text-cream">
                {SITE.supportEmail}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="eyebrow">The letter</h2>
          <p className="mb-5 mt-5 text-sm text-muted">
            New launches, private sales and stories from the atelier. No noise.
          </p>
          <NewsletterForm />
        </div>
      </div>

      <div className="hairline border-t">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-muted md:flex-row md:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE.name} {SITE.descriptor}. All rights reserved.
          </p>
          <p>Vegan · Cruelty-free · Recyclable glass</p>
        </div>
      </div>
    </footer>
  );
}
