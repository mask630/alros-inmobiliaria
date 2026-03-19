
import { CheckCircle2, UserCheck, ShieldCheck, Home } from "lucide-react";

export default function ServiciosPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-8 text-center">Nuestros Servicios</h1>
            <p className="text-xl text-slate-600 text-center max-w-2xl mx-auto mb-16">
                Ofrecemos un servicio integral para cubrir todas tus necesidades inmobiliarias en la Costa del Sol.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <ServiceCard
                    title="Compra-Venta"
                    desc="Gestión completa de la compraventa de inmuebles. Te acompañamos desde la búsqueda hasta la firma ante notario."
                    icon={<Home className="h-8 w-8 text-[hsl(323,84%,29%)]" />}
                />
                <ServiceCard
                    title="Alquileres"
                    desc="Gestión de alquileres de larga temporada y vacacionales. Búsqueda de inquilinos solventes y gestión de contratos."
                    icon={<UserCheck className="h-8 w-8 text-[hsl(323,84%,29%)]" />}
                />
                <ServiceCard
                    title="Asesoramiento Inmobiliario"
                    desc="Acompañamiento profesional para asegurar que tus operaciones inmobiliarias se gestionen de forma correcta y transparente."
                    icon={<ShieldCheck className="h-8 w-8 text-[hsl(323,84%,29%)]" />}
                />
                <ServiceCard
                    title="Valoraciones"
                    desc="Tasaciones profesionales ajustadas al precio real de mercado para que vendas al mejor precio."
                    icon={<CheckCircle2 className="h-8 w-8 text-[hsl(323,84%,29%)]" />}
                />
            </div>
        </div>
    );
}

function ServiceCard({ title, desc, icon }: { title: string, desc: string, icon: React.ReactNode }) {
    return (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="mb-4">{icon}</div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
            <p className="text-slate-600 leading-relaxed">{desc}</p>
        </div>
    );
}
