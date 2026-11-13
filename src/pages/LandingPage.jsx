import React from 'react';
import {
    ShieldCheck, Smartphone, FileCheck, ArrowRight, Activity,
    Handshake, Landmark, MessageSquareText, Check, Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import QuoteForm from '../components/QuoteForm';

const features = [
    { icon: Smartphone, title: "Multidispositivo", desc: "Vota o responde encuestas desde celular, tablet o PC sin instalar apps ni extensiones Web3." },
    { icon: ShieldCheck, title: "Respaldo Web3 Real", desc: "Cada voto o respuesta genera un nullifier anónimo único y se ancla en Polygon sin exponer tu identidad." },
    { icon: Handshake, title: "Elecciones y Comités", desc: "Gestión de directivas, comités paritarios, sindicatos, copropiedades y reformas de estatutos." },
    { icon: MessageSquareText, title: "Plaza Ciudadana", desc: "Publica encuestas abiertas estilo panel ciudadano con métricas en vivo y sistema de puntos." }
];

const pricingPlans = [
    {
        name: "Encuesta / Plaza Ciudadana",
        badge: "Activación Automática",
        badgeColor: "bg-cyan-100 text-cyan-800",
        price: "$25.000",
        unit: "CLP base + desde $70/part.",
        description: "Ideal para consultas abiertas, estudios de opinión y participación comunitaria.",
        features: [
            "Publicación en Plaza Ciudadana (/plaza)",
            "Encuestas de 1 o múltiples preguntas",
            "Sistema de puntos cívicos y resultados en vivo",
            "1 persona = 1 respuesta vía Web3 (sin espera admin)"
        ],
        ctaLabel: "Explorar Plaza",
        ctaTo: "/plaza",
        highlight: false
    },
    {
        name: "Votación Autogestionada",
        badge: "Más Elegida · Sin Espera",
        badgeColor: "bg-blue-600 text-white",
        price: "$50.000",
        unit: "CLP base + desde $200/votante",
        description: "Pensada para sindicatos, juntas de vecinos, empresas y asociaciones que necesitan rapidez.",
        features: [
            "Activación inmediata tras el pago (sin evaluación admin)",
            "Padrón cerrado o abierto + ponderación de votos",
            "Doble factor OTP opcional y recibo en Polygonscan",
            "Colegios en Chile: 1 elección gratis al año"
        ],
        ctaLabel: "Crear Votación",
        ctaTo: "/login",
        highlight: true
    },
    {
        name: "Paquete Completo Auditorías",
        badge: "Supervisión Integral",
        badgeColor: "bg-amber-100 text-amber-800",
        price: "+$220.000",
        unit: "CLP adicional al proceso",
        description: "Para procesos críticos que requieren revisión previa y respaldo técnico de principio a fin.",
        features: [
            "Evaluación y autorización previa por administrador",
            "Soporte técnico dedicado incluido en vivo",
            "Validación documental de padrón electoral",
            "Acta pericial y verificación criptográfica Web3"
        ],
        ctaLabel: "Cotizar con Auditoría",
        ctaHref: "#cotizador",
        highlight: false
    }
];

const LandingPage = () => {
    return (
        <div className="w-full bg-slate-50 min-h-screen">
            <nav className="fixed w-full flex justify-between items-center py-4 px-6 xl:px-32 bg-white/85 backdrop-blur-md z-50 border-b border-slate-200/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Landmark className="text-white w-5 h-5" />
                    </div>
                    <span className="font-extrabold text-2xl tracking-tight text-slate-900">Ballots <span className="text-blue-600">Einsoft</span></span>
                </div>
                <div className="hidden lg:flex gap-8 font-medium text-slate-600 items-center">
                    <Link to="/plaza" className="hover:text-cyan-600 transition-colors font-semibold flex items-center gap-1.5">
                        <Sparkles size={15} className="text-cyan-500" /> Plaza Ciudadana
                    </Link>
                    <Link to="/plataforma" className="hover:text-blue-600 transition-colors">Plataforma</Link>
                    <a href="#precios" className="hover:text-blue-600 transition-colors">Planes y Precios</a>
                    <a href="#cotizador" className="hover:text-blue-600 transition-colors">Cotizador</a>
                </div>
                <div className="flex items-center gap-2.5">
                    <Link to="/plaza" className="lg:hidden px-3.5 py-2 bg-cyan-50 text-cyan-700 font-bold rounded-xl text-sm">
                        Plaza
                    </Link>
                    <Link to="/login" className="px-5 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all cursor-pointer">
                        Ingresar
                    </Link>
                </div>
            </nav>

            <section className="relative pt-36 pb-20 px-4 sm:px-8 xl:px-32 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[100px]" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[100px]" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 font-semibold text-sm">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
                            </span>
                            Votaciones y Encuestas con Respaldo Web3
                        </div>

                        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
                            Votaciones Seguras y <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600">
                                Plaza Ciudadana Web3
                            </span>
                        </h1>

                        <p className="text-lg text-slate-600 md:w-5/6 leading-relaxed">
                            Lanza votaciones autogestionadas o encuestas ciudadanas verificadas en blockchain con activación inmediata. Sin aprobaciones burocráticas innecesarias salvo que elijas nuestro Paquete Completo de Auditorías.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <Link to="/plaza" className="px-7 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/25 hover:opacity-95 transition-all flex items-center gap-2">
                                Explorar Plaza Ciudadana <MessageSquareText className="w-5 h-5" />
                            </Link>
                            <a href="#cotizador" className="px-7 py-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2">
                                Cotizar Proceso <ArrowRight className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-3xl transform rotate-3 flex"></div>
                        <img src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=1200&h=800" alt="Ballots Einsoft App" className="rounded-3xl shadow-2xl relative z-10 w-full object-cover h-[500px]" />
                    </div>
                </div>
            </section>

            <section className="py-20 px-4 sm:px-8 xl:px-32 bg-white" id="servicio">
                <div className="mb-14 text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">La tranquilidad de un proceso íntegro</h2>
                    <p className="text-slate-600 text-lg">Desde votaciones sindicales o directivas hasta encuestas públicas en nuestra Plaza Ciudadana, todo queda respaldado matemáticamente.</p>
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

            <section id="precios" className="py-20 px-4 sm:px-8 xl:px-32 bg-slate-50 border-y border-slate-200/70">
                <div className="text-center max-w-3xl mx-auto mb-14">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs uppercase tracking-wider mb-4">
                        <Activity size={14} /> Planes y Precios Ordenados
                    </div>
                    <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Elige según tu necesidad</h2>
                    <p className="text-slate-600 text-lg">Transparencia total desde el primer momento. Las modalidades estándar se activan automáticamente; solo el Paquete Completo de Auditorías pasa por evaluación de administrador.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {pricingPlans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`rounded-3xl p-8 flex flex-col justify-between transition-all ${
                                plan.highlight
                                    ? 'bg-slate-900 text-white shadow-2xl border-2 border-blue-500 scale-[1.02]'
                                    : 'bg-white text-slate-900 border border-slate-200 shadow-sm hover:shadow-xl'
                            }`}
                        >
                            <div>
                                <span className={`inline-block text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider mb-5 ${plan.badgeColor}`}>
                                    {plan.badge}
                                </span>
                                <h3 className="text-2xl font-extrabold mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-2 mb-3">
                                    <span className="text-4xl font-black">{plan.price}</span>
                                    <span className={`text-xs font-semibold ${plan.highlight ? 'text-slate-400' : 'text-slate-500'}`}>{plan.unit}</span>
                                </div>
                                <p className={`text-sm leading-relaxed mb-6 ${plan.highlight ? 'text-slate-300' : 'text-slate-600'}`}>
                                    {plan.description}
                                </p>
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feat) => (
                                        <li key={feat} className="flex items-start gap-2.5 text-sm">
                                            <Check size={16} className={`shrink-0 mt-0.5 ${plan.highlight ? 'text-cyan-400' : 'text-emerald-600'}`} />
                                            <span className={plan.highlight ? 'text-slate-200' : 'text-slate-700'}>{feat}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {plan.ctaTo ? (
                                <Link
                                    to={plan.ctaTo}
                                    className={`w-full py-3.5 px-5 rounded-xl font-bold text-center transition-all flex items-center justify-center gap-2 ${
                                        plan.highlight
                                            ? 'bg-blue-600 hover:bg-blue-500 text-white'
                                            : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                                    }`}
                                >
                                    {plan.ctaLabel} <ArrowRight size={16} />
                                </Link>
                            ) : (
                                <a
                                    href={plan.ctaHref}
                                    className="w-full py-3.5 px-5 rounded-xl font-bold text-center transition-all flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white"
                                >
                                    {plan.ctaLabel} <ArrowRight size={16} />
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            <section id="cotizador" className="py-24 px-4 sm:px-8 xl:px-32 relative bg-slate-900 text-white">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    <div>
                        <h2 className="text-4xl font-extrabold mb-6">Cotización Instantánea</h2>
                        <p className="text-xl text-slate-400 mb-8 leading-relaxed">
                            Calcula el valor exacto para tu votación formal o encuesta en la Plaza Ciudadana. Si tienes un cupón obtenido por participar o entregado por un ejecutivo, aplícalo aquí mismo.
                        </p>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3"><FileCheck className="text-blue-500" /> Validación por RUT / Cédula y nullifier anónimo Web3</li>
                            <li className="flex items-center gap-3"><FileCheck className="text-cyan-400" /> Encuestas multi-pregunta en Plaza Ciudadana</li>
                            <li className="flex items-center gap-3"><FileCheck className="text-emerald-400" /> Activación inmediata sin esperas salvo Paquete Auditorías</li>
                        </ul>
                    </div>
                    <div className="relative">
                        <div className="bg-slate-800 p-2 rounded-3xl overflow-hidden shadow-2xl">
                            <QuoteForm />
                        </div>
                    </div>
                </div>
            </section>

            <section id="cupones" className="py-24 px-4 sm:px-8 xl:px-32 bg-white">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-sm mb-6">
                        Cupones y Puntos Ciudadanos
                    </div>
                    <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Ahorra en tu Votación o Encuesta</h2>
                    <p className="text-slate-600 text-lg">Usa cupones institucionales o canjea puntos participando en la Plaza Ciudadana.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    <div className="relative bg-slate-50 rounded-3xl p-8 border border-slate-200 hover:shadow-xl hover:border-blue-200 transition-all group">
                        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600 text-3xl font-black group-hover:scale-110 transition-transform">
                            10%
                        </div>
                        <h3 className="text-xl font-extrabold text-slate-900 mb-2">Descuento Básico</h3>
                        <p className="text-slate-500 text-sm leading-relaxed mb-4">Ideal para organizaciones con procesos hasta 500 votantes o consultas comunitarias.</p>
                        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2 text-center">
                            <p className="text-blue-600 font-bold text-xs uppercase tracking-wide">Hasta 500 participantes</p>
                        </div>
                    </div>

                    <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 shadow-2xl shadow-blue-500/30 scale-105 text-white">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wide shadow">
                            Más Popular
                        </div>
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 text-white text-3xl font-black">
                            15-30%
                        </div>
                        <h3 className="text-xl font-extrabold mb-2">Canje Plaza Ciudadana</h3>
                        <p className="text-blue-100 text-sm leading-relaxed mb-4">Participa en encuestas públicas, suma puntos cívicos y canjea cupones reales desde tu perfil.</p>
                        <Link to="/plaza" className="block bg-white/20 hover:bg-white/30 border border-white/25 rounded-xl px-4 py-2 text-center transition-colors">
                            <p className="text-white font-bold text-xs uppercase tracking-wide">Ir a Plaza Ciudadana</p>
                        </Link>
                    </div>

                    <div className="relative bg-slate-50 rounded-3xl p-8 border border-slate-200 hover:shadow-xl hover:border-indigo-200 transition-all group">
                        <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 text-indigo-600 text-3xl font-black group-hover:scale-110 transition-transform">
                            40%
                        </div>
                        <h3 className="text-xl font-extrabold text-slate-900 mb-2">Descuento Gran Escala</h3>
                        <p className="text-slate-500 text-sm leading-relaxed mb-4">Diseñado para federaciones, confederaciones y encuestas nacionales de más de 2.000 participantes.</p>
                        <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2 text-center">
                            <p className="text-indigo-600 font-bold text-xs uppercase tracking-wide">Más de 2.000 participantes</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;

