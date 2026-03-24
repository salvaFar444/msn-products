const TEXT =
  '¡ÚLTIMAS UNIDADES! — PROMOCIÓN DE CARGADOR COMPLETO POR $100.000 — ENVÍOS A TODA COLOMBIA — '

export default function AnnouncementBar() {
  // Duplicate text to create seamless loop (translateX(-50%) lands on the copy start)
  const repeated = TEXT.repeat(8)

  return (
    <div
      role="marquee"
      aria-label="Anuncio de la tienda"
      className="fixed left-0 right-0 top-0 z-50 h-9 overflow-hidden bg-[#1D1D1F] flex items-center"
    >
      <div
        className="flex whitespace-nowrap animate-marquee"
        aria-hidden="true"
      >
        <span className="text-[11px] font-medium tracking-wide text-white/90 px-4">
          {repeated}
        </span>
        <span className="text-[11px] font-medium tracking-wide text-white/90 px-4" aria-hidden="true">
          {repeated}
        </span>
      </div>
    </div>
  )
}
