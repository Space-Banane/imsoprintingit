export default function InfoSections() {
  return (
    <>
      <section id="about" className="w-full px-6 py-24 bg-gradient-to-b from-transparent via-black/20 to-transparent">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-14 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-6">Why Spec Cards?</h2>
            <p className="text-zinc-400 leading-relaxed text-sm md:text-base mb-4">Sharing a print online is more than a picture. Makers want to know the context: speeds, materials, temperatures, slicer, and more. These cards make your posts cleaner and more professional—like a mini product launch for each project.</p>
            <p className="text-zinc-400 leading-relaxed text-sm md:text-base">This tool focuses on aesthetics + clarity. It is intentionally minimal while still flexible. No accounts. No clutter. Just generate and share.</p>
          </div>
          <div className="relative rounded-3xl bg-[#141416]/60 ring-1 ring-white/5 p-8 backdrop-blur-xl shadow-xl">
            <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{background:'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.08), transparent 70%)'}} />
            <ul className="relative space-y-4 text-sm text-zinc-300">
              <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-white" />Instant export as high-quality PNG</li>
              <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-white" />Apple-inspired typography & layout</li>
              <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-white" />Smart numeric input filtering</li>
              <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-white" />Customizable material, slicer & modes</li>
              <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-white" />Zero back-end; everything runs locally</li>
            </ul>
          </div>
        </div>
      </section>
      <section id="features" className="w-full px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-10">Features</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { title: 'Polished Aesthetic', body: 'Carefully tuned spacing, contrast, and hierarchy for a premium feel.' },
              { title: 'Local & Private', body: 'No uploads. Your images and data never leave the browser.' },
              { title: 'Adaptive Metadata', body: 'Only fields you fill appear on the card—no visual noise.' },
              { title: 'Color Picker Tokens', body: 'Quick-select filament color chips with instant feedback.' },
              { title: 'Rich Export', body: 'High-fidelity PNG capture with glassy effects preserved.' },
              { title: 'Fast Workflow', body: 'Drag image, fill specs, export—under 10 seconds.' },
            ].map(f => (
              <div key={f.title} className="group p-6 rounded-2xl bg-[#141416]/70 ring-1 ring-white/5 backdrop-blur hover:ring-white/20 transition shadow">
                <h3 className="font-medium text-lg mb-2 text-white group-hover:text-zinc-100">{f.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="how" className="w-full px-6 py-24 bg-gradient-to-b from-transparent via-black/30 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-8">How It Works</h2>
          <ol className="text-left mx-auto max-w-2xl space-y-6 text-sm text-zinc-300">
            <li><span className="text-zinc-100 font-medium">1. Upload</span> – Choose a clean, well-lit image of your print.</li>
            <li><span className="text-zinc-100 font-medium">2. Describe</span> – Add a concise title and optional description.</li>
            <li><span className="text-zinc-100 font-medium">3. Specify</span> – Enter print parameters and select materials/modes.</li>
            <li><span className="text-zinc-100 font-medium">4. Preview</span> – See the card update instantly with live styling.</li>
            <li><span className="text-zinc-100 font-medium">5. Export</span> – Download a crisp PNG ready for socials or forums.</li>
          </ol>
        </div>
      </section>
    </>
  );
}
