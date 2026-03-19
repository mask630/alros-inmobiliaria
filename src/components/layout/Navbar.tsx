"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Phone, X, Home, Building2, Briefcase, Users, Mail, Tag } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Navbar() {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    const isEnglish = pathname?.startsWith('/en');

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close menu when clicking outside or on escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsMenuOpen(false);
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    // Prevent scroll when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMenuOpen]);

    if (pathname?.startsWith('/admin')) return null;

    const navLinks = isEnglish ? [
        { href: '/en', label: 'Home', icon: Home },
        { href: '/en/propiedades', label: 'Properties', icon: Building2 },
        { href: '/en/servicios', label: 'Services', icon: Briefcase },
        { href: '/en/nosotros', label: 'About Us', icon: Users },
        { href: '/en/contacto', label: 'Contact', icon: Mail },
    ] : [
        { href: '/', label: 'Inicio', icon: Home },
        { href: '/propiedades', label: 'Propiedades', icon: Building2 },
        { href: '/servicios', label: 'Servicios', icon: Briefcase },
        { href: '/nosotros', label: 'Nosotros', icon: Users },
        { href: '/contacto', label: 'Contacto', icon: Mail },
    ];

    const switchLanguagePath = (targetLang: 'es' | 'en') => {
        if (!pathname) return '/';
        if (targetLang === 'en') {
            if (pathname === '/') return '/en';
            return pathname.startsWith('/en') ? pathname : `/en${pathname}`;
        } else {
            if (pathname === '/en') return '/';
            // Need to handle /en/propiedades -> /propiedades
            return pathname.startsWith('/en/') ? pathname.substring(3) : pathname.startsWith('/en') ? '/' : pathname;
        }
    };

    return (
        <>
            <nav className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${isScrolled
                ? 'bg-white/98 shadow-lg backdrop-blur-md'
                : 'bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60'
                }`}>
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    {/* Logo */}
                    <Link href={isEnglish ? "/en" : "/"} className="flex items-center space-x-2 z-50">
                        <img src="/logo.png" alt="ALROS" className="h-12 w-auto object-contain" />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex gap-6 items-center">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <div className="flex items-center gap-2 mr-2 border-r pr-4 border-slate-200">
                            <Link href={switchLanguagePath('es')} className={`text-sm font-bold flex items-center gap-1 transition-colors ${!isEnglish ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
                                🇪🇸 ES
                            </Link>
                            <Link href={switchLanguagePath('en')} className={`text-sm font-bold flex items-center gap-1 transition-colors ${isEnglish ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
                                🇬🇧 EN
                            </Link>
                        </div>
                        <a href="tel:+34691687316" className="flex items-center gap-2 text-gray-600 hover:text-[hsl(323,84%,29%)] hidden lg:flex">
                            <Phone className="h-4 w-4" />
                            <span className="text-sm font-medium">691 687 316</span>
                        </a>
                        <Link href={isEnglish ? "/en/tasacion" : "/tasacion"} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-orange-500/20 whitespace-nowrap">
                            {isEnglish ? 'Sell your property' : 'Vende tu inmueble'}
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors z-50 flex items-center gap-2"
                        aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
                    >
                        {!isMenuOpen && (
                            <span className="text-xs font-bold mr-1 text-slate-800">{isEnglish ? 'EN' : 'ES'}</span>
                        )}
                        {isMenuOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={() => setIsMenuOpen(false)}
            />

            {/* Mobile Menu Panel */}
            <div
                className={`fixed top-0 right-0 h-full w-[280px] bg-white z-40 md:hidden transform transition-transform duration-300 ease-out shadow-2xl ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full pt-20 pb-6">
                    {/* Navigation Links */}
                    <div className="flex-1 px-4 space-y-1 mt-4">
                        {navLinks.map((link, index) => {
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all duration-200 font-medium animate-slideIn"
                                    style={{
                                        animationDelay: `${index * 50}ms`
                                    }}
                                >
                                    <Icon className="h-5 w-5" />
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="flex justify-center gap-8 px-4 py-4 border-t border-gray-100 mt-2">
                        <Link onClick={() => setIsMenuOpen(false)} href={switchLanguagePath('es')} className={`text-base font-bold flex items-center gap-2 transition-colors ${!isEnglish ? 'text-[#881337]' : 'text-slate-400 hover:text-slate-600'}`}>
                            🇪🇸 ES
                        </Link>
                        <Link onClick={() => setIsMenuOpen(false)} href={switchLanguagePath('en')} className={`text-base font-bold flex items-center gap-2 transition-colors ${isEnglish ? 'text-[#881337]' : 'text-slate-400 hover:text-slate-600'}`}>
                            🇬🇧 EN
                        </Link>
                    </div>

                    {/* CTA Section */}
                    <div className="px-4 space-y-3 pt-2">
                        <a
                            href="tel:+34691687316"
                            className="flex items-center justify-center gap-2 w-full py-3 text-gray-700 hover:text-[hsl(323,84%,29%)] bg-gray-50 rounded-xl font-medium transition-colors"
                        >
                            <Phone className="h-5 w-5" />
                            691 687 316
                        </a>
                        <Link
                            href={isEnglish ? "/en/tasacion" : "/tasacion"}
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center justify-center gap-2 w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-orange-500/20"
                        >
                            <Tag className="h-5 w-5" />
                            {isEnglish ? 'Sell your property' : 'Vende tu inmueble'}
                        </Link>
                    </div>

                    {/* Footer info */}
                    <div className="px-4 pt-4 text-center">
                        <p className="text-xs text-gray-400">
                            © 2024 Alros Investments S.L.
                        </p>
                    </div>
                </div>
            </div>

        </>
    );
}
