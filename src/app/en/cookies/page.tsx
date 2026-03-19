export default function CookiesPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8 text-slate-900">Política de Cookies</h1>

            <div className="prose prose-slate max-w-none">
                <p>Una cookie es un pequeño fichero de texto que se almacena en su navegador cuando visita casi cualquier página web. Su utilidad es que la web sea capaz de recordar su visita cuando vuelva a navegar por esa página.</p>

                <h3 className="mt-8 mb-4 font-bold text-xl">1. Cookies utilizadas en este sitio web</h3>
                <p>Siguiendo las directrices de la Agencia Española de Protección de Datos procedemos a detallar el uso de cookies que hace esta web con el fin de informarle con la máxima exactitud posible.</p>

                <ul className="list-disc pl-5 mt-4 space-y-2">
                    <li><strong>Cookies propias:</strong> Son aquellas que se envían al equipo terminal del usuario desde un equipo o dominio gestionado por el propio editor y desde el que se presta el servicio solicitado por el usuario.</li>
                    <li><strong>Cookies de sesión:</strong> Diseñadas para recabar y almacenar datos mientras el usuario accede a una página web.</li>
                    <li><strong>Cookies técnicas:</strong> Permiten al usuario la navegación a través de una página web, plataforma o aplicación y la utilización de las diferentes opciones o servicios que en ella existan.</li>
                </ul>

                <h3 className="mt-8 mb-4 font-bold text-xl">2. Desactivación o eliminación de cookies</h3>
                <p>En cualquier momento podrá ejercer su derecho de desactivación o eliminación de cookies de este sitio web. Estas acciones se realizan de forma diferente en función del navegador que esté usando.</p>

                <h3 className="mt-8 mb-4 font-bold text-xl">3. Notas adicionales</h3>
                <p>Ni esta web ni sus representantes legales se hacen responsables ni del contenido ni de la veracidad de las políticas de privacidad que puedan tener los terceros mencionados en esta política de cookies.</p>
            </div>
        </div>
    );
}
