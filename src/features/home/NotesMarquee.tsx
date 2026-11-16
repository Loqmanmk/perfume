const NOTES = [
  'Damask rose',
  'Smoked oud',
  'Bourbon vanilla',
  'Sicilian lemon',
  'Iris butter',
  'Sandalwood',
  'Saffron',
  'White tea',
  'Neroli',
  'Tonka bean',
];

/** A slow ribbon of raw materials. Purely decorative, so it is hidden from assistive tech. */
export function NotesMarquee() {
  return (
    <div className="hairline overflow-hidden border-y py-6" aria-hidden>
      <div className="flex w-max animate-marquee">
        {[...NOTES, ...NOTES].map((note, index) => (
          <span key={index} className="flex items-center font-display text-3xl italic text-cream/70 md:text-4xl">
            <span className="px-8">{note}</span>
            <span className="text-base text-gold">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
