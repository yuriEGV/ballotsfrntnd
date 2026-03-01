import React from 'react';
import { ShieldCheck, Smartphone, Users, FileCheck, ArrowRight, Activity, Handshake, Landmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import QuoteForm from '../components/QuoteForm';

const features = [
    { icon: Smartphone, title: "Multidispositivo", desc: "No importa si ingresas desde un celular, tablet o PC. ¡Lo único que importa es votar!" },
    { icon: ShieldCheck, title: "Seguridad y Auditoría", desc: "Validación del padrón en tiempo real, auditoría por IP y control de dispositivos." },
    { icon: Handshake, title: "Elecciones y Comités", desc: "Gestión de directivas, comités paritarios, censuras y reformas de estatutos laborales." },
    { icon: Activity, title: "Reportes en Línea", desc: "Resultados inmediatos, seguimiento de avance analítico y transparencia del proceso." }
];

const LandingPage = () => {
    return (
        <div className="w-full bg-slate-50 min-h-screen">
            {/* Navigation */}
            <nav className="fixed w-full flex justify-between items-center py-4 px-8 xl:px-32 bg-white/80 backdrop-blur-md z-50 border-b border-slate-200/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Landmark className="text-white w-5 h-5" />
                    </div>
                    <span className="font-extrabold text-2xl tracking-tight text-slate-900">Ballots <span className="text-blue-600">Einsoft</span></span>
                </div>
                <div className="hidden lg:flex gap-8 font-medium text-slate-600">
                    <Link to="/plataforma" className="hover:text-blue-600 transition-colors">Plataforma</Link>
                    <a href="#servicio" className="hover:text-blue-600 transition-colors">Servicio</a>
                    <a href="#cotizador" className="hover:text-blue-600 transition-colors">Planes y Precios</a>
                </div>
                <Link to="/login" className="px-6 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all cursor-pointer">
                    Ingresar
                </Link>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-40 pb-20 px-4 sm:px-8 xl:px-32 overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[100px]" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[100px]" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 font-semibold text-sm">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
                            </span>
                            Ley Chilena 18.700 (DFL 2) Ready
                        </div>

                        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
                            El Sistema de Votación <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                                Moderno y Simplificado
                            </span>
                        </h1>

                        <p className="text-lg text-slate-600 md:w-5/6 leading-relaxed">
                            Validación por medio del Padrón y Cédula de Identidad. Votación de Comités Paritarios, Directivas, Negociación Colectiva y Consultas con total seguridad e IP Tracking en la comodidad de tu casa, trabajo o transporte.
                        </p>

                        <div className="flex gap-4">
                            <a href="#cotizador" className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all hover:-translate-y-0.5 flex items-center gap-2">
                                Cotizar ahora <ArrowRight className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-3xl transform rotate-3 flex"></div>
                        <img src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=1200&h=800" alt="Ballots Einsoft App" className="rounded-3xl shadow-2xl relative z-10 w-full object-cover h-[500px]" />
                    </div>
                </div>
            </section>

            {/* Features List */}
            <section className="py-24 px-4 sm:px-8 xl:px-32 bg-white" id="servicio">
                <div className="mb-16 text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">La tranquilidad de un proceso íntegro</h2>
                    <p className="text-slate-600 text-lg">Ya sea para un sindicato de 5,000 personas o un comité de edificio, adaptamos los módulos a tu necesidad.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((fet, idx) => (
                        <div key={idx} className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-xl hover:border-blue-100 transition-all">
                            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 text-blue-600">
                                <fet.icon size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{fet.title}</h3>
                            <p className="text-slate-600 leading-relaxed">{fet.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Quote Section */}
            <section id="cotizador" className="py-24 px-4 sm:px-8 xl:px-32 relative bg-slate-900 text-white">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <div>
                        <h2 className="text-4xl font-extrabold mb-6">Cotización Instantánea</h2>
                        <p className="text-xl text-slate-400 mb-8 leading-relaxed">
                            Calcula de manera instantánea el costo de tu elección. Selecciona tus necesidades y nuestro equipo te asistirá para que nadie se pierda durante el proceso.
                        </p>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3"><FileCheck className="text-blue-500" /> Integraciones de validación (Cédula de Identidad)</li>
                            <li className="flex items-center gap-3"><FileCheck className="text-blue-500" /> Votaciones Ponderadas</li>
                            <li className="flex items-center gap-3"><FileCheck className="text-blue-500" /> Urnas cifradas desde inicio a fin</li>
                        </ul>
                    </div>
                    <div className="relative">
                        {/* Renders the quote form component */}
                        <div className="bg-slate-800 p-2 rounded-3xl overflow-hidden shadow-2xl">
                            <QuoteForm />
                        </div>
                    </div>
                </div>
            </section>

            {/* Coupons Section */}
            <section id="cupones" className="py-24 px-4 sm:px-8 xl:px-32 bg-white">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-sm mb-6">
                        🎟️ Cupones de Descuento
                    </div>
                    <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Ahorra en tu Votación</h2>
                    <p className="text-slate-600 text-lg">Administramos cupones exclusivos para organizaciones que realizan votaciones a gran escala. Consulta a tu ejecutivo de cuenta o pídelo al contratar.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {/* Tier 1 */}
                    <div className="relative bg-slate-50 rounded-3xl p-8 border border-slate-200 hover:shadow-xl hover:border-blue-200 transition-all group">
                        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600 text-3xl font-black group-hover:scale-110 transition-transform">
                            10%
                        </div>
                        <h3 className="text-xl font-extrabold text-slate-900 mb-2">Descuento Básico</h3>
                        <p className="text-slate-500 text-sm leading-relaxed mb-4">Ideal para organizaciones con votaciones estándar hasta 500 votantes. El cupón se aplica en el cotizador antes de enviar tu solicitud.</p>
                        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2 text-center">
                            <p className="text-blue-600 font-bold text-xs uppercase tracking-wide">Hasta 500 votantes</p>
                        </div>
                    </div>

                    {/* Tier 2 — Recommended */}
                    <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 shadow-2xl shadow-blue-500/30 scale-105 text-white">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wide shadow">
                            ⭐ Más Popular
                        </div>
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 text-white text-3xl font-black">
                            20%
                        </div>
                        <h3 className="text-xl font-extrabold mb-2">Descuento Esencial</h3>
                        <p className="text-blue-100 text-sm leading-relaxed mb-4">Para procesos medianos entre 500 y 2.000 votantes. Combina privacidad de datos y reportes en tiempo real con un ahorro significativo.</p>
                        <div className="bg-white/15 border border-white/20 rounded-xl px-4 py-2 text-center">
                            <p className="text-white font-bold text-xs uppercase tracking-wide">500 a 2.000 votantes</p>
                        </div>
                    </div>

                    {/* Tier 3 */}
                    <div className="relative bg-slate-50 rounded-3xl p-8 border border-slate-200 hover:shadow-xl hover:border-indigo-200 transition-all group">
                        <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 text-indigo-600 text-3xl font-black group-hover:scale-110 transition-transform">
                            40%
                        </div>
                        <h3 className="text-xl font-extrabold text-slate-900 mb-2">Descuento Premium</h3>
                        <p className="text-slate-500 text-sm leading-relaxed mb-4">Diseñado para procesos electorales de gran envergadura con más de 2.000 votantes, federaciones y confederaciones sindicales.</p>
                        <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2 text-center">
                            <p className="text-indigo-600 font-bold text-xs uppercase tracking-wide">Más de 2.000 votantes</p>
                        </div>
                    </div>
                </div>

                <p className="text-center text-slate-400 text-sm mt-10">
                    Los cupones son entregados por los administradores de Ballots Einsoft. <span className="font-semibold text-slate-600">Ingresa tu código en el cotizador</span> para aplicar el descuento automáticamente.
                </p>
            </section>

        </div>
    );
};

export default LandingPage;
