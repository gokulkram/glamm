'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Heart, Menu, X, ChevronDown, Search } from 'lucide-react';
import AccountMenu from './AccountMenu';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';

interface NavChild {
  href: string;
  label: string;
}

interface NavLink {
  href: string;
  label: string;
  children?: NavChild[];
}

const navLinks: NavLink[] = [
  {
    href: '/shop',
    label: 'Shop',
    children: [
      { href: '/shop', label: 'All Products' },
      { href: '/shop?category=wavy', label: 'Wavy' },
      { href: '/shop?category=straight', label: 'Straight' },
      { href: '/shop?category=curly', label: 'Curly' },
      { href: '/shop?category=closures', label: 'Closures' },
      { href: '/shop?category=bulk-hair', label: 'Bulk Hair' },
    ],
  },
  {
    href: '/about',
    label: 'About',
    children: [
      { href: '/about', label: 'Our Story' },
      { href: '/how-to-use', label: 'How To Use' },
      { href: '/blog', label: 'Blog' },
    ],
  },
  {
    href: '/faq',
    label: 'Help',
    children: [
      { href: '/faq', label: 'FAQ' },
      { href: '/track-order', label: 'Track Order' },
      { href: '/shipping', label: 'Shipping Policy' },
      { href: '/how-to-pay', label: 'How To Pay' },
      { href: '/delivery-issues', label: 'Delivery Issues' },
    ],
  },
  {
    href: '/return-policy',
    label: 'Policies',
    children: [
      { href: '/return-policy', label: 'Refund & Exchange' },
      { href: '/privacy-policy', label: 'Privacy Policy' },
      { href: '/terms-of-service', label: 'Terms of Service' },
    ],
  },
  { href: '/contact', label: 'Contact' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const { getCartCount } = useCart();
  const { getWishlistCount } = useWishlist();

  const cartCount = getCartCount();
  const wishlistCount = getWishlistCount();

  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState('');
  const searchInput = useRef<HTMLInputElement>(null);

  // /shop already filters on ?q= — the header just puts a term in the URL and
  // sends you there, so results stay shareable and the back button works.
  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = term.trim();
    if (!q) return;
    setSearchOpen(false);
    setMobileMenuOpen(false);
    router.push(`/shop?q=${encodeURIComponent(q)}`);
  };

  const openSearch = () => {
    setSearchOpen(true);
    // The field is rendered by this same click, so focus after paint.
    requestAnimationFrame(() => searchInput.current?.focus());
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial scroll position

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 border-b border-border ${scrolled ? 'bg-white shadow-md' : 'bg-white'}`}>
      <div className="container-max">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <Image
              src="/glamm-logo.png"
              alt="Glamm Hair Extensions"
              width={1164}
              height={548}
              className="h-16 w-auto md:h-20 md:w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              link.children ? (
                <div key={link.label} className="relative group py-8">
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-text hover:text-accent transition-colors flex items-center gap-1"
                  >
                    {link.label}
                    <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
                  </Link>
                  {/* Dropdown revealed on hover */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-1 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200">
                    <div className="min-w-[220px] bg-white rounded-xl shadow-large border border-border overflow-hidden py-2">
                      {link.children.map((child) => (
                        <Link
                          key={child.href + child.label}
                          href={child.href}
                          className="block px-5 py-2.5 text-sm text-text hover:text-accent hover:bg-background transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-text hover:text-accent transition-colors relative group py-8"
                >
                  {link.label}
                  <span className="absolute bottom-7 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full"></span>
                </Link>
              )
            ))}
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-4">
            <AccountMenu />

            {/* Search — collapsed to an icon until asked for, so the bar stays clean */}
            {searchOpen ? (
              <form onSubmit={submitSearch} className="hidden md:flex items-center">
                <input
                  ref={searchInput}
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  onBlur={() => { if (!term.trim()) setSearchOpen(false); }}
                  onKeyDown={(e) => { if (e.key === 'Escape') { setTerm(''); setSearchOpen(false); } }}
                  placeholder="Search products…"
                  aria-label="Search products"
                  className="w-52 px-4 py-2 rounded-full border border-border bg-white text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
                />
                <button type="submit" className="p-2 hover:text-accent transition-colors" aria-label="Search">
                  <Search className="w-5 h-5" />
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={openSearch}
                className="hidden md:block p-2 hover:text-accent transition-colors"
                aria-label="Search products"
              >
                <Search className="w-6 h-6" />
              </button>
            )}

            <Link
              href="/wishlist"
              className="relative p-2 hover:text-accent transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-6 h-6" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              className="relative p-2 hover:text-accent transition-colors"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-white border-t border-border shadow-lg">
          <div className="container-max py-4 space-y-1">
            {/* On mobile the field lives in the menu rather than crowding the bar */}
            <form onSubmit={submitSearch} className="flex items-center gap-2 px-4 pb-3">
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search products…"
                aria-label="Search products"
                className="flex-1 px-4 py-2 rounded-full border border-border bg-white text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
              />
              <button type="submit" className="p-2 hover:text-accent transition-colors" aria-label="Search">
                <Search className="w-5 h-5" />
              </button>
            </form>
            {navLinks.map((link) => (
              link.children ? (
                <div key={link.label}>
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 text-text hover:text-accent font-medium rounded-lg transition-colors"
                    onClick={() => setOpenMobileGroup(openMobileGroup === link.label ? null : link.label)}
                  >
                    {link.label}
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${openMobileGroup === link.label ? 'rotate-180' : ''}`} />
                  </button>
                  {openMobileGroup === link.label && (
                    <div className="pl-4 pb-2 space-y-1">
                      {link.children.map((child) => (
                        <Link
                          key={child.href + child.label}
                          href={child.href}
                          className="block px-4 py-2 text-sm text-text-muted hover:text-accent hover:bg-background rounded-lg transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-4 py-3 text-text hover:text-accent hover:bg-background font-medium rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              )
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
