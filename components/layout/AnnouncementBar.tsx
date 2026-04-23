// Announcement bar — slim marquee on black background, clean white text.
function Segment() {
  return (
    <span className="inline-flex items-center text-[11px] font-semibold tracking-[0.08em] uppercase text-white">
      <span>📍 Domicilio gratis en Montería</span>
      <span className="mx-5 text-white/30" aria-hidden="true">·</span>
      <span>💵 Pago contra entrega en Montería</span>
      <span className="mx-5 text-white/30" aria-hidden="true">·</span>
      <span>🛡️ Garantía de 3 meses</span>
      <span className="mx-5 text-white/30" aria-hidden="true">·</span>
      <span>🚚 Envíos fuera de Montería por WhatsApp</span>
      <span className="mx-5 text-white/30" aria-hidden="true">·</span>
      <span>💬 Atención directa por WhatsApp</span>
      <span className="mx-5 text-white/30" aria-hidden="true">·</span>
    </span>
  )
}

export default function AnnouncementBar() {
  const count = 4
  return (
    <div
      aria-label="Anuncio de la tienda"
      className="fixed left-0 right-0 top-0 z-50 h-9 overflow-hidden bg-primary flex items-center"
    >
      <div
        className="flex whitespace-nowrap animate-marquee"
        style={{ willChange: 'transform' }}
      >
        <div className="flex shrink-0 px-6">
          {Array.from({ length: count }).map((_, i) => (
            <Segment key={`a-${i}`} />
          ))}
        </div>
        <div className="flex shrink-0 px-6" aria-hidden="true">
          {Array.from({ length: count }).map((_, i) => (
            <Segment key={`b-${i}`} />
          ))}
        </div>
      </div>
    </div>
  )
}
