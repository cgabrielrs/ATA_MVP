// import { BookOpen } from "lucide-react";

export function Header() {
  return (
    <header className="w-full border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/diniz-logo.png" width={150} height={150} alt="Logo Diniz" className="h-30 w-30" />
          <span className="text-sm font-bold tracking-tight text-foreground">
            Atas Diniz
          </span>
        </div>
        
        <nav className="flex items-center gap-6">
          <a href="#" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">Segurança</a>
          <div className="h-3 w-px bg-border" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 py-1 bg-muted rounded">
            v1.0
          </span>
        </nav>
      </div>
    </header>
  );
}
