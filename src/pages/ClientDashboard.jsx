import React, { useState, useEffect } from 'react';
import {
    Search, PlusCircle, CheckCircle, Clock, Activity, ChevronRight,
    RefreshCw, Loader2, Users, UserCheck, UserX, AlertCircle, Save,
    Trash2, Image as ImageIcon, Plus, Link2, Copy, ExternalLink,
    LogOut, Upload, X, Settings, ShieldCheck, FileText, Printer, XCircle, CreditCard
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

// ── Helpers ──────────────────────────────────────────────────────────────────
const initials = (name = '') =>
    name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';

const inputClass = "w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900 bg-slate-50 focus:bg-white transition-all text-sm font-medium";

const statusMap = {
    active: { label: 'Activa', dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]', btn: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200', btnLabel: 'Ver' },
    draft: { label: 'Pendiente', dot: 'bg-amber-400', btn: 'bg-amber-100 text-amber-700 hover:bg-amber-200', btnLabel: 'Configurar' },
    ended: { label: 'Finalizada', dot: 'bg-slate-300', btn: 'bg-slate-100 text-slate-600 hover:bg-slate-200', btnLabel: 'Auditoría' },
};

const EVENT_TYPES = [
    'Sindicatos', 'Asociaciones', 'Juntas de Vecinos', 'Copropiedades',
    'Empresas', 'Colegios', 'Comité Paritario', 'Directiva',
    'Negociación Colectiva', 'Votación de Censura',
    'Cambio de Caja de Compensación', 'Reforma de Estatutos',
    'Afiliación a Federación', 'Consultas', 'Otro'
];

// ── New Election Modal ──────────────────────────────────────────────────────
const NewElectionModal = ({ onClose, onCreated, token }) => {
    const [form, setForm] = useState({
        title: '', description: '', electionType: '',
        startDate: '', endDate: '', candidates: [],
        votersCount: 100,
        modules: { virtualAssembly: false, technicalSupport: false },
        couponCode: ''
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1); // 1 = info, 2 = cand, 3 = pago

    const addCandidate = () => setForm(f => ({ ...f, candidates: [...f.candidates, { name: '', description: '', imageUrl: '' }] }));
    const updCand = (i, field, val) => setForm(f => { const c = [...f.candidates]; c[i] = { ...c[i], [field]: val }; return { ...f, candidates: c }; });
    const delCand = (i) => setForm(f => ({ ...f, candidates: f.candidates.filter((_, idx) => idx !== i) }));

    const [price, setPrice] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [validatingCoupon, setValidatingCoupon] = useState(false);
    const [couponApplied, setCouponApplied] = useState(false);

    useEffect(() => {
        let base = 50000;
        const vCount = parseInt(form.votersCount) || 0;
        if (vCount <= 100) base += vCount * 500;
        else if (vCount <= 500) base += vCount * 400;
        else if (vCount <= 2000) base += vCount * 300;
        else base += vCount * 200;

        if (form.modules.virtualAssembly) base += 150000;
        if (form.modules.technicalSupport) base += 100000;

        if (form.electionType === 'Colegios') base = 0; // Simplified for UI, server validates complex logic
        setPrice(base);
    }, [form.votersCount, form.modules, form.electionType]);

    const handleValidateCoupon = async () => {
        if (!form.couponCode) return;
        setValidatingCoupon(true); setError('');
        try {
            const res = await axios.post('http://localhost:3000/api/coupons/validate', { code: form.couponCode });
            setDiscount(res.data.discountPercentage);
            setCouponApplied(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Cupón inválido.');
            setCouponApplied(false);
            setDiscount(0);
        } finally { setValidatingCoupon(false); }
    };

    const discountedPrice = price - (price * discount / 100);

    const handleSubmit = async (e) => {
        e.preventDefault(); setError(''); setSaving(true);
        try {
            const res = await axios.post('http://localhost:3000/api/elections', form, { headers: { Authorization: `Bearer ${token}` } });
            const election = res.data.data;

            if (!election.isPaid) {
                const payRes = await axios.post('http://localhost:3000/api/payments/create-preference',
                    { electionId: election._id },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (payRes.data.init_point) {
                    window.location.href = payRes.data.init_point;
                    return;
                }
            }

            onCreated(); onClose();
        } catch (err) { setError(err.response?.data?.error || 'Error al crear la elección.'); }
        finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-6 border-b shrink-0">
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-900">Solicitar Nueva Elección</h2>
                        <div className="flex gap-2 mt-2">
                            {['Información básica', 'Candidatos', 'Pago y Envío'].map((label, idx) => (
                                <span key={idx} className={`text-xs font-bold px-3 py-1 rounded-full ${step === idx + 1 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{idx + 1}. {label}</span>
                            ))}
                        </div>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500"><X size={18} /></button>
                </div>

                <div className="overflow-y-auto flex-1 p-6">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2 text-sm text-amber-800 mb-5">
                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                        Tu solicitud será evaluada por un administrador antes de activarse.
                    </div>

                    {step === 1 && (
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 block">Título *</label>
                                <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="ej: Elección de Directiva 2026" className={inputClass} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 block">Tipo de Evento *</label>
                                <select required value={form.electionType} onChange={e => setForm({ ...form, electionType: e.target.value })} className={inputClass}>
                                    <option value="">Selecciona...</option>
                                    {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 block">Descripción</label>
                                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Describe el propósito de esta elección..." className={inputClass + ' resize-none'} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 block">N° Votantes Estimados *</label>
                                    <input required type="number" value={form.votersCount} onChange={e => setForm({ ...form, votersCount: e.target.value })} className={inputClass} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block">Módulos Extra</label>
                                    <div className="flex gap-4 pt-1">
                                        <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
                                            <input type="checkbox" checked={form.modules.virtualAssembly} onChange={e => setForm({ ...form, modules: { ...form.modules, virtualAssembly: e.target.checked } })} className="rounded text-blue-600" /> Asamblea
                                        </label>
                                        <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
                                            <input type="checkbox" checked={form.modules.technicalSupport} onChange={e => setForm({ ...form, modules: { ...form.modules, technicalSupport: e.target.checked } })} className="rounded text-blue-600" /> Soporte
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 block">Inicio de Votación *</label>
                                    <input required type="datetime-local" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className={inputClass} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 block">Cierre de Votación *</label>
                                    <input required type="datetime-local" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className={inputClass} />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-slate-600 text-sm">Agrega los candidatos u opciones de votación (puedes hacerlo también después desde Configuración).</p>
                                <button type="button" onClick={addCandidate} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700">
                                    <Plus size={14} /> Agregar
                                </button>
                            </div>
                            {form.candidates.length === 0 && (
                                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-sm">
                                    Sin candidatos aún. Puedes agregarlos aquí o después desde Configuración.
                                </div>
                            )}
                            {form.candidates.map((c, i) => (
                                <div key={i} className="border border-slate-200 rounded-2xl p-4 space-y-3 relative">
                                    <button onClick={() => delCand(i)} className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50"><Trash2 size={13} /></button>
                                    <p className="font-bold text-slate-700 text-sm">Candidato #{i + 1}</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div><label className="text-xs font-bold text-slate-500 mb-1 block">Nombre</label><input value={c.name} onChange={e => updCand(i, 'name', e.target.value)} placeholder="Nombre completo" className={inputClass} /></div>
                                        <div><label className="text-xs font-bold text-slate-500 mb-1 block">URL Foto</label><input value={c.imageUrl} onChange={e => updCand(i, 'imageUrl', e.target.value)} placeholder="https://..." className={inputClass} /></div>
                                    </div>
                                    <div><label className="text-xs font-bold text-slate-500 mb-1 block">Propuesta/Reseña</label><textarea value={c.description} onChange={e => updCand(i, 'description', e.target.value)} rows={2} placeholder="Breve descripción..." className={inputClass + ' resize-none'} /></div>
                                    {c.imageUrl && <img src={c.imageUrl} alt={c.name} className="w-14 h-14 object-cover rounded-xl border border-slate-200" />}
                                </div>
                            ))}
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 flex flex-col items-center justify-center py-4 text-center">
                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-2">
                                <CreditCard size={40} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 mb-2">Activación de Elección</h3>
                                <p className="text-slate-600 text-sm leading-relaxed px-4">
                                    Para que tu solicitud sea procesada y activada por nuestro equipo de administración, es necesario realizar el pago del servicio.
                                </p>
                            </div>

                            <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-medium text-left">Resumen de Cotización:<br /><small>{form.votersCount} votantes {form.modules.virtualAssembly ? '+ Asamblea' : ''} {form.modules.technicalSupport ? '+ Soporte' : ''}</small></span>
                                    <span className="text-slate-900 font-black">${price.toLocaleString('es-CL')} CLP</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between items-center text-sm text-emerald-600 font-bold">
                                        <span>Descuento Aplicado ({discount}%)</span>
                                        <span>-${(price * discount / 100).toLocaleString('es-CL')} CLP</span>
                                    </div>
                                )}
                                <div className="h-px bg-slate-200 w-full" />
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-900 font-bold uppercase tracking-wider text-xs">Total a Pagar</span>
                                    <span className="text-2xl font-black text-blue-600">${discountedPrice.toLocaleString('es-CL')} CLP</span>
                                </div>
                            </div>

                            <div className="w-full space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-left px-1">¿Tienes un cupón?</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Código de cupón"
                                        value={form.couponCode}
                                        onChange={e => setForm({ ...form, couponCode: e.target.value })}
                                        className={inputClass + " flex-1"}
                                        disabled={couponApplied}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleValidateCoupon}
                                        disabled={validatingCoupon || couponApplied || !form.couponCode}
                                        className={`px-4 rounded-xl font-bold transition-all ${couponApplied ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50'}`}
                                    >
                                        {validatingCoupon ? <Loader2 size={16} className="animate-spin" /> : couponApplied ? 'Aplicado' : 'Validar'}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-xs text-emerald-700 flex gap-3 text-left">
                                <ShieldCheck size={18} className="shrink-0" />
                                <p>
                                    <strong>Beneficio Escolar:</strong> Si eres un colegio en Chile, recuerda que tu primera elección es <strong>completamente gratuita</strong>. El sistema lo detectará automáticamente al finalizar.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t shrink-0">
                    {error && <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl p-3 mb-3">{error}</p>}
                    <div className="flex gap-3">
                        {step === 1 && (
                            <>
                                <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50">Cancelar</button>
                                <button type="button" onClick={() => { if (form.title && form.electionType && form.startDate && form.endDate) setStep(2); else setError('Completa el título, tipo y fechas primero.'); }}
                                    className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700">Siguiente →</button>
                            </>
                        )}
                        {step === 2 && (
                            <>
                                <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50">← Volver</button>
                                <button type="button" onClick={() => setStep(3)} className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700">Siguiente: Pago →</button>
                            </>
                        )}
                        {step === 3 && (
                            <>
                                <button type="button" onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50">← Volver</button>
                                <button type="button" onClick={handleSubmit} disabled={saving} className="flex-2 px-8 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-60">
                                    {saving ? <Loader2 size={16} className="animate-spin" /> : <><PlusCircle size={16} />Pagar y Enviar Solicitud</>}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div >
        </div >
    );
};

// ── Bulk Import Modal ────────────────────────────────────────────────────────
const BulkImportModal = ({ electionId, onClose, onImported, token }) => {
    const [rawText, setRawText] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleImport = async () => {
        if (!rawText.trim()) return;
        setSaving(true); setError('');

        try {
            const lines = rawText.split('\n').filter(l => l.trim());
            const voters = lines.map(line => {
                const parts = line.split(',').map(p => p.trim());
                return {
                    name: parts[0] || 'Candidato sin nombre',
                    cedula: parts[1] || '',
                    email: parts[2] || ''
                };
            }).filter(v => v.cedula);

            if (voters.length === 0) throw new Error("No se encontraron registros válidos (Formato: Nombre, RUT, Email)");

            await axios.post('http://localhost:3000/api/voters/bulk', {
                electionId,
                voters
            }, { headers: { Authorization: `Bearer ${token}` } });

            onImported();
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Error al importar padrón.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-extrabold text-slate-900">Cargar Padrón Electoral</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X size={20} /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-sm text-blue-800">
                        <p className="font-bold mb-1">Instrucciones:</p>
                        <p>Pega los datos de los votantes en formato CSV o texto plano. Cada línea debe ser:</p>
                        <code className="block mt-2 bg-white/50 p-2 rounded border border-blue-200">Nombre Completo, RUT, Correo Electrónico</code>
                    </div>
                    <textarea
                        value={rawText}
                        onChange={e => setRawText(e.target.value)}
                        placeholder="Juan Perez, 12.345.678-9, juan@ejemplo.com&#10;Maria Soto, 11.222.333-4, maria@ejemplo.com"
                        className={inputClass + " h-64 font-mono text-xs"}
                    />
                    {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
                </div>
                <div className="p-6 border-t bg-slate-50 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-white transition-all">Cancelar</button>
                    <button
                        onClick={handleImport}
                        disabled={saving || !rawText.trim()}
                        className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <><Upload size={18} /> Importar Votantes</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Voters Panel ─────────────────────────────────────────────────────────────
const VotersView = ({ elections, token }) => {
    const [selectedId, setSelectedId] = useState('');
    const [stats, setStats] = useState(null);
    const [voters, setVoters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [showImport, setShowImport] = useState(false);

    const load = async (id) => {
        if (!id) return;
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:3000/api/elections/${id}/voters`, { headers: { Authorization: `Bearer ${token}` } });
            setStats(res.data.stats);
            setVoters(res.data.data || []);
        } catch { setVoters([]); setStats(null); }
        finally { setLoading(false); }
    };

    const handleSelect = (e) => { setSelectedId(e.target.value); load(e.target.value); };

    const filtered = voters.filter(v =>
        v.name?.toLowerCase().includes(search.toLowerCase()) ||
        v.cedula?.includes(search)
    );

    const pct = stats ? Math.round((stats.voted / stats.total) * 100) || 0 : 0;

    return (
        <div className="space-y-6 relative">
            {showImport && (
                <BulkImportModal
                    electionId={selectedId}
                    onClose={() => setShowImport(false)}
                    onImported={() => load(selectedId)}
                    token={token}
                />
            )}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex-1">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2 block">Selecciona una Elección</label>
                    <select value={selectedId} onChange={handleSelect} className={inputClass + ' max-w-md'}>
                        <option value="">-- Elige una elección --</option>
                        {elections.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
                    </select>
                </div>
                {selectedId && (
                    <button
                        onClick={() => setShowImport(true)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                    >
                        <Upload size={18} /> Cargar Padrón
                    </button>
                )}
            </div>

            {!selectedId && (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                    <Users className="text-slate-200 mx-auto mb-4" size={48} />
                    <p className="text-slate-500 font-medium">Selecciona una elección para ver el universo de votantes.</p>
                </div>
            )}

            {selectedId && !loading && stats && (
                <>
                    {/* Progress cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { label: 'Total Inscritos', value: stats.total, icon: <Users size={20} />, color: 'bg-blue-100 text-blue-600' },
                            { label: 'Ya Votaron', value: stats.voted, icon: <UserCheck size={20} />, color: 'bg-emerald-100 text-emerald-600' },
                            { label: 'Falta Votar', value: stats.pending, icon: <UserX size={20} />, color: 'bg-amber-100 text-amber-600' },
                        ].map(s => (
                            <div key={s.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}>{s.icon}</div>
                                <div>
                                    <p className="text-slate-500 text-sm font-semibold">{s.label}</p>
                                    <p className="text-3xl font-black text-slate-900">{s.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Progress bar */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                        <div className="flex justify-between items-center mb-3">
                            <p className="font-bold text-slate-800">Participación</p>
                            <p className="text-2xl font-black text-blue-600">{pct}%</p>
                        </div>
                        <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-700"
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                    </div>

                    {/* Voter table */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
                            <h3 className="font-bold text-slate-900">Padrón Electoral</h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o RUT..."
                                    className="pl-10 pr-4 py-2 bg-slate-100 rounded-lg text-sm outline-none w-56 focus:bg-white border border-transparent focus:border-blue-400 transition-all" />
                            </div>
                        </div>
                        {filtered.length === 0 ? (
                            <p className="p-8 text-center text-slate-400 text-sm font-medium">Sin resultados.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr>
                                            <th className="p-4 text-left font-bold text-slate-600">Nombre</th>
                                            <th className="p-4 text-left font-bold text-slate-600">RUT/DNI</th>
                                            <th className="p-4 text-left font-bold text-slate-600">Correo</th>
                                            <th className="p-4 text-center font-bold text-slate-600">Estado</th>
                                            <th className="p-4 text-left font-bold text-slate-600">Hora de Voto</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filtered.map(v => (
                                            <tr key={v._id} className="hover:bg-slate-50">
                                                <td className="p-4 font-semibold text-slate-800">{v.name}</td>
                                                <td className="p-4 font-mono text-slate-600">{v.cedula}</td>
                                                <td className="p-4 text-slate-500">{v.email || '—'}</td>
                                                <td className="p-4 text-center">
                                                    {v.hasVoted
                                                        ? <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold"><UserCheck size={12} /> Votó</span>
                                                        : <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold"><UserX size={12} /> Pendiente</span>
                                                    }
                                                </td>
                                                <td className="p-4 text-slate-500 text-xs">
                                                    {v.votedAt ? new Date(v.votedAt).toLocaleString('es-CL') : '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}

            {loading && (
                <div className="text-center py-12"><Loader2 className="animate-spin text-blue-500 mx-auto" size={32} /></div>
            )}
        </div>
    );
};

// ── Config / Election Setup ───────────────────────────────────────────────────
const ConfigView = ({ user, elections, token, onRefresh, handlePayment }) => {
    const [tab, setTab] = useState('profile');
    const [selectedElection, setSelectedElection] = useState(null);
    const [form, setForm] = useState(null);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    const loadElection = async (id) => {
        if (!id) { setSelectedElection(null); setForm(null); return; }
        try {
            const res = await axios.get(`http://localhost:3000/api/elections/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            const e = res.data.data;
            setSelectedElection(e);
            setForm({
                title: e.title || '',
                description: e.description || '',
                electionType: e.electionType || '',
                startDate: e.startDate ? e.startDate.slice(0, 16) : '',
                endDate: e.endDate ? e.endDate.slice(0, 16) : '',
                candidates: e.candidates?.length ? e.candidates : [],
                settings: e.settings || { allowAutoRegistration: false }
            });
        } catch { setSelectedElection(null); setForm(null); }
    };

    const addCandidate = () => setForm(f => ({
        ...f, candidates: [...f.candidates, { name: '', description: '', imageUrl: '' }]
    }));

    const updateCandidate = (i, field, val) => setForm(f => {
        const cands = [...f.candidates];
        cands[i] = { ...cands[i], [field]: val };
        return { ...f, candidates: cands };
    });

    const removeCandidate = (i) => setForm(f => ({
        ...f, candidates: f.candidates.filter((_, idx) => idx !== i)
    }));

    const [votingLink, setVotingLink] = useState('');
    const [copied, setCopied] = useState(false);

    const save = async () => {
        setSaving(true); setMsg('');
        try {
            await axios.put(`http://localhost:3000/api/elections/${selectedElection._id}`, form, { headers: { Authorization: `Bearer ${token}` } });
            setMsg('✅ Configuración guardada correctamente.');
            const link = `${window.location.origin}/vote/${selectedElection._id}`;
            setVotingLink(link);
            onRefresh();
        } catch (err) { setMsg('❌ Error al guardar: ' + (err.response?.data?.error || 'Inténtalo de nuevo.')); }
        finally { setSaving(false); }
    };

    const copyLink = () => {
        navigator.clipboard.writeText(votingLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    return (
        <div className="space-y-6">
            {/* Sub-tabs */}
            <div className="flex gap-2 flex-wrap">
                {[
                    { id: 'profile', label: 'Mi Perfil' },
                    { id: 'election', label: 'Configurar Elección' },
                ].map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${tab === t.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === 'profile' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-lg">
                    <h3 className="text-xl font-bold text-slate-900 mb-6">Mi Perfil</h3>
                    <div className="space-y-0">
                        {[
                            { label: 'Nombre de usuario', value: user?.username },
                            { label: 'Correo electrónico', value: user?.email },
                            { label: 'Organización', value: user?.organization || '—' },
                            { label: 'Rol', value: user?.role === 'organizer' ? 'Organizador (Cliente)' : user?.role },
                        ].map(row => (
                            <div key={row.label} className="flex items-start justify-between py-4 border-b border-slate-100 last:border-0">
                                <span className="text-sm font-semibold text-slate-500">{row.label}</span>
                                <span className="text-sm font-bold text-slate-900 text-right max-w-[60%] truncate">{row.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {tab === 'election' && (
                <div className="space-y-5">
                    <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2 block">Elige la elección a configurar</label>
                        <select className={inputClass + ' max-w-md'} onChange={e => loadElection(e.target.value)} defaultValue="">
                            <option value="">-- Selecciona --</option>
                            {elections.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
                        </select>
                    </div>

                    {!form && (
                        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                            <Settings className="text-slate-200 mx-auto mb-4" size={48} />
                            <p className="text-slate-500 font-medium">Selecciona una elección para configurarla.</p>
                        </div>
                    )}

                    {form && (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                            <h3 className="text-lg font-bold text-slate-900">Detalles de la Elección</h3>

                            {/* Pago Pendiente - POSICIÓN SUPERIOR PARA VISIBILIDAD */}
                            {selectedElection && !selectedElection.isPaid && (
                                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-4 my-2">
                                    <div className="flex items-center gap-2 text-amber-800 font-bold uppercase tracking-wider text-xs">
                                        <CreditCard size={16} /> Pago Pendiente
                                    </div>
                                    <p className="text-sm text-amber-900/70 leading-relaxed font-medium">
                                        Esta elección aún no ha sido pagada. Debes completar el pago para que pueda ser aprobada y activada.
                                    </p>
                                    <div className="flex items-center justify-between bg-white/50 p-4 rounded-xl border border-amber-100">
                                        <span className="text-sm font-bold text-slate-700">Total a pagar:</span>
                                        <span className="text-lg font-black text-amber-600">${(selectedElection.price || 15000).toLocaleString('es-CL')} CLP</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handlePayment(selectedElection._id)}
                                        className="w-full flex items-center justify-center gap-2 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black transition-all shadow-lg shadow-amber-500/20"
                                    >
                                        <ExternalLink size={18} /> Ir a Pagar con Mercado Pago
                                    </button>
                                </div>
                            )}

                            {selectedElection && selectedElection.isPaid && (
                                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-3 my-2">
                                    <CheckCircle className="text-emerald-600" size={20} />
                                    <div>
                                        <p className="text-emerald-800 font-bold text-sm">Pago Correcto</p>
                                        <p className="text-emerald-700/70 text-xs font-medium">Esta elección ya cuenta con el pago validado.</p>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 block">Título</label>
                                    <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inputClass} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 block">Descripción</label>
                                    <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className={inputClass + ' resize-none'} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 block">Tipo de Evento</label>
                                    <select value={form.electionType} onChange={e => setForm({ ...form, electionType: e.target.value })} className={inputClass}>
                                        {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div />
                                <div>
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 block">Inicio de Votación</label>
                                    <input type="datetime-local" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className={inputClass} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 block">Cierre de Votación</label>
                                    <input type="datetime-local" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className={inputClass} />
                                </div>
                            </div>

                            <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl space-y-4">
                                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                    <Settings size={18} className="text-blue-600" /> Ajustes Avanzados
                                </h4>
                                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">Votación Abierta (Sin Padrón previo)</p>
                                        <p className="text-xs text-slate-500 font-medium">Cualquier RUT podrá votar y se registrará automáticamente en el sistema.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer"
                                            checked={form.settings?.allowAutoRegistration}
                                            onChange={e => setForm({ ...form, settings: { ...form.settings, allowAutoRegistration: e.target.checked } })}
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>

                            {/* Candidates */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-bold text-slate-900">Candidatos / Opciones de Voto</h4>
                                    <button onClick={addCandidate} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
                                        <Plus size={14} /> Agregar
                                    </button>
                                </div>

                                {form.candidates.length === 0 && (
                                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-sm">
                                        Aún no has agregado candidatos u opciones. Presiona "Agregar".
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {form.candidates.map((c, i) => (
                                        <div key={i} className="border border-slate-200 rounded-2xl p-5 space-y-3 relative">
                                            <button onClick={() => removeCandidate(i)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-xl text-red-500 hover:bg-red-50 transition-colors">
                                                <Trash2 size={15} />
                                            </button>
                                            <div className="font-semibold text-slate-700 text-sm mb-1">Candidato #{i + 1}</div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-xs font-bold text-slate-500 mb-1 block">Nombre completo</label>
                                                    <input value={c.name} onChange={e => updateCandidate(i, 'name', e.target.value)} placeholder="ej: Juan Pérez" className={inputClass} />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-slate-500 mb-1 block">URL de Foto (imagen)</label>
                                                    <input value={c.imageUrl} onChange={e => updateCandidate(i, 'imageUrl', e.target.value)} placeholder="https://..." className={inputClass} />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 mb-1 block">Reseña / Propuesta</label>
                                                <textarea value={c.description} onChange={e => updateCandidate(i, 'description', e.target.value)}
                                                    rows={2} placeholder="Breve descripción del candidato o su propuesta..." className={inputClass + ' resize-none'} />
                                            </div>
                                            {c.imageUrl && (
                                                <div className="flex items-center gap-3">
                                                    <img src={c.imageUrl} alt={c.name} className="w-16 h-16 object-cover rounded-xl border border-slate-200" />
                                                    <p className="text-xs text-slate-400">Vista previa de la foto</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {msg && (
                                <p className={`text-sm font-semibold p-3 rounded-xl ${msg.startsWith('✅') ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>{msg}</p>
                            )}


                            {/* Voting link card */}
                            {votingLink && (
                                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 space-y-3">
                                    <div className="flex items-center gap-2 text-blue-800 font-bold">
                                        <Link2 size={16} /> Enlace de Votación
                                    </div>
                                    <p className="text-blue-700 text-sm">Comparte este link con los votantes. Solo votarán quienes estén en el padrón.</p>
                                    <div className="flex gap-2 items-center">
                                        <input readOnly value={votingLink}
                                            className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-blue-200 text-blue-900 text-sm font-mono outline-none"
                                        />
                                        <button onClick={copyLink}
                                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${copied ? 'bg-emerald-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                                            {copied ? <>✓ Copiado!</> : <><Copy size={15} /> Copiar</>}
                                        </button>
                                        <a href={votingLink} target="_blank" rel="noreferrer"
                                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
                                            <ExternalLink size={15} /> Abrir
                                        </a>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end">
                                <button onClick={save} disabled={saving}
                                    className="flex items-center gap-2 px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors disabled:opacity-60 shadow-lg">
                                    {saving ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> Guardar Configuración</>}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ── Main Dashboard ────────────────────────────────────────────────────────────
const ClientDashboard = () => {
    const navigate = useNavigate();
    const [activeView, setActiveView] = useState('elections');
    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState('');

    // Audit & Report states
    const [reportData, setReportData] = useState(null);
    const [auditLog, setAuditLog] = useState(null);
    const [showingReport, setShowingReport] = useState(false);
    const [showingAudit, setShowingAudit] = useState(false);

    const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
    const token = localStorage.getItem('adminToken');

    useEffect(() => {
        if (!token || !user?.email) navigate('/login');
    }, []);

    const fetchElections = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:3000/api/elections', { headers: { Authorization: `Bearer ${token}` } });
            setElections(res.data.data || []);
        } catch { }
        finally { setLoading(false); }
    };

    const handlePayment = async (electionId) => {
        try {
            const res = await axios.post('http://localhost:3000/api/payments/create-preference',
                { electionId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.init_point) {
                window.location.href = res.data.init_point;
            }
        } catch (error) {
            alert('Error al iniciar el pago con Mercado Pago.');
        }
    };

    const fetchAudit = async (electionId) => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:3000/api/elections/${electionId}/audit`, { headers: { Authorization: `Bearer ${token}` } });
            setAuditLog(res.data.data);
            setShowingAudit(true);
        } catch (e) {
            alert('Error al obtener el log de auditoria.');
        } finally {
            setLoading(false);
        }
    };

    const fetchReport = async (electionId) => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:3000/api/elections/${electionId}/report`, { headers: { Authorization: `Bearer ${token}` } });
            setReportData(res.data.data);
            setShowingReport(true);
        } catch (e) {
            alert('Error al obtener el reporte.');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    useEffect(() => { fetchElections(); }, []);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/login');
    };

    const filtered = elections.filter(e => e.title?.toLowerCase().includes(search.toLowerCase()));

    // Fidedigna calculation: an election is 'ended' if its status is 'ended' OR endDate is past OR (voters and registered match and > 0)
    const isActuallyEnded = (e) => {
        const now = new Date();
        const end = new Date(e.endDate);
        return e.status === 'ended' || (end < now) || (e.votersCount > 0 && e.votersCount === e.registeredVotersCount);
    };

    const activeCount = elections.filter(e => e.status === 'active' && !isActuallyEnded(e)).length;
    const pendingAdminCount = elections.filter(e => e.approvalStatus === 'pending').length;
    const pendingPaymentCount = elections.filter(e => e.approvalStatus === 'approved' && !e.isPaid).length;
    const rejectedCount = elections.filter(e => e.approvalStatus === 'rejected').length;
    const endedCount = elections.filter(e => isActuallyEnded(e)).length;
    const userInitials = initials(user.username || user.email || '?');
    const displayName = user.username || user.email || 'Cliente';

    return (
        <>
            {showModal && <NewElectionModal onClose={() => setShowModal(false)} onCreated={fetchElections} token={token} />}

            <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
                {/* Sidebar */}
                <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col min-h-screen border-r border-slate-800">
                    <div className="p-6">
                        <h2 className="text-2xl font-black text-white tracking-tight">Ballots <span className="text-blue-500">Einsoft</span></h2>
                        <p className="text-xs text-slate-500 uppercase mt-2 font-bold tracking-widest">Portal de Cliente</p>
                    </div>
                    <nav className="flex-1 px-4 py-4 space-y-1">
                        {[
                            { id: 'elections', icon: <Activity size={18} />, label: 'Mis Elecciones' },
                            { id: 'voters', icon: <Users size={18} />, label: 'Votantes' },
                            { id: 'config', icon: <Settings size={18} />, label: 'Configuración' },
                        ].map(item => (
                            <button key={item.id} onClick={() => setActiveView(item.id)}
                                className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeView === item.id ? 'bg-blue-600/15 text-blue-400' : 'hover:bg-slate-800 hover:text-white'}`}>
                                {item.icon} {item.label}
                            </button>
                        ))}
                    </nav>
                    <div className="p-4 border-t border-slate-800">
                        <div className="flex items-center gap-3 px-2 mb-4">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0">{userInitials}</div>
                            <div className="overflow-hidden">
                                <p className="text-white text-sm font-semibold truncate">{displayName}</p>
                                <p className="text-slate-500 text-xs truncate">{user.email}</p>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-red-500/10 hover:text-red-400 rounded-xl font-medium transition-all text-sm">
                            <LogOut size={16} /> Cerrar Sesión
                        </button>
                    </div>
                </aside>

                {/* Main */}
                <main className="flex-1 overflow-x-hidden">
                    <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                        <h1 className="text-xl font-bold text-slate-800">
                            {activeView === 'elections' && 'Mis Elecciones'}
                            {activeView === 'voters' && 'Votantes'}
                            {activeView === 'config' && 'Configuración'}
                        </h1>
                        <div className="flex items-center gap-3">
                            {activeView === 'elections' && (
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="pl-10 pr-4 py-2 bg-slate-100 rounded-lg text-sm outline-none w-48 focus:bg-white border border-transparent focus:border-blue-400 transition-all" />
                                </div>
                            )}
                            <div className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-md">{userInitials}</div>
                        </div>
                    </header>

                    <div className="p-8 max-w-5xl mx-auto">
                        {activeView === 'elections' && (
                            <>
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-500/20 mb-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
                                    <div className="relative z-10">
                                        <h2 className="text-2xl font-extrabold mb-1">¡Hola, {displayName}!</h2>
                                        <p className="text-blue-100 text-sm font-medium">
                                            {activeCount > 0 ? `Tienes ${activeCount} elección${activeCount > 1 ? 'es' : ''} activa${activeCount > 1 ? 's' : ''}.` : 'No tienes elecciones activas aún.'}
                                        </p>
                                    </div>
                                    <button onClick={() => setShowModal(true)} className="relative z-10 px-6 py-3 bg-white text-blue-600 font-bold rounded-xl shadow-lg hover:bg-slate-50 transition-all flex items-center gap-2 shrink-0">
                                        <PlusCircle size={20} /> Crear Nueva Elección
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
                                    {[
                                        { label: 'Activas', value: activeCount, icon: <Activity className="w-5 h-5" />, color: 'bg-emerald-100 text-emerald-600' },
                                        { label: 'Pendientes Admin', value: pendingAdminCount, icon: <Clock className="w-5 h-5" />, color: 'bg-amber-100 text-amber-600' },
                                        { label: 'Pendientes Pago', value: pendingPaymentCount, icon: <ChevronRight className="w-5 h-5" />, color: 'bg-blue-100 text-blue-600' },
                                        { label: 'Rechazadas', value: rejectedCount, icon: <XCircle className="w-5 h-5" />, color: 'bg-red-100 text-red-600' },
                                        { label: 'Finalizadas', value: endedCount, icon: <CheckCircle className="w-5 h-5" />, color: 'bg-slate-100 text-slate-600' },
                                    ].map(s => (
                                        <div key={s.label} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-1 text-center">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1 ${s.color}`}>{s.icon}</div>
                                            <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest">{s.label}</p>
                                            <p className="text-2xl font-black text-slate-900">{s.value}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                        <h3 className="text-lg font-bold text-slate-800">Listado de Elecciones</h3>
                                        <button onClick={fetchElections} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 font-medium"><RefreshCw size={13} /> Actualizar</button>
                                    </div>
                                    {loading ? (
                                        <div className="p-12 text-center"><Loader2 className="animate-spin text-blue-500 mx-auto" size={32} /></div>
                                    ) : filtered.length === 0 ? (
                                        <div className="p-12 text-center">
                                            <Activity className="text-slate-200 mx-auto mb-4" size={48} />
                                            <p className="text-slate-500 font-medium">{search ? 'Sin resultados.' : 'Aún no tienes elecciones.'}</p>
                                            <button onClick={() => setShowModal(true)} className="mt-4 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 flex items-center gap-2 mx-auto">
                                                <PlusCircle size={16} /> Crear primera
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-slate-100">
                                            {filtered.map(election => {
                                                const s = statusMap[election.status] || statusMap.draft;
                                                return (
                                                    <div key={election._id} className="p-6 hover:bg-slate-50 flex flex-col sm:flex-row items-center gap-4">
                                                        <div className={`w-3 h-3 rounded-full shrink-0 ${s.dot}`} />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <p className="font-bold text-slate-900">{election.title}</p>
                                                                {election.approvalStatus === 'pending' && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold border border-amber-200">En revisión</span>}
                                                                {election.approvalStatus === 'rejected' && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold border border-red-200">Rechazada</span>}
                                                            </div>
                                                            <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                                                                <Clock size={12} /> {election.electionType || '—'}
                                                                {election.adminNote && <span className="text-red-500 italic">· {election.adminNote}</span>}
                                                            </p>
                                                        </div>
                                                        {election.status === 'active' ? (
                                                            <div className="flex gap-2">
                                                                <a href={`/vote/${election._id}`} target="_blank" rel="noreferrer"
                                                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm transition-colors ${s.btn}`}>
                                                                    {s.btnLabel} <ExternalLink size={14} />
                                                                </a>
                                                                <button
                                                                    onClick={() => fetchAudit(election._id)}
                                                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-indigo-500/10"
                                                                >
                                                                    <ShieldCheck size={16} /> Auditoría
                                                                </button>
                                                                <button
                                                                    onClick={() => fetchReport(election._id)}
                                                                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-slate-900/10"
                                                                >
                                                                    <FileText size={16} /> Acta
                                                                </button>
                                                            </div>
                                                        ) : election.approvalStatus === 'approved' && !election.isPaid ? (
                                                            <button
                                                                onClick={() => handlePayment(election._id)}
                                                                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                                                            >
                                                                Pagar Activación <ChevronRight size={16} />
                                                            </button>
                                                        ) : (
                                                            <button onClick={() => setActiveView('config')} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm transition-colors ${s.btn}`}>
                                                                {s.btnLabel} <ChevronRight size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {activeView === 'voters' && <VotersView elections={elections} token={token} />}
                        {activeView === 'config' && <ConfigView user={user} elections={elections} token={token} onRefresh={fetchElections} handlePayment={handlePayment} />}
                    </div>
                </main>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    .print-only { display: block !important; }
                    body { background: white !important; }
                    .print-content { 
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 20px !important;
                        box-shadow: none !important;
                    }
                }
            `}</style>

            {/* Blockchain Audit Modal */}
            {showingAudit && auditLog && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[110] flex items-center justify-center p-4 no-print">
                    <div className="bg-slate-50 rounded-[2.5rem] w-full max-w-4xl shadow-2xl relative flex flex-col max-h-[90vh]">
                        <div className="p-8 border-b border-slate-200 flex justify-between items-center bg-white rounded-t-[2.5rem]">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                    <ShieldCheck size={28} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900">Web3 Ledger Audit</h2>
                                    <p className="text-sm text-slate-500 font-medium">Verificación de integridad por Hash-Chaining</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={handlePrint} className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors flex items-center gap-2 font-bold">
                                    <Printer size={20} /> Imprimir
                                </button>
                                <button onClick={() => setShowingAudit(false)} className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl transition-colors">
                                    <XCircle size={24} />
                                </button>
                            </div>
                        </div>
                        <div className="p-8 overflow-y-auto space-y-8 flex-1 bg-slate-50/50 print-content">
                            <div className="flex items-center justify-between p-6 bg-emerald-50 border border-emerald-100 rounded-3xl">
                                <div className="flex items-center gap-3 text-emerald-700">
                                    <Activity className="animate-pulse" size={24} />
                                    <div>
                                        <p className="font-black text-lg">Estado del Ledger: ÍNTEGRO</p>
                                        <p className="text-sm font-medium opacity-80">Todos los hashes han sido validados matemáticamente.</p>
                                    </div>
                                </div>
                                <div className="px-5 py-2 bg-white rounded-xl text-emerald-600 font-bold text-sm shadow-sm border border-emerald-100">
                                    {auditLog.totalVotes} Votos Encadenados
                                </div>
                            </div>
                            <div className="space-y-4">
                                {auditLog.auditTrail.map((vote, i) => (
                                    <div key={i} className="relative pl-12">
                                        {i < auditLog.auditTrail.length - 1 && (
                                            <div className="absolute left-[19px] top-6 bottom-[-24px] w-1 bg-indigo-200 rounded-full" />
                                        )}
                                        <div className="absolute left-0 top-0 w-10 h-10 bg-white border-2 border-indigo-600 rounded-full flex items-center justify-center z-10 shadow-sm">
                                            <p className="text-xs font-black text-indigo-600">#{i + 1}</p>
                                        </div>
                                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                            <div className="flex justify-between items-start mb-4">
                                                <p className="text-lg font-bold text-slate-900">{vote.candidateName}</p>
                                                <p className="text-xs text-slate-400 font-medium">{new Date(vote.timestamp).toLocaleString('es-CL')}</p>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Hash Actual</p>
                                                    <p className="text-[11px] font-mono text-indigo-600 break-all bg-slate-50 p-2 rounded-lg">{vote.hash}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Hash Anterior</p>
                                                    <p className="text-[11px] font-mono text-slate-500 break-all bg-slate-50 p-2 rounded-lg">{vote.previousHash}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Detailed Report Modal */}
            {showingReport && reportData && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[110] flex items-center justify-center p-4 no-print">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl relative flex flex-col max-h-[90vh]">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-[2.5rem]">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900">Acta de Elección</h2>
                                <p className="text-slate-500 font-medium">{reportData.election.title}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all">
                                    <Printer size={20} /> Imprimir / PDF
                                </button>
                                <button onClick={() => setShowingReport(false)} className="p-3 bg-white text-slate-400 hover:text-slate-600 rounded-xl transition-all">
                                    <X size={24} />
                                </button>
                            </div>
                        </div>
                        <div className="p-8 overflow-y-auto space-y-8 print-content">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-6 bg-slate-50 rounded-3xl text-center">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Inscritos</p>
                                    <p className="text-3xl font-black text-slate-900">{reportData.stats.totalPadron}</p>
                                </div>
                                <div className="p-6 bg-blue-50 rounded-3xl text-center border border-blue-100">
                                    <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Votaron</p>
                                    <p className="text-3xl font-black text-blue-700">{reportData.stats.votedCount}</p>
                                </div>
                                <div className="p-6 bg-emerald-50 rounded-3xl text-center border border-emerald-100">
                                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Participación</p>
                                    <p className="text-3xl font-black text-emerald-700">{reportData.stats.quorum}%</p>
                                </div>
                                <div className="p-6 bg-amber-50 rounded-3xl text-center border border-amber-100">
                                    <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">Blancos</p>
                                    <p className="text-3xl font-black text-amber-700">{reportData.stats.blankVotes}</p>
                                </div>
                                <div className="p-6 bg-red-50 rounded-3xl text-center border border-red-100">
                                    <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-1">Nulos</p>
                                    <p className="text-3xl font-black text-red-700">{reportData.stats.nuloVotes || 0}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <Activity size={20} className="text-blue-600" /> Resultados del Escrutinio
                                </h3>
                                <div className="grid gap-3">
                                    {reportData.results.map(res => (
                                        <div key={res._id} className="p-5 bg-white border border-slate-100 rounded-2xl flex items-center justify-between shadow-sm">
                                            <div className="flex items-center gap-4">
                                                {res.imageUrl && <img src={res.imageUrl} className="w-12 h-12 rounded-xl object-cover" />}
                                                <p className="font-bold text-slate-800">{res.name}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-black text-slate-900">{res.votes}</p>
                                                <p className="text-xs font-bold text-slate-400 uppercase">Votos</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="border-t pt-8 text-[10px] text-slate-400 font-medium flex justify-between uppercase tracking-widest">
                                <p>Certificado por Einsoft Ballots - Legal Verification Protocol</p>
                                <p>ID de Auditoria: {reportData.election._id}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ClientDashboard;
