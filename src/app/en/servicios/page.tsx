import { CheckCircle2, UserCheck, ShieldCheck, Home } from "lucide-react";

export default function ServiciosPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-8 text-center">Our Services</h1>
            <p className="text-xl text-slate-600 text-center max-w-2xl mx-auto mb-16">
                We offer a comprehensive service to cover all your real estate needs on the Costa del Sol.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <ServiceCard
                    title="Buying & Selling"
                    desc="Complete management of real estate transactions. We accompany you from the search to the signing before a notary."
                    icon={<Home className="h-8 w-8 text-[hsl(323,84%,29%)]" />}
                />
                <ServiceCard
                    title="Rentals"
                    desc="Management of long-term and holiday rentals. Search for solvent tenants and contract management."
                    icon={<UserCheck className="h-8 w-8 text-[hsl(323,84%,29%)]" />}
                />
                <ServiceCard
                    title="Real Estate Advice"
                    desc="Professional accompaniment to ensure your real estate operations are managed correctly and transparently."
                    icon={<ShieldCheck className="h-8 w-8 text-[hsl(323,84%,29%)]" />}
                />
                <ServiceCard
                    title="Valuations"
                    desc="Professional appraisals adjusted to the real market price so you can sell at the best price."
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
