export default function CookiesPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8 text-slate-900">Cookies Policy</h1>

            <div className="prose prose-slate max-w-none text-slate-600">
                <p>A cookie is a small text file that is stored in your browser when you visit almost any website. Its purpose is for the website to be able to remember your visit when you return to that page.</p>

                <h3 className="mt-8 mb-4 font-bold text-xl text-slate-800">1. Cookies used on this website</h3>
                <p>Following the guidelines of the Spanish Data Protection Agency, we proceed to detail the use of cookies made by this website in order to inform you as accurately as possible.</p>

                <ul className="list-disc pl-5 mt-4 space-y-2">
                    <li><strong>First-party cookies:</strong> These are cookies sent to the user's terminal equipment from a computer or domain managed by the editor itself and from which the service requested by the user is provided.</li>
                    <li><strong>Session cookies:</strong> Designed to collect and store data while the user accesses a website.</li>
                    <li><strong>Technical cookies:</strong> These allow the user to navigate through a website, platform, or application and use the different options or services that exist in it.</li>
                </ul>

                <h3 className="mt-8 mb-4 font-bold text-xl text-slate-800">2. Disabling or deleting cookies</h3>
                <p>At any time you may exercise your right to disable or delete cookies from this website. These actions are performed differently depending on the browser you are using.</p>

                <h3 className="mt-8 mb-4 font-bold text-xl text-slate-800">3. Additional notes</h3>
                <p>Neither this website nor its legal representatives are responsible for the content or the accuracy of the privacy policies that third parties mentioned in this cookie policy may have.</p>
            </div>
        </div>
    );
}
