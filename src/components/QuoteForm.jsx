import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config.js';
import { Calculator, CheckCircle2, ChevronRight, Loader2, ShieldCheck, Vote, MessageSquareText } from 'lucide-react';
import {
    calculateProcessPricing,
    ELECTION_EVENT_TYPES,
    formatCLP,
    SURVEY_EVENT_TYPES
} from '../utils/pricing.js';

const QuoteForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        processKind: 'election',
        votersCount: 100,
        eventType: 'Sindicatos',
        modules: [],
        technicalSupport: false,
        fullAuditPackage: false
    });

    const [status, setStatus] = useState('idle');
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [couponMsg, setCouponMsg] = useState({ type: '', text: '' });

    const pricing = useMemo(() => {
        return calculateProcessPricing({
            processKind: formData.processKind,
            votersCount: formData.votersCount,
            modules: {
                virtualAssembly: formData.modules.includes('virtual_assembly'),
                technicalSupport: formData.technicalSupport,
                fullAuditPackage: formData.fullAuditPackage
            },
            discountPercentage: discount,
            freeSchoolBenefit: formData.processKind === 'election' && formData.eventType === 'Colegios'
        });
    }, [formData, discount]);

    const eventTypeOptions = formData.processKind === 'survey'
        ? SURVEY_EVENT_TYPES
        : ELECTION_EVENT_TYPES;

    const handleProcessKindChange = (kind) => {
        setFormData((prev) => ({
            ...prev,
            processKind: kind,
            eventType: kind === 'survey' ? 'Encuesta Ciudadana' : 'Sindicatos'
        }));
    };

    const handleApplyCoupon = async (e) => {
        e.preventDefault();
        if (!couponCode.trim()) return;
        try {
            setCouponMsg({ type: '', text: '' });
            const res = await axios.post(`${API_URL}/api/coupons/validate`, { code: couponCode });
            setDiscount(res.data.discountPercentage);
            setCouponMsg({ type: 'success', text: `Cupón del ${res.data.discountPercentage}% aplicado.` });
        } catch (err) {
            setDiscount(0);
            setCouponMsg({ type: 'error', text: err.response?.data?.message || 'Cupón inválido o expirado.' });
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            if (name === 'modules') {
                setFormData((prev) => ({
                    ...prev,
                    modules: checked
                        ? [...prev.modules, value]
                        : prev.modules.filter((m) => m !== value)
                }));
            } else {
                setFormData((prev) => ({ ...prev, [name]: checked }));
            }
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        try {
            await axios.post(`${API_URL}/api/quotes`, {
                ...formData,
                couponCode: discount > 0 ? couponCode : ''
            });
            setStatus('success');
            setFormData({
                name: '',
                email: '',
                phone: '',
                processKind: 'election',
                votersCount: 100,
                eventType: 'Sindicatos',
                modules: [],
                technicalSupport: false,
                fullAuditPackage: false
            });
            setCouponCode('');
            setDiscount(0);
            setCouponMsg({ type: '', text: '' });
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
                    className="mt-6 px-6 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-semibold"
                >
                    Nueva cotización
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 text-slate-900">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-500 rounded-xl text-white shadow-lg shadow-blue-500/30">
                    <Calculator size={24} />
                </div>
                <div>
                    <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        Cotización Instantánea
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">Precios claros en CLP · Web3 incluido</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-3 bg-slate-100 p-1.5 rounded-2xl">
                    <button
                        type="button"
                        onClick={() => handleProcessKindChange('election')}
                        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-bold transition-all ${
                            formData.processKind === 'election'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <Vote size={16} /> Votación Formal
                    </button>
                    <button
                        type="button"
                        onClick={() => handleProcessKindChange('survey')}
                        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-bold transition-all ${
                            formData.processKind === 'survey'
                                ? 'bg-white text-cyan-600 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <MessageSquareText size={16} /> Encuesta Ciudadana
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Nombre completo</label>
                        <input required type="text" name="name" value={formData.name} onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                            placeholder="Juan Pérez" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Email institucional</label>
                        <input required type="email" name="email" value={formData.email} onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                            placeholder="juan@organizacion.cl" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-sm font-semibold text-slate-700">
                                {formData.processKind === 'survey' ? 'Participantes Estimados' : 'Número de Votantes'}
                            </label>
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
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Tipo de Evento</label>
                        <select name="eventType" value={formData.eventType} onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-white text-slate-800 cursor-pointer">
                            {eventTypeOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt === 'Colegios' ? 'Colegios (Gratis 1 vez al año)' : opt}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700 leading-none block">Módulos y Paquetes Extra</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <label className="flex items-center justify-between gap-2 p-3.5 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                            <span className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
                                <input type="checkbox" name="modules" value="virtual_assembly"
                                    checked={formData.modules.includes('virtual_assembly')} onChange={handleChange}
                                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                Asamblea Virtual
                            </span>
                            <span className="text-xs font-bold text-slate-500">+$150.000</span>
                        </label>
                        <label className={`flex items-center justify-between gap-2 p-3.5 border rounded-xl cursor-pointer transition-colors ${formData.fullAuditPackage ? 'bg-slate-50 border-slate-200 opacity-75' : 'border-slate-200 hover:bg-slate-50'}`}>
                            <span className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
                                <input type="checkbox" name="technicalSupport"
                                    checked={formData.technicalSupport || formData.fullAuditPackage}
                                    disabled={formData.fullAuditPackage}
                                    onChange={handleChange}
                                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                Soporte Técnico
                            </span>
                            <span className="text-xs font-bold text-slate-500">
                                {formData.fullAuditPackage ? 'Incluido' : '+$100.000'}
                            </span>
                        </label>
                    </div>

                    <label className={`flex items-start justify-between gap-3 p-4 border rounded-2xl cursor-pointer transition-all ${
                        formData.fullAuditPackage ? 'border-amber-400 bg-amber-50/70' : 'border-slate-200 hover:bg-slate-50'
                    }`}>
                        <span className="flex items-start gap-3">
                            <input type="checkbox" name="fullAuditPackage"
                                checked={formData.fullAuditPackage} onChange={handleChange}
                                className="w-5 h-5 mt-0.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500" />
                            <span>
                                <span className="text-sm font-bold text-slate-900 block">
                                    Paquete Completo de Auditorías + Revisión Admin
                                </span>
                                <span className="text-xs text-slate-600 block mt-0.5">
                                    Incluye evaluación previa por administrador, validación de padrón, soporte dedicado e informe pericial Web3. Sin este paquete, tu evento se activa automáticamente sin espera.
                                </span>
                            </span>
                        </span>
                        <span className="text-xs font-black text-amber-700 shrink-0">+$220.000</span>
                    </label>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Código de Cupón</label>
                    <div className="flex gap-3">
                        <input type="text" placeholder="Ingresa tu código aquí..." value={couponCode} onChange={(e) => setCouponCode(e.target.value)}
                            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 font-bold placeholder:font-normal placeholder:text-slate-400" />
                        <button type="button" onClick={handleApplyCoupon} className="px-6 py-3 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-700 transition">Aplicar</button>
                    </div>
                    {couponMsg.text && (
                        <p className={`text-sm font-semibold pl-2 ${couponMsg.type === 'error' ? 'text-red-500' : 'text-emerald-600'}`}>
                            {couponMsg.text}
                        </p>
                    )}
                </div>

                <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl space-y-4">
                    <div className="space-y-1.5 text-xs text-slate-300 border-b border-slate-700/70 pb-3">
                        <div className="flex justify-between">
                            <span>Tarifa base ({formData.processKind === 'survey' ? 'Encuesta' : 'Votación'} + Web3)</span>
                            <span className="font-bold text-white">{formatCLP(pricing.baseFee)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>{pricing.votersCount} participantes × ${pricing.perVoterRate} CLP</span>
                            <span className="font-bold text-white">{formatCLP(pricing.participantsFee)}</span>
                        </div>
                        {pricing.modulesFee > 0 && (
                            <div className="flex justify-between">
                                <span>Módulos y paquetes extra</span>
                                <span className="font-bold text-white">{formatCLP(pricing.modulesFee)}</span>
                            </div>
                        )}
                        {pricing.discountAmount > 0 && (
                            <div className="flex justify-between text-emerald-400 font-bold">
                                <span>{pricing.freeSchoolBenefit ? 'Beneficio Escolar (100%)' : `Descuento (${pricing.discountPercentage}%)`}</span>
                                <span>-{formatCLP(pricing.discountAmount)}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <p className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-1">
                                Total estimado
                            </p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-extrabold tracking-tight">${pricing.total.toLocaleString('es-CL')}</span>
                                <span className="text-slate-400 text-sm">CLP</span>
                            </div>
                            <p className="text-[11px] text-cyan-300 mt-1 flex items-center gap-1 font-medium">
                                <ShieldCheck size={12} />
                                {pricing.requiresAdminReview
                                    ? 'Incluye validación previa por administrador'
                                    : 'Activación automática sin revisión manual'}
                            </p>
                        </div>
                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full md:w-auto px-7 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/40 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
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

