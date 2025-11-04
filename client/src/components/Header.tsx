import visaLogo from "@assets/visa-logo-white_1762233670682.png";
import { Link, useLocation } from "wouter";

export function Header() {
  const [location] = useLocation();
  
  const navLinks = [
    { href: "/", label: "Project Status" },
    { href: "/newsletter", label: "Newsletter" },
    { href: "/standup", label: "Sprint Standup" },
  ];
  
  return (
    <header className="sticky top-0 z-50 h-16 border-b px-6 flex items-center gap-4" style={{ backgroundColor: '#1434CB' }}>
      <Link href="/" data-testid="link-home">
        <img src={visaLogo} alt="Visa" className="h-8 cursor-pointer" data-testid="img-visa-logo" />
      </Link>
      
      <nav className="flex gap-6 ml-4">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <span
              className={`text-sm font-medium cursor-pointer transition-colors ${
                location === link.href
                  ? 'text-white border-b-2 border-white pb-1'
                  : 'text-white/70 hover:text-white'
              }`}
              data-testid={`nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {link.label}
            </span>
          </Link>
        ))}
      </nav>
      
      <h1 className="text-xl font-bold text-white ml-auto" data-testid="text-app-title">
        AIStandup
      </h1>
    </header>
  );
}
