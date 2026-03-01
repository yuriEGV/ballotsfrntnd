import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calculator, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';

const QuoteForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        votersCount: 100,
        eventType: 'Sindicatos',
        modules: [],
        technicalSupport: false
    });

    const [estimatedCost, setEstimatedCost] = useState(0);
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [couponMsg, setCouponMsg] = useState({ type: '', text: '' });

    // Calculate price whenever inputs change (CLP)
    useEffect(() => {
        let base = 50000; // Base platform fee

        // Tiered pricing per voter in CLP
        if (formData.votersCount <= 100) base += formData.votersCount * 500;
        else if (formData.votersCount <= 500) base += formData.votersCount * 400;
        else if (formData.votersCount <= 2000) base += formData.votersCount * 300;
        else base += formData.votersCount * 200;

        // Add module costs
        if (formData.modules.includes('virtual_assembly')) base += 150000;

        // Tech support
        if (formData.technicalSupport) base += 100000;

        // Free tier for schools
        if (formData.eventType === 'Colegios') {
            base = 0;
        }

        let finalCost = base - (base * (discount / 100));
        setEstimatedCost(Math.round(finalCost));
    }, [formData, discount]);

    const handleApplyCoupon = async (e) => {
        e.preventDefault();
        try {
            setCouponMsg({ type: '', text: '' });
            const res = await axios.post('http://localhost:3000/api/coupons/validate', { code: couponCode });
            setDiscount(res.data.discountPercentage);
            setCouponMsg({ type: 'success', text: `¡Cupón del ${res.data.discountPercentage}% aplicado!` });
        } catch (err) {
            setDiscount(0);
            setCouponMsg({ type: 'error', text: err.response?.data?.message || 'Cupón inválido o expirado.' });
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            if (name === 'modules') {
                setFormData(prev => ({
                    ...prev,
                    modules: checked
                        ? [...prev.modules, value]
                        : prev.modules.filter(m => m !== value)
                }));
            } else {
                setFormData(prev => ({ ...prev, [name]: checked }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        try {
            await axios.post('http://localhost:3000/api/quotes', formData);
            setStatus('success');
            setFormData({
                name: '', email: '', phone: '', votersCount: 100,
                eventType: 'Sindicatos', modules: [], technicalSupport: false
            });
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 text-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">¡Cotización Enviada!</h3>
                <p className="text-slate-600">
                    Hemos recibido tus datos y te enviaremos una propuesta formal por correo en breve.
                </p>
                <button
                    onClick={() => setStatus('idle')}
                    className="mt-6 px-6 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                >
                    Nueva cotización
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-500 rounded-xl text-white shadow-lg shadow-blue-500/30">
                    <Calculator size={24} />
                </div>
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                    Cotización Instantánea
                </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Nombre completo</label>
                        <input required type="text" name="name" value={formData.name} onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                            placeholder="Juan Pérez" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Email institucional</label>
                        <input required type="email" name="email" value={formData.email} onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                            placeholder="juan@empresa.cl" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-sm font-semibold text-slate-700">Número de Votantes</label>
                            <span className="text-blue-600 font-bold">{formData.votersCount}</span>
                        </div>
                        <input type="range" name="votersCount" min="10" max="5000" step="10"
                            value={formData.votersCount} onChange={handleChange}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                        <div className="flex justify-between text-xs text-slate-400">
                            <span>10</span>
                            <span>2500</span>
                            <span>5000+</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Tipo de Evento</label>
                        <select name="eventType" value={formData.eventType} onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-white text-slate-800 cursor-pointer relative z-10 appearance-none">
                            <option value="Sindicatos" className="text-slate-800 bg-white">Sindicato</option>
                            <option value="Asociaciones" className="text-slate-800 bg-white">Asociación</option>
                            <option value="Juntas de Vecinos" className="text-slate-800 bg-white">Junta de Vecinos</option>
                            <option value="Copropiedades" className="text-slate-800 bg-white">Copropiedad / Edificio</option>
                            <option value="Empresas" className="text-slate-800 bg-white">Empresa</option>
                            <option value="Colegios" className="text-slate-800 bg-white">Colegios (Gratis 1 vez al año)</option>
                            <option value="Otro" className="text-slate-800 bg-white">Otro</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700 leading-none">Módulos Extra y Servicios</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                            <input type="checkbox" name="modules" value="virtual_assembly"
                                checked={formData.modules.includes('virtual_assembly')} onChange={handleChange}
                                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                            <span className="text-sm font-medium text-slate-700">Asamblea Virtual (Zoom Integrado)</span>
                        </label>
                        <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                            <input type="checkbox" name="technicalSupport"
                                checked={formData.technicalSupport} onChange={handleChange}
                                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                            <span className="text-sm font-medium text-slate-700">Acompañamiento Técnico Total</span>
                        </label>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Código de Cupón</label>
                    <div className="flex gap-4">
                        <input type="text" placeholder="Ingresa tu código aquí..." value={couponCode} onChange={(e) => setCouponCode(e.target.value)}
                            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 font-bold placeholder:font-normal placeholder:text-slate-400" />
                        <button type="button" onClick={handleApplyCoupon} className="px-6 py-3 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-700 transition">Aplicar</button>
                    </div>
                    {couponMsg.text && (
                        <p className={`text-sm font-semibold pl-2 ${couponMsg.type === 'error' ? 'text-red-500' : 'text-emerald-500'}`}>
                            {couponMsg.text}
                        </p>
                    )}
                </div>

                {/* Live Estimation card */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white my-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <p className="text-slate-300 font-medium mb-1">Costo estimado</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-extrabold tracking-tight">${estimatedCost.toLocaleString('es-CL')}</span>
                                <span className="text-slate-400">CLP</span>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full md:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/40 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-70"
                        >
                            {status === 'loading' ? <Loader2 className="animate-spin w-5 h-5" /> : 'Solicitar Propuesta'}
                            {status !== 'loading' && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </div>
                </div>

                {status === 'error' && (
                    <p className="text-red-500 text-sm font-medium text-center">Hubo un error al enviar tu solicitud. Intenta de nuevo.</p>
                )}
            </form>
        </div>
    );
};

export default QuoteForm;
