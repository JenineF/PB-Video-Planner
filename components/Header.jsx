export default function Header() {
  return (
    <header className="border-b border-navy-800 bg-navy-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">

        {/* ── Logo Mark ── */}
        <div className="relative flex items-center justify-center w-11 h-11 shrink-0">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-2 border-brand-blue opacity-60" />
          {/* Inner ring */}
          <div className="absolute inset-1.5 rounded-full border border-brand-blue opacity-30" />
          {/* Icon */}
          <span className="text-xl relative z-10">🎯</span>
        </div>

        {/* ── App Name ── */}
        <div>
          <h1 className="text-base font-bold text-white leading-tight tracking-wide">
            Personal Branding Video Content Planner
          </h1>
          <p className="text-xs text-navy-500 mt-0.5 font-medium">
            by{' '}
            <span className="text-brand-blue font-semibold">Ring Ring Marketing</span>
            <span className="mx-2 text-navy-700">·</span>
            <span className="text-navy-500">Funeral Homes · Home Care · Home Improvement</span>
          </p>
        </div>

        {/* ── Spacer ── */}
        <div className="flex-1" />

        {/* ── GPT-4o badge ── */}
        <div className="hidden sm:flex items-center gap-1.5 bg-navy-800 border border-navy-700 text-brand-blue text-xs font-semibold px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse-slow inline-block" />
          GPT-4o Powered
        </div>
      </div>
    </header>
  )
}
