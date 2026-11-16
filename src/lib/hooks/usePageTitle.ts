import { useEffect } from 'react';
import { SITE } from '@/config/site';

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title
      ? `${title} — ${SITE.name}`
      : `${SITE.name} — ${SITE.descriptor}`;
  }, [title]);
}
