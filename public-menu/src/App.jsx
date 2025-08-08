import { useState } from 'react'
import { Search, Menu as MenuIcon } from 'lucide-react'

export default function App() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')

  return (
    <div className="min-h-screen pb-28">
      <header className="sticky top-0 z-30 backdrop-blur bg-white/80 border-b">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-surface-muted grid place-items-center text-sm font-semibold">D</div>
          <h1 className="text-lg font-semibold tracking-tight">DigiDinez</h1>
        </div>
      </header>

      <div className="sticky top-[3.25rem] z-20 border-b bg-white/90 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="inline-flex rounded-xl bg-surface-muted p-1 border">
            <button className="px-3 py-1.5 text-sm rounded-md transition border bg-white border-slate-200 shadow">All</button>
            <button className="px-3 py-1.5 text-sm rounded-md transition border">Veg</button>
            <button className="px-3 py-1.5 text-sm rounded-md transition border">Non-veg</button>
          </div>
          <button onClick={() => setOpen(v => !v)} className="px-3 py-1.5 text-sm rounded-md border inline-flex items-center gap-1">
            Filters <MenuIcon size={16}/>
          </button>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-4 space-y-6">
        {/* Replace with real sections + items */}
        <section className="section-anchor">
          <button className="w-full text-left py-3 sticky top-[6.25rem] bg-white z-10 border-b flex items-center justify-between">
            <h2 className="text-base font-semibold">Starters</h2>
            <span className="text-sm text-slate-500">12</span>
          </button>
          <div className="divide-y">
            {[...Array(3)].map((_, i) => (
              <article key={i} className="grid grid-cols-[96px_1fr] gap-3 py-3">
                <div className="h-24 w-24 rounded-lg border skeleton"/>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-3 w-3 rounded-full border bg-[color:var(--color-accent)] border-[color:var(--color-accent)]" aria-label="Vegetarian"/>
                    <h3 className="font-medium leading-tight">Dish name</h3>
                    <span className="text-xs text-danger">🌶</span>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">Nice short description goes here.</p>
                  <div className="mt-1 font-semibold">₹199.00</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 rounded-full text-xs border" style={{borderColor:'#0ea5e9', color:'#0ea5e9'}}>Jain</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 inset-x-0 z-40">
        <div className="max-w-5xl mx-auto px-4 pb-3">
          <div className="flex items-center gap-2 rounded-xl border bg-white shadow-soft p-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={18} />
              <input
                value={q} onChange={e => setQ(e.target.value)}
                placeholder="Search in menu" className="w-full pl-9 pr-3 py-2 rounded-lg outline-none"
              />
              {/* typeahead dropdown goes here */}
            </div>
            <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-black text-white">
              <MenuIcon size={18}/> Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
