
import Image from "next/image";

export default function NosotrosPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-slate-900 mb-8 text-center">Sobre Alros Investments S.L.</h1>

                <div className="prose prose-lg text-slate-600 mx-auto">
                    <p>
                        Alros Investments S.L. es una empresa referente en el sector inmobiliario de la Costa del Sol,
                        establecida en Benalmádena desde <strong>1992</strong>.
                    </p>
                    <p>
                        Durante más de tres décadas, hemos ayudado a miles de familias, inversores y empresas a encontrar la propiedad perfecta.
                        Nuestro éxito se basa en un profundo conocimiento del mercado local y en un compromiso inquebrantable con la
                        <strong> transparencia, la honestidad y la profesionalidad</strong>.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Nuestra Misión</h2>
                    <p>
                        Brindar un asesoramiento integral y personalizado, haciendo que el proceso de compra, venta o alquiler sea
                        sencillo, seguro y satisfactorio para nuestros clientes.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">¿Por qué nosotros?</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Oficina física en el corazón de Benalmádena.</li>
                        <li>Equipo multilingüe y experto.</li>
                        <li>Amplia cartera de propiedades exclusivas.</li>
                        <li>Asesoramiento inmobiliario integral.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
