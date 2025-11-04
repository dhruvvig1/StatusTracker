import visaLogo from "@assets/visa-logo-white_1762233670682.png";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export function Header() {
  const [location] = useLocation();
  
  const navLinks = [
    { href: "/", label: "Project Status" },
    { href: "/standup", label: "Sprint Standup" },
  ];
  
  return (
    <header className="sticky top-0 z-50 h-16 border-b px-6 flex items-center gap-4" style={{ backgroundColor: '#1434CB' }}>
      <Link href="/" data-testid="link-home">
        <img src={visaLogo} alt="Visa" className="h-8 cursor-pointer" data-testid="img-visa-logo" />
      </Link>
      <h1 className="text-xl font-bold text-white" data-testid="text-app-title">
        AIStandup
      </h1>
      
      <nav className="flex gap-3 ml-auto">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Button
              variant={location === link.href ? "secondary" : "ghost"}
              className={location === link.href ? "bg-white/20 text-white hover:bg-white/30" : "text-white hover:bg-white/10"}
              data-testid={`nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {link.label}
            </Button>
          </Link>
        ))}
      </nav>
    </header>
  );
}
