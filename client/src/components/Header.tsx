import visaLogo from "@assets/visa-logo-white_1762233670682.png";
import { Link } from "wouter";

export function Header() {
  return (
    <header className="sticky top-0 z-50 h-16 border-b px-6 flex items-center gap-4" style={{ backgroundColor: '#1434CB' }}>
      <Link href="/" data-testid="link-home">
        <img src={visaLogo} alt="Visa" className="h-8 cursor-pointer" data-testid="img-visa-logo" />
      </Link>
      <h1 className="text-xl font-bold text-white" data-testid="text-app-title">
        AIStandup
      </h1>
    </header>
  );
}
