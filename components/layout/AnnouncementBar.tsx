// Announcement bar — slim marquee, dark luxury
function Segment() {
  return (
    <span className="inline-flex items-center gap-0 text-[11px] font-medium tracking-[0.08em] uppercase">
      <span className="text-white/70">Accesorios Apple Originales</span>
      <span className="mx-4 text-white/20">·</span>
      <span style={{ color: '#25D366' }} className="font-semibold">Envíos a Toda Colombia</span>
      <span className="mx-4 text-white/20">·</span>
      <span className="text-white/70">Combo Cargador </span>
      <span style={{ color: '#C9A84C' }} className="font-bold ml-1">$120.000</span>
      <span className="mx-4 text-white/20">·</span>
      <span className="text-white/70">Garantía Incluida</span>
      <span className="mx-4 text-white/20">·</span>
      <span style={{ color: '#25D366' }} className="font-semibold">Envío Gratis a Todo el País</span>
      <span className="mx-4 text-white/20">·</span>
    </span>
  )
}

export default function AnnouncementBar() {
  const count = 5
  return (
    <div
      role="marquee"
      aria-label="Anuncio de la tienda"
      className="fixed left-0 right-0 top-0 z-50 h-8 overflow-hidden bg-[#050505] border-b border-white/[0.06] flex items-center"
    >
      <div className="flex whitespace-nowrap animate-marquee" aria-hidden="true">
        <span className="px-6">
          {Array.from({ length: count }).map((_, i) => <Segment key={i} />)}
        </span>
        <span className="px-6" aria-hidden="true">
          {Array.from({ length: count }).map((_, i) => <Segment key={i} />)}
        </span>
      </div>
    </div>
  )
}
