export default function Footer() {
  return (
    <footer className="w-full border-t border-white/5 bg-black/40 backdrop-blur mt-10">
      <div className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-10 text-sm">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-500 shadow-inner" />
            <span className="text-zinc-300 font-medium tracking-wide">iamsoprintingit.com</span>
          </div>
          <p className="text-zinc-500 leading-relaxed text-xs">Minimal, elegant 3D print spec card generator. Built for makers who care about presentation.</p>
        </div>
        <div className="space-y-2">
          <h3 className="text-zinc-200 font-medium tracking-wide text-xs uppercase">Links</h3>
          <ul className="space-y-1 text-zinc-400 text-sm">
            <li><a className="hover:text-zinc-200 transition" href="#hero">Home</a></li>
            <li><a className="hover:text-zinc-200 transition" href="#tool">Generator</a></li>
            <li><a className="hover:text-zinc-200 transition" href="#about">About</a></li>
            <li><a className="hover:text-zinc-200 transition" href="#features">Features</a></li>
            <li><a className="hover:text-zinc-200 transition" href="#how">How It Works</a></li>
          </ul>
        </div>
        <div className="space-y-3">
          <h3 className="text-zinc-200 font-medium tracking-wide text-xs uppercase">Connect</h3>
          <ul className="space-y-1 text-zinc-400 text-sm">
            <li>
              <a className="hover:text-white transition" href="https://space.reversed.dev" target="_blank" rel="noopener noreferrer">space.reversed.dev</a>
            </li>
            <li>
              <a className="hover:text-white transition" href="https://github.com/Space-Banane" target="_blank" rel="noopener noreferrer">GitHub: Space-Banane</a>
            </li>
          </ul>
          <div className="pt-2 text-[11px] text-zinc-500">&copy; {new Date().getFullYear()} iamsoprintingit.com</div>
        </div>
      </div>
    </footer>
  );
}
