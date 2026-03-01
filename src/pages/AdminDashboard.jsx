import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShieldAlert, Activity, Users, LogOut, CheckCircle, XCircle, ShieldCheck,
    Clock, Eye, Mail, FileText, Printer, RefreshCw, UserX, AlertTriangle, ClipboardList,
    Ticket, Trash2, Plus
} from 'lucide-react';
import axios from 'axios';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [elections, setElections] = useState([]);
    const [activeView, setActiveView] = useState('approvals');
    const [loading, setLoading] = useState(false);
    const [evaluating, setEvaluating] = useState(null);
    const [reportData, setReportData] = useState(null);
    const [auditLog, setAuditLog] = useState(null);
    const [showingReport, setShowingReport] = useState(false);
    const [showingAudit, setShowingAudit] = useState(false);
    const [coupons, setCoupons] = useState([]);
    const [showingCouponModal, setShowingCouponModal] = useState(false);
    const [newCoupon, setNewCoupon] = useState({ code: '', discountPercentage: 10, validUntil: '' });
    const [users, setUsers] = useState([]);

    const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
    const token = localStorage.getItem('adminToken');

    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    const fetchElections = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:3000/api/elections', authHeaders);
            setElections(res.data.data || []);
        } catch (e) {
            console.error('Error fetching elections:', e);
        } finally {
            setLoading(false);
        }
    };

    const fetchCoupons = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/coupons', authHeaders);
            setCoupons(res.data.data || []);
        } catch (e) {
            console.error('Error fetching coupons:', e);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/users', authHeaders);
            setUsers(res.data.data || []);
        } catch (e) {
            console.error('Error fetching users:', e);
        }
    };

    useEffect(() => {
        if (!token) { navigate('/login'); return; }
        fetchElections();
        fetchCoupons();
        fetchUsers();
        const interval = setInterval(fetchElections, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchReport = async (electionId) => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:3000/api/elections/${electionId}/report`, authHeaders);
            setReportData(res.data.data);
            setShowingReport(true);
        } catch (e) {
            alert('Error al obtener el reporte de la eleccion.');
        } finally {
            setLoading(false);
        }
    };

    const fetchAudit = async (electionId) => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:3000/api/elections/${electionId}/audit`, authHeaders);
            setAuditLog(res.data.data);
            setShowingAudit(true);
        } catch (e) {
            alert('Error al obtener el log de auditoria.');
        } finally {
            setLoading(false);
        }
    };

    const handleEvaluate = async (id, approvalStatus, reason = '') => {
        setEvaluating(id);
        try {
            await axios.put(`http://localhost:3000/api/elections/${id}/evaluate`,
                { approvalStatus, reason }, authHeaders);
            await fetchElections();
        } catch (e) {
            alert('Error al evaluar la eleccion.');
        } finally {
            setEvaluating(null);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/');
    };

    const handleCreateCoupon = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3000/api/coupons/create', newCoupon, authHeaders);
            setShowingCouponModal(false);
            setNewCoupon({ code: '', discountPercentage: 10, validUntil: '' });
            fetchCoupons();
        } catch (e) {
            alert(e.response?.data?.message || 'Error al crear cupón');
        }
    };

    const handleToggleCoupon = async (id) => {
        try {
            await axios.patch(`http://localhost:3000/api/coupons/${id}/toggle`, {}, authHeaders);
            fetchCoupons();
        } catch (e) {
            alert('Error al cambiar estado del cupón');
        }
    };

    const handleDeleteCoupon = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este cupón?')) return;
        try {
            await axios.delete(`http://localhost:3000/api/coupons/${id}`, authHeaders);
            fetchCoupons();
        } catch (e) {
            alert('Error al eliminar cupón');
        }
    };

    const pendingElections = elections.filter(e => e.approvalStatus === 'pending');
    const approvedElections = elections.filter(e => e.approvalStatus === 'approved');
    const rejectedElections = elections.filter(e => e.approvalStatus === 'rejected');

    const statusBadge = (status) => {
        const styles = {
            pending: 'bg-amber-100 text-amber-700 border-amber-200',
            approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            rejected: 'bg-red-100 text-red-700 border-red-200',
        };
        const labels = { pending: 'Pendiente', approved: 'Aprobada', rejected: 'Rechazada' };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || 'bg-gray-100 text-gray-500'}`}>
                {labels[status] || status}
            </span>
        );
    };

    const ElectionCard = ({ election }) => (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="font-bold text-slate-900 text-lg truncate">{election.title}</h3>
                        {statusBadge(election.approvalStatus)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1"><Activity size={14} /> {election.electionType || 'Tipo no definido'}</span>
                        <span className="flex items-center gap-1"><Clock size={14} /> {new Date(election.createdAt).toLocaleDateString('es-CL')}</span>
                        {election.organizer && (
                            <span className="flex items-center gap-1"><Mail size={14} /> {election.organizer.email}</span>
                        )}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${election.isPaid ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-red-100 text-red-700 border border-red-200 animate-pulse'}`}>
                            {election.isPaid ? 'PAGADA' : 'PENDIENTE PAGO'}
                        </span>
                    </div>
                </div>

                <div className="flex gap-2 shrink-0">
                    {election.approvalStatus === 'pending' && (
                        <>
                            <button
                                onClick={() => {
                                    if (!election.isPaid) {
                                        alert('No se puede aprobar una elección que no ha sido pagada.');
                                        return;
                                    }
                                    handleEvaluate(election._id, 'approved');
                                }}
                                disabled={evaluating === election._id}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-colors ${!election.isPaid ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}
                            >
                                <CheckCircle size={16} /> Aprobar
                            </button>
                            <button
                                onClick={() => {
                                    const reason = prompt('Motivo del rechazo:') || '';
                                    handleEvaluate(election._id, 'rejected', reason);
                                }}
                                disabled={evaluating === election._id}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-sm transition-colors"
                            >
                                <XCircle size={16} /> Rechazar
                            </button>
                        </>
                    )}
                    {election.approvalStatus === 'approved' && (
                        <>
                            <button
                                onClick={() => fetchReport(election._id)}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition-colors"
                            >
                                <FileText size={16} /> Acta
                            </button>
                            <button
                                onClick={() => fetchAudit(election._id)}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-colors"
                            >
                                <ShieldCheck size={16} /> Auditoría Web3
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row print:block">
            <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col min-h-screen border-r border-slate-800 print:hidden">
                <div className="p-6">
                    <h2 className="text-2xl font-black text-white tracking-tight">Ballots Admin</h2>
                </div>
                <nav className="flex-1 px-4 py-4 space-y-1">
                    <button onClick={() => setActiveView('approvals')} className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeView === 'approvals' ? 'bg-red-600/15 text-red-400' : 'hover:bg-slate-800 hover:text-white'}`}>
                        <AlertTriangle size={18} /> Evaluar Peticiones
                    </button>
                    <button onClick={() => setActiveView('all')} className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeView === 'all' ? 'bg-blue-600/15 text-blue-400' : 'hover:bg-slate-800 hover:text-white'}`}>
                        <Activity size={18} /> Todas las Elecciones
                    </button>
                    <button onClick={() => setActiveView('stats')} className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeView === 'stats' ? 'bg-indigo-600/15 text-indigo-400' : 'hover:bg-slate-800 hover:text-white'}`}>
                        <ClipboardList size={18} /> Reportes e Informes
                    </button>
                    <button onClick={() => setActiveView('log')} className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeView === 'log' ? 'bg-emerald-600/15 text-emerald-400' : 'hover:bg-slate-800 hover:text-white'}`}>
                        <ShieldCheck size={18} /> Log Autorizaciones
                    </button>
                    <button onClick={() => setActiveView('coupons')} className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeView === 'coupons' ? 'bg-amber-600/15 text-amber-500' : 'hover:bg-slate-800 hover:text-white'}`}>
                        <Ticket size={18} /> Gestión de Cupones
                    </button>
                    <button onClick={() => setActiveView('users')} className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeView === 'users' ? 'bg-purple-600/15 text-purple-400' : 'hover:bg-slate-800 hover:text-white'}`}>
                        <Users size={18} /> Gestión de Usuarios
                    </button>
                </nav>
                <div className="p-4 border-t border-slate-800">
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-red-500/10 hover:text-red-400 rounded-xl font-medium transition-all text-sm">
                        <LogOut size={16} /> Cerrar Sesión
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-x-hidden p-6 md:p-8">
                {activeView === 'approvals' && (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Peticiones Pendientes</h2>
                        {pendingElections.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                                <CheckCircle className="text-emerald-400 mx-auto mb-4" size={48} />
                                <p className="text-slate-500 font-medium">No hay peticiones pendientes.</p>
                            </div>
                        ) : pendingElections.map(e => <ElectionCard key={e._id} election={e} />)}
                    </div>
                )}

                {activeView === 'all' && (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Todas las Elecciones</h2>
                        {elections.map(e => <ElectionCard key={e._id} election={e} />)}
                    </div>
                )}

                {activeView === 'stats' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Reportes e Informes</h2>
                        {(() => {
                            const isActuallyEnded = (e) => {
                                const now = new Date();
                                const end = new Date(e.endDate);
                                return e.status === 'ended' || (end < now) || (e.votersCount > 0 && e.votersCount === e.registeredVotersCount);
                            };
                            const activeCount = elections.filter(e => e.status === 'active' && !isActuallyEnded(e)).length;
                            const endedCount = elections.filter(e => isActuallyEnded(e)).length;
                            const pendingPaymentCount = elections.filter(e => e.approvalStatus === 'approved' && !e.isPaid).length;

                            return (
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Total</p>
                                        <p className="text-3xl font-black text-slate-900">{elections.length}</p>
                                    </div>
                                    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Pend. Admin</p>
                                        <p className="text-3xl font-black text-amber-600">{pendingElections.length}</p>
                                    </div>
                                    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Pend. Pago</p>
                                        <p className="text-3xl font-black text-blue-600">{pendingPaymentCount}</p>
                                    </div>
                                    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Activas</p>
                                        <p className="text-3xl font-black text-emerald-600">{activeCount}</p>
                                    </div>
                                    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Rechazadas</p>
                                        <p className="text-3xl font-black text-red-600">{rejectedElections.length}</p>
                                    </div>
                                </div>
                            );
                        })()}
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="font-bold text-slate-800">Resumen de Actividades</h3>
                                <RefreshCw size={18} className="text-slate-400 cursor-pointer hover:rotate-180 transition-all duration-500" onClick={fetchElections} />
                            </div>
                            <div className="p-0 overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-widest">
                                        <tr>
                                            <th className="px-6 py-4">Elección</th>
                                            <th className="px-6 py-4">Tipo</th>
                                            <th className="px-6 py-4">Organizador</th>
                                            <th className="px-6 py-4">Fecha Solicitud</th>
                                            <th className="px-6 py-4">Estado Pago</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {elections.map(e => (
                                            <tr key={e._id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-slate-800">{e.title}</td>
                                                <td className="px-6 py-4">{e.electionType}</td>
                                                <td className="px-6 py-4 text-xs">{e.organizer?.email || 'N/A'}</td>
                                                <td className="px-6 py-4 text-slate-500">{new Date(e.createdAt).toLocaleDateString('es-CL')}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${e.isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                        {e.isPaid ? 'Pagada' : 'Pendiente'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeView === 'log' && (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Log de Autorizaciones</h2>
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-0 overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                                        <tr>
                                            <th className="px-6 py-4">Elección</th>
                                            <th className="px-6 py-4">Acción</th>
                                            <th className="px-6 py-4">Autorizado por</th>
                                            <th className="px-6 py-4">Fecha</th>
                                            <th className="px-6 py-4">Notas Admin</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {elections.filter(e => e.approvalStatus !== 'pending').map(e => (
                                            <tr key={e._id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-slate-800">{e.title}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${e.approvalStatus === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                        {e.approvalStatus === 'approved' ? 'Aprobada' : 'Rechazada'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-slate-600">{e.approvedBy || 'Sistema'}</td>
                                                <td className="px-6 py-4 text-slate-500">{e.approvedAt ? new Date(e.approvedAt).toLocaleString('es-CL') : 'N/A'}</td>
                                                <td className="px-6 py-4 text-xs italic text-slate-400">{e.adminNote || 'Sin notas'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeView === 'coupons' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Cupones de Descuento</h3>
                                <p className="text-sm text-slate-500">Gestiona los códigos promocionales para la plataforma.</p>
                            </div>
                            <button
                                onClick={() => setShowingCouponModal(true)}
                                className="flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-amber-500/20"
                            >
                                <Plus size={20} /> Crear Nuevo Cupón
                            </button>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="p-4 text-left font-bold text-slate-600">Código</th>
                                        <th className="p-4 text-center font-bold text-slate-600">Descuento</th>
                                        <th className="p-4 text-center font-bold text-slate-600">Estado</th>
                                        <th className="p-4 text-left font-bold text-slate-600">Vence</th>
                                        <th className="p-4 text-right font-bold text-slate-600">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {coupons.map(c => (
                                        <tr key={c._id} className="hover:bg-slate-50">
                                            <td className="p-4 font-black text-slate-900">{c.code}</td>
                                            <td className="p-4 text-center">
                                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-bold">
                                                    {c.discountPercentage}%
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <button onClick={() => handleToggleCoupon(c._id)} className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${c.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                                                    {c.isActive ? 'Activo' : 'Inactivo'}
                                                </button>
                                            </td>
                                            <td className="p-4 text-slate-500 font-medium">
                                                {c.validUntil ? new Date(c.validUntil).toLocaleDateString('es-CL') : 'Sin vencimiento'}
                                            </td>
                                            <td className="p-4 text-right">
                                                <button onClick={() => handleDeleteCoupon(c._id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeView === 'users' && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-slate-900">Gestión de Usuarios</h3>
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="p-4 text-left font-bold text-slate-600">Usuario</th>
                                        <th className="p-4 text-left font-bold text-slate-600">Email</th>
                                        <th className="p-4 text-center font-bold text-slate-600">Rol</th>
                                        <th className="p-4 text-right font-bold text-slate-600">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {users.map(u => (
                                        <tr key={u._id} className="hover:bg-slate-50">
                                            <td className="p-4 font-bold text-slate-800">{u.username}</td>
                                            <td className="p-4 text-slate-500">{u.email}</td>
                                            <td className="p-4 text-center">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${u.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {u.role.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right flex justify-end gap-2">
                                                <button onClick={async () => {
                                                    try {
                                                        const newRole = u.role === 'admin' ? 'client' : 'admin';
                                                        await axios.put(`http://localhost:3000/api/users/${u._id}`, { role: newRole }, authHeaders);
                                                        fetchUsers();
                                                    } catch (e) { alert('Error al cambiar rol'); }
                                                }} className="p-2 text-slate-400 hover:text-blue-500 transition-colors" title="Cambiar Rol">
                                                    <RefreshCw size={18} />
                                                </button>
                                                <button onClick={async () => {
                                                    if (window.confirm('¿Seguro que deseas eliminar este usuario?')) {
                                                        try {
                                                            await axios.delete(`http://localhost:3000/api/users/${u._id}`, authHeaders);
                                                            fetchUsers();
                                                        } catch (e) { alert('Error al eliminar usuario'); }
                                                    }
                                                }} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {/* Status Report Modal */}
            {showingReport && reportData && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto no-print">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-5xl shadow-2xl relative my-8">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center no-print">
                            <h2 className="text-2xl font-black text-slate-900">Acta de Escrutinio</h2>
                            <div className="flex gap-3">
                                <button onClick={() => window.print()} className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl">
                                    <Printer size={20} />
                                </button>
                                <button onClick={() => setShowingReport(false)} className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl">
                                    <XCircle size={24} />
                                </button>
                            </div>
                        </div>
                        <div className="p-8 md:p-12 space-y-12 overflow-y-auto max-h-[80vh] print:max-h-none print-content">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                    <p className="text-xs text-slate-400 font-black uppercase mb-1">Universo Padrón</p>
                                    <p className="text-4xl font-black text-slate-900">{reportData.stats.totalPadron}</p>
                                </div>
                                <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                                    <p className="text-xs text-blue-400 font-black uppercase mb-1">Participación</p>
                                    <p className="text-4xl font-black text-blue-600">{reportData.stats.quorum}%</p>
                                </div>
                                <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
                                    <p className="text-xs text-emerald-400 font-black uppercase mb-1">Votos Emitidos</p>
                                    <p className="text-4xl font-black text-emerald-600">{reportData.stats.votedCount}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-xl font-extrabold text-slate-900">Resultados</h3>
                                <div className="space-y-4">
                                    {reportData.results.map((res, i) => (
                                        <div key={res._id} className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center font-bold">
                                            <span>{res.name}</span>
                                            <span>{res.votes} votos</span>
                                        </div>
                                    ))}
                                    <div className="p-4 bg-slate-100 rounded-2xl flex justify-between items-center italic">
                                        <span>Votos en Blanco</span>
                                        <span>{reportData.stats.blankVotes}</span>
                                    </div>
                                    <div className="p-4 bg-red-50 rounded-2xl flex justify-between items-center text-red-600">
                                        <span>Votos Nulos</span>
                                        <span>{reportData.stats.nuloVotes || 0}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="overflow-hidden border border-slate-100 rounded-3xl">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="p-4 text-left font-bold text-slate-600">Votante</th>
                                            <th className="p-4 text-left font-bold text-slate-600">RUT</th>
                                            <th className="p-4 text-center font-bold text-slate-600">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {reportData.voters.map(v => (
                                            <tr key={v._id}>
                                                <td className="p-4 font-bold">{v.name}</td>
                                                <td className="p-4 font-mono">{v.cedula}</td>
                                                <td className="p-4 text-center">
                                                    {v.hasVoted ? 'Votó' : 'Pendiente'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Audit Modal */}
            {showingAudit && auditLog && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl relative flex flex-col max-h-[90vh]">
                        <div className="p-8 border-b border-slate-200 flex justify-between items-center">
                            <h2 className="text-2xl font-black text-slate-900">Auditoría Blockchain</h2>
                            <button onClick={() => setShowingAudit(false)} className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl">
                                <XCircle size={24} />
                            </button>
                        </div>
                        <div className="p-8 overflow-y-auto space-y-4 flex-1">
                            {(auditLog.auditTrail || []).map((vote, i) => (
                                <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Paso #{i + 1}</p>
                                    <p className="text-sm font-mono text-indigo-600 break-all">{vote.hash}</p>
                                    <p className="text-[10px] text-slate-400 mt-1">Anterior: {vote.previousHash}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Create Coupon Modal */}
            {showingCouponModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl relative p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black text-slate-900">Crear Cupón</h3>
                            <button onClick={() => setShowingCouponModal(false)} className="text-slate-400 hover:text-slate-600">
                                <XCircle size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateCoupon} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Código</label>
                                <input required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold uppercase" value={newCoupon.code} onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value })} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Porcentaje</label>
                                <input required type="number" min="1" max="100" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" value={newCoupon.discountPercentage} onChange={e => setNewCoupon({ ...newCoupon, discountPercentage: e.target.value })} />
                            </div>
                            <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold mt-4">Guardar Cupón</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
