"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, Mail, Phone, MessageCircle } from 'lucide-react';

const OFFICE_ADDRESS = "Avenida Juan Luis Peralta 22, 29639 Benalmádena, Málaga";
const GOOGLE_MAPS_URL = "https://maps.google.com/?q=Avenida+Juan+Luis+Peralta+22,+29639+Benalmádena,+Málaga";
const WHATSAPP_NUMBER = "34691687316";

export function Footer() {
    const pathname = usePathname();
    const isEnglish = pathname?.startsWith('/en');

    if (pathname?.startsWith('/admin')) return null;

    return (
        <footer className="bg-slate-900 text-slate-200 py-12">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">

                {/* Brand */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white">ALROS INVESTMENTS S.L.</h3>
                    <p className="text-slate-400 text-sm">
                        {isEnglish 
                            ? "Company with extensive experience in the real estate sector since 1992. Transparency, professionalism and trust."
                            : "Empresa con amplia experiencia en el sector inmobiliario desde 1992. Transparencia, profesionalidad y confianza."}
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 className="font-semibold text-white mb-4">{isEnglish ? "Sections" : "Secciones"}</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link href={isEnglish ? "/en/propiedades" : "/propiedades"} className="hover:text-[#ff4d8c] transition-colors">{isEnglish ? "Our Properties" : "Nuestras Propiedades"}</Link></li>
                        <li><Link href={isEnglish ? "/en/propiedades?operation=alquiler" : "/propiedades?operation=alquiler"} className="hover:text-[#ff4d8c] transition-colors">{isEnglish ? "Rentals" : "Alquileres"}</Link></li>
                        <li><Link href={isEnglish ? "/en/propiedades?operation=venta" : "/propiedades?operation=venta"} className="hover:text-[#ff4d8c] transition-colors">{isEnglish ? "Sales" : "Ventas"}</Link></li>
                        <li><Link href={isEnglish ? "/en/nosotros" : "/nosotros"} className="hover:text-[#ff4d8c] transition-colors">{isEnglish ? "About Us" : "Quiénes Somos"}</Link></li>
                        <li><Link href={isEnglish ? "/en/tasacion" : "/tasacion"} className="hover:text-[#ff4d8c] transition-colors">{isEnglish ? "Property Valuation" : "Valorar Inmueble"}</Link></li>
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h4 className="font-semibold text-white mb-4">{isEnglish ? "Contact" : "Contacto"}</h4>
                    <ul className="space-y-3 text-sm">
                        {/* Address with Google Maps link */}
                        <li className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-[#ff4d8c] shrink-0 mt-0.5" />
                            <a
                                href={GOOGLE_MAPS_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-[#ff4d8c] transition-colors"
                            >
                                {OFFICE_ADDRESS}
                            </a>
                        </li>

                        {/* Phone - Clickable */}
                        <li className="flex items-center gap-3">
                            <Phone className="h-5 w-5 text-[#ff4d8c] shrink-0" />
                            <a href="tel:+34691687316" className="hover:text-[#ff4d8c] transition-colors">
                                691 687 316
                            </a>
                        </li>

                        {/* WhatsApp */}
                        <li className="flex items-center gap-3">
                            <MessageCircle className="h-5 w-5 text-green-500 shrink-0" />
                            <a
                                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-400 hover:text-green-300 transition-colors"
                            >
                                {isEnglish ? "Send WhatsApp" : "Enviar WhatsApp"}
                            </a>
                        </li>

                        {/* Email - Link to Contact Page */}
                        <li className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-[#ff4d8c] shrink-0" />
                            <Link href={isEnglish ? "/en/contacto" : "/contacto"} className="hover:text-[#ff4d8c] transition-colors">
                                Isaac.alros@gmail.com
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Legal */}
                <div>
                    <h4 className="font-semibold text-white mb-4">Legal</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link href={isEnglish ? "/en/aviso-legal" : "/aviso-legal"} className="hover:text-[#ff4d8c] transition-colors">{isEnglish ? "Legal Notice" : "Aviso Legal"}</Link></li>
                        <li><Link href={isEnglish ? "/en/privacidad" : "/privacidad"} className="hover:text-[#ff4d8c] transition-colors">{isEnglish ? "Privacy Policy" : "Política de Privacidad"}</Link></li>
                        <li><Link href={isEnglish ? "/en/cookies" : "/cookies"} className="hover:text-[#ff4d8c] transition-colors">{isEnglish ? "Cookie Policy" : "Política de Cookies"}</Link></li>
                    </ul>
                </div>
            </div>

            <div className="container mx-auto px-4 mt-8 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
                <p>&copy; {new Date().getFullYear()} Alros Investments S.L. {isEnglish ? "All rights reserved." : "Todos los derechos reservados."} CIF: B92476977</p>
            </div>
        </footer>
    );
}
