import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Loader2, User, Building2, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const inputClass = "w-full px-5 py-4 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-medium bg-slate-50 focus:bg-white text-slate-900 placeholder:text-slate-400";
const labelClass = "text-sm font-bold text-slate-700 flex items-center gap-2 mb-2";

const Login = () => {
    const [tab, setTab] = useState('login'); // 'login' | 'register'
    const navigate = useNavigate();

    // ── LOGIN STATE ──
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [loginStatus, setLoginStatus] = useState('idle');
    const [loginError, setLoginError] = useState('');

    // ── REGISTER STATE ──
    const [regData, setRegData] = useState({ username: '', email: '', password: '', confirmPassword: '', organization: '' });
    const [regStatus, setRegStatus] = useState('idle');
    const [regError, setRegError] = useState('');
    const [regSuccess, setRegSuccess] = useState('');

    // ── HANDLERS ──
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginStatus('loading');
        setLoginError('');
        try {
            const res = await axios.post('http://localhost:3000/api/auth/login', loginData);
            const { token, user } = res.data;
            localStorage.setItem('adminToken', token);
            localStorage.setItem('adminUser', JSON.stringify(user));
            setLoginStatus('success');
            if (user.role === 'admin') navigate('/admin-dashboard');
            else navigate('/dashboard');
        } catch (err) {
            setLoginStatus('error');
            setLoginError(err.response?.data?.message || 'Credenciales incorrectas. Inténtalo de nuevo.');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setRegError('');
        setRegSuccess('');

        if (regData.password !== regData.confirmPassword) {
            setRegError('Las contraseñas no coinciden.');
            return;
        }
        if (regData.password.length < 6) {
            setRegError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        setRegStatus('loading');
        try {
            await axios.post('http://localhost:3000/api/auth/register', {
                username: regData.username,
                email: regData.email,
                password: regData.password,
                organization: regData.organization,
                role: 'organizer',
            });
            setRegStatus('success');
            setRegSuccess('¡Cuenta creada exitosamente! Ya puedes iniciar sesión.');
            setTimeout(() => setTab('login'), 2500);
        } catch (err) {
            setRegStatus('error');
            setRegError(err.response?.data?.message || 'Error al crear la cuenta. El correo ya puede estar registrado.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[120px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[120px]" />
            </div>

            <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 relative z-10 overflow-hidden">
                {/* Header branding */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-6 text-center">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Lock className="text-white w-7 h-7" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-white tracking-tight">
                        Ballots <span className="text-blue-400">Einsoft</span>
                    </h1>
                    <p className="text-slate-400 text-xs mt-1 font-medium">Plataforma de Votación Electrónica</p>
                </div>

                {/* Tab switcher */}
                <div className="flex border-b border-slate-100">
                    <button
                        onClick={() => setTab('login')}
                        className={`flex-1 py-4 text-sm font-bold transition-colors ${tab === 'login' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        Iniciar Sesión
                    </button>
                    <button
                        onClick={() => setTab('register')}
                        className={`flex-1 py-4 text-sm font-bold transition-colors ${tab === 'register' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        Crear Cuenta
                    </button>
                </div>

                <div className="p-8">
                    {/* ── LOGIN FORM ── */}
                    {tab === 'login' && (
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div>
                                <label className={labelClass}><Mail className="w-4 h-4 text-blue-500" /> Correo Electrónico</label>
                                <input
                                    required type="email" placeholder="tu@correo.cl"
                                    value={loginData.email}
                                    onChange={e => setLoginData({ ...loginData, email: e.target.value })}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}><Lock className="w-4 h-4 text-blue-500" /> Contraseña</label>
                                <input
                                    required type="password" placeholder="••••••••"
                                    value={loginData.password}
                                    onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                                    className={inputClass}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loginStatus === 'loading'}
                                className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-lg flex justify-center items-center gap-2 disabled:opacity-70"
                            >
                                {loginStatus === 'loading' ? <Loader2 className="animate-spin" size={20} /> : 'Ingresar'}
                            </button>
                            {loginError && (
                                <p className="text-red-500 text-sm font-semibold text-center bg-red-50 p-3 rounded-xl border border-red-100">
                                    {loginError}
                                </p>
                            )}
                            <p className="text-center text-sm text-slate-500">
                                ¿Aún no tienes cuenta?{' '}
                                <button type="button" onClick={() => setTab('register')} className="text-blue-600 font-bold hover:underline">
                                    Regístrate gratis
                                </button>
                            </p>
                        </form>
                    )}

                    {/* ── REGISTER FORM ── */}
                    {tab === 'register' && (
                        <form onSubmit={handleRegister} className="space-y-4">
                            <p className="text-slate-600 text-sm font-medium mb-2">Crea tu cuenta de cliente para gestionar tus elecciones.</p>

                            <div>
                                <label className={labelClass}><User className="w-4 h-4 text-blue-500" /> Nombre de Usuario</label>
                                <input
                                    required placeholder="ej: juan.perez"
                                    value={regData.username}
                                    onChange={e => setRegData({ ...regData, username: e.target.value })}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}><Mail className="w-4 h-4 text-blue-500" /> Correo Electrónico</label>
                                <input
                                    required type="email" placeholder="tu@empresa.cl"
                                    value={regData.email}
                                    onChange={e => setRegData({ ...regData, email: e.target.value })}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}><Building2 className="w-4 h-4 text-blue-500" /> Organización (opcional)</label>
                                <input
                                    placeholder="ej: Sindicato Empresa X"
                                    value={regData.organization}
                                    onChange={e => setRegData({ ...regData, organization: e.target.value })}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}><Lock className="w-4 h-4 text-blue-500" /> Contraseña</label>
                                <input
                                    required type="password" placeholder="Mínimo 6 caracteres"
                                    value={regData.password}
                                    onChange={e => setRegData({ ...regData, password: e.target.value })}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}><Lock className="w-4 h-4 text-blue-500" /> Confirmar Contraseña</label>
                                <input
                                    required type="password" placeholder="Repite tu contraseña"
                                    value={regData.confirmPassword}
                                    onChange={e => setRegData({ ...regData, confirmPassword: e.target.value })}
                                    className={inputClass}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={regStatus === 'loading'}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg flex justify-center items-center gap-2 disabled:opacity-70"
                            >
                                {regStatus === 'loading' ? <Loader2 className="animate-spin" size={20} /> : 'Crear Cuenta'}
                            </button>

                            {regError && (
                                <p className="text-red-500 text-sm font-semibold text-center bg-red-50 p-3 rounded-xl border border-red-100">
                                    {regError}
                                </p>
                            )}
                            {regSuccess && (
                                <p className="text-emerald-600 text-sm font-semibold text-center bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                                    ✅ {regSuccess}
                                </p>
                            )}
                        </form>
                    )}
                </div>

                {/* Footer back link */}
                <div className="px-8 pb-6 text-center">
                    <Link to="/" className="text-xs text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center gap-1">
                        <ArrowLeft size={12} /> Volver al inicio
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
