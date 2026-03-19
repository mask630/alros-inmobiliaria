import Image from "next/image";

export default function NosotrosPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-slate-900 mb-8 text-center">About Alros Investments S.L.</h1>

                <div className="prose prose-lg text-slate-600 mx-auto">
                    <p>
                        Alros Investments S.L. is a benchmark company in the real estate sector on the Costa del Sol,
                        established in Benalmádena since <strong>1992</strong>.
                    </p>
                    <p>
                        For over three decades, we have helped thousands of families, investors, and businesses find the perfect property.
                        Our success is based on deep knowledge of the local market and an unwavering commitment to
                        <strong> transparency, honesty, and professionalism</strong>.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Our Mission</h2>
                    <p>
                        To provide comprehensive and personalized advice, making the buying, selling, or renting process
                        simple, secure, and satisfying for our clients.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Why choose us?</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Physical office in the heart of Benalmádena.</li>
                        <li>Multilingual and expert team.</li>
                        <li>Wide portfolio of exclusive properties.</li>
                        <li>Comprehensive real estate advice.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
