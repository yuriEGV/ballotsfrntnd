import React from 'react';
import { Link } from 'react-router-dom';
import { Box, ShieldCheck, GraduationCap, ChevronLeft, Target } from 'lucide-react';

const Plataforma = () => {
    return (
        <div className="min-h-screen bg-slate-900 text-slate-50 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px] -z-10" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[100px] -z-10" />

            {/* Nav */}
            <nav className="p-8 xl:px-32 flex items-center justify-between relative z-10 border-b border-slate-800">
                <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-medium">
                    <ChevronLeft size={20} /> Volver al Inicio
                </Link>
                <div className="font-extrabold text-2xl tracking-tight text-white">Ballots <span className="text-blue-500">Einsoft</span></div>
            </nav>

            <main className="max-w-5xl mx-auto px-8 py-20 relative z-10 space-y-24">

                {/* Hero Section */}
                <section className="text-center space-y-6">
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                        Cómo funciona nuestro Sistema
                    </h1>
                    <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
                        Nuestra arquitectura está diseñada bajo los más estrictos estándares de la Ley 18.700,
                        asegurando procesos transparentes, auditables y completamente anónimos.
                    </p>
                </section>

                {/* La Caja Negra */}
                <section className="bg-slate-800/50 border border-slate-700 p-10 md:p-14 rounded-3xl shadow-2xl backdrop-blur-md relative overflow-hidden group hover:border-blue-500/50 transition-all">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-900/50 rounded-full blur-3xl group-hover:bg-blue-900/20 transition-all -z-10" />
                    <div className="flex flex-col md:flex-row gap-12 items-center">
                        <div className="md:w-1/3 flex justify-center">
                            <div className="relative">
                                <div className="absolute inset-0 border-2 border-blue-500/30 rounded-3xl transform rotate-6 scale-105 animate-pulse" />
                                <div className="w-48 h-48 bg-gradient-to-br from-slate-900 to-black rounded-3xl shadow-[0_0_50px_rgba(59,130,246,0.3)] flex items-center justify-center border border-slate-800 relative z-10">
                                    <Box size={80} className="text-blue-500" strokeWidth={1.5} />
                                </div>
                            </div>
                        </div>
                        <div className="md:w-2/3 space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-semibold text-sm">
                                <Target size={16} /> Tecnología de Precisión
                            </div>
                            <h2 className="text-3xl font-bold text-white">La «Caja Negra» Criptográfica</h2>
                            <p className="text-lg text-slate-300 leading-relaxed">
                                El núcleo de Ballots Einsoft opera bajo el concepto de una <strong>caja negra elaborada con técnicas de precisión matemática</strong> para el éxito rotundo de las votaciones.
                            </p>
                            <p className="text-slate-400 leading-relaxed">
                                Una vez que el voto es emitido, ingresa a este entorno inmutable y sellado. Registramos el IP, verificamos la identidad mediante la Cédula (y padrón restringido) y se asigna el peso correspondiente sin asociar la identidad al voto final. Esto garantiza el secreto absoluto mientras mantiene una auditabilidad trazable de extremo a extremo para las autoridades.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Free Tier for Schools */}
                <section className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6 order-2 md:order-1">
                        <h2 className="text-3xl font-bold flex items-center gap-3">
                            <GraduationCap className="text-indigo-400" size={36} /> Plan Gratis para Colegios
                        </h2>
                        <p className="text-lg text-slate-300 leading-relaxed">
                            En Ballots Einsoft creemos en fomentar la democracia desde las bases. Es por esto que ofrecemos nuestra plataforma de manera <strong>100% gratuita para Colegios y Establecimientos Educativos</strong>.
                        </p>
                        <ul className="space-y-4 pt-4">
                            <li className="flex items-start gap-3">
                                <ShieldCheck className="text-emerald-400 w-6 h-6 shrink-0" />
                                <span className="text-slate-400"><strong>Validación Institucional:</strong> El centro educativo debe pasar por un proceso de verificación para garantizar la autenticidad de la solicitud.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <ShieldCheck className="text-emerald-400 w-6 h-6 shrink-0" />
                                <span className="text-slate-400"><strong>1 Uso Anual Gratis:</strong> Cada colegio verificado puede utilizar la plataforma para sus elecciones (CEAL, directivas) 1 sola vez al año sin costo. Eventos posteriores tendrán costo regular.</span>
                            </li>
                        </ul>
                        <div className="pt-6">
                            <Link to="/" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/25 inline-block">
                                Solicitar Cuenta Colegio
                            </Link>
                        </div>
                    </div>

                    <div className="order-1 md:order-2 flex justify-center">
                        <img src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=600&h=600" alt="Estudiantes Votando" className="rounded-full w-80 h-80 object-cover border-8 border-slate-800 shadow-2xl" />
                    </div>
                </section>

            </main>
        </div>
    );
};

export default Plataforma;
