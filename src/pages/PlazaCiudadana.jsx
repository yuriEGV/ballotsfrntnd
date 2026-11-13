import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
    Home, ClipboardList, Gift, User, History, RefreshCw, ShieldCheck,
    CheckCircle2, ExternalLink, Search, Sparkles, ArrowRight, BarChart3,
    Loader2, Copy, Check, X, LogOut, Menu, Landmark
} from 'lucide-react';
import { API_URL } from '../config.js';

const getInitials = (name = '') => {
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'PC';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
};

const NAV_ITEMS = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'surveys', label: 'Encuestas', icon: ClipboardList },
    { id: 'rewards', label: 'Recompensas', icon: Gift },
    { id: 'profile', label: 'Mis datos', icon: User },
    { id: 'history', label: 'Historial', icon: History }
];

const ResultsPanel = ({ survey, results }) => {
    const data = results || survey?.results;
    if (!data) {
        return (
            <p className="text-sm text-slate-500 text-center py-6">
                Los resultados de esta consulta se publicarán al cierre del período.
            </p>
        );
    }

    const hasQuestions = Array.isArray(data.questionResults) && data.questionResults.length > 0;

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span>Total de participaciones: <strong className="text-slate-900">{data.totalResponses}</strong></span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <ShieldCheck size={14} /> Ancladas en Web3: {data.anchoredCount}
                </span>
            </div>

            {hasQuestions ? (
                data.questionResults.map((q) => (
                    <div key={q._id || q.prompt} className="space-y-3 bg-white border border-slate-200 rounded-2xl p-4">
                        <h4 className="font-bold text-slate-900 text-sm">{q.prompt}</h4>
                        <div className="space-y-2.5">
                            {(q.options || []).map((opt) => (
                                <div key={opt.label} className="space-y-1">
                                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                                        <span>{opt.label}</span>
                                        <span>{opt.votes} ({opt.percentage}%)</span>
                                    </div>
                                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-sky-500 to-cyan-500 rounded-full transition-all"
                                            style={{ width: `${opt.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            ) : (
                <div className="space-y-3">
                    {(data.candidateResults || []).map((cand) => (
                        <div key={cand._id || cand.name} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold text-slate-700">
                                <span>{cand.name}</span>
                                <span>{cand.votes} ({cand.percentage}%)</span>
                            </div>
                            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all"
                                    style={{ width: `${cand.percentage}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const PlazaCiudadana = () => {
    const [activeTab, setActiveTab] = useState('surveys');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [surveys, setSurveys] = useState([]);
    const [categories, setCategories] = useState(['Ciudadanía']);
    const [rewardsCatalog, setRewardsCatalog] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('Todas');
    const [searchTerm, setSearchTerm] = useState('');
    const [loadingSurveys, setLoadingSurveys] = useState(true);
    const [web3Status, setWeb3Status] = useState(null);

    const [citizenToken, setCitizenToken] = useState(() => localStorage.getItem('plazaToken') || '');
    const [profile, setProfile] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('plazaProfile') || 'null');
        } catch {
            return null;
        }
    });

    // Modal de respuesta
    const [respondingSurvey, setRespondingSurvey] = useState(null);
    const [selectedCandidateId, setSelectedCandidateId] = useState('');
    const [multiAnswers, setMultiAnswers] = useState({});
    const [quickCedula, setQuickCedula] = useState('');
    const [quickAlias, setQuickAlias] = useState('');
    const [submittingVote, setSubmittingVote] = useState(false);
    const [voteError, setVoteError] = useState('');
    const [voteSuccess, setVoteSuccess] = useState(null);

    // Modal de resultados
    const [resultsModalSurvey, setResultsModalSurvey] = useState(null);

    // Formulario Mis Datos
    const [profileForm, setProfileForm] = useState({
        cedula: '',
        displayName: '',
        email: '',
        commune: '',
        region: ''
    });
    const [savingProfile, setSavingProfile] = useState(false);
    const [profileMsg, setProfileMsg] = useState('');

    // Recompensas
    const [redeemingId, setRedeemingId] = useState('');
    const [rewardMsg, setRewardMsg] = useState('');
    const [copiedCode, setCopiedCode] = useState('');

    const loadPlazaData = useCallback(async () => {
        setLoadingSurveys(true);
        try {
            const [surveysRes, web3Res] = await Promise.all([
                axios.get(`${API_URL}/api/plaza/surveys`),
                axios.get(`${API_URL}/api/ballots/web3-status`).catch(() => ({ data: { data: null } }))
            ]);
            const payload = surveysRes.data?.data || {};
            setSurveys(payload.surveys || []);
            if (Array.isArray(payload.categories) && payload.categories.length > 0) {
                setCategories(payload.categories);
            }
            setRewardsCatalog(payload.rewardsCatalog || []);
            setWeb3Status(web3Res.data?.data || null);
        } catch (err) {
            console.error('Error loading Plaza surveys:', err);
        } finally {
            setLoadingSurveys(false);
        }
    }, []);

    const loadCitizenProfile = useCallback(async (tokenToUse) => {
        if (!tokenToUse) return;
        try {
            const res = await axios.get(`${API_URL}/api/plaza/profile/me`, {
                headers: { Authorization: `Bearer ${tokenToUse}` }
            });
            const p = res.data?.data?.profile;
            if (p) {
                setProfile(p);
                localStorage.setItem('plazaProfile', JSON.stringify(p));
                setProfileForm((prev) => ({
                    ...prev,
                    displayName: p.displayName || '',
                    email: p.email || '',
                    commune: p.commune || '',
                    region: p.region || ''
                }));
            }
            if (res.data?.data?.rewardsCatalog) {
                setRewardsCatalog(res.data.data.rewardsCatalog);
            }
        } catch {
            // Token expirado o inválido
        }
    }, []);

    useEffect(() => {
        loadPlazaData();
        if (citizenToken) {
            loadCitizenProfile(citizenToken);
        }
    }, [loadPlazaData, loadCitizenProfile, citizenToken]);

    const answeredSurveyIds = useMemo(() => {
        return new Set((profile?.history || []).map((h) => String(h.election)));
    }, [profile]);

    const filteredSurveys = useMemo(() => {
        return surveys.filter((s) => {
            const catMatch = selectedCategory === 'Todas' || s.category === selectedCategory;
            const q = searchTerm.trim().toLowerCase();
            const textMatch = !q || s.title?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q);
            return catMatch && textMatch;
        });
    }, [surveys, selectedCategory, searchTerm]);

    const openSurveysCount = surveys.filter((s) => s.isOpenWindow).length;
    const featuredSurvey = surveys.find((s) => s.isOpenWindow && !answeredSurveyIds.has(String(s._id))) || surveys[0] || null;

    const openRespondModal = (survey) => {
        setRespondingSurvey(survey);
        setSelectedCandidateId('');
        setMultiAnswers({});
        setQuickCedula('');
        setQuickAlias(profile?.displayName || '');
        setVoteError('');
        setVoteSuccess(null);
    };

    const toggleMultiOption = (questionId, label, allowMultiple) => {
        setMultiAnswers((prev) => {
            const current = prev[questionId] || [];
            if (!allowMultiple) {
                return { ...prev, [questionId]: [label] };
            }
            const exists = current.includes(label);
            return {
                ...prev,
                [questionId]: exists ? current.filter((x) => x !== label) : [...current, label]
            };
        });
    };

    const handleSubmitResponse = async (e) => {
        e.preventDefault();
        if (!respondingSurvey) return;

        setVoteError('');
        setSubmittingVote(true);

        try {
            const hasQuestions = Array.isArray(respondingSurvey.questions) && respondingSurvey.questions.length > 0;
            const surveyAnswers = hasQuestions
                ? respondingSurvey.questions.map((q) => ({
                    questionId: q._id,
                    questionPrompt: q.prompt,
                    selectedOptions: multiAnswers[q._id] || []
                }))
                : null;

            const headers = citizenToken ? { Authorization: `Bearer ${citizenToken}` } : {};
            const res = await axios.post(
                `${API_URL}/api/plaza/surveys/${respondingSurvey._id}/respond`,
                {
                    ...(quickCedula.trim() ? { cedula: quickCedula.trim() } : {}),
                    ...(quickAlias.trim() ? { displayName: quickAlias.trim() } : {}),
                    ...(hasQuestions ? { surveyAnswers } : { candidateId: selectedCandidateId })
                },
                { headers }
            );

            const data = res.data?.data;
            if (data?.citizenToken) {
                setCitizenToken(data.citizenToken);
                localStorage.setItem('plazaToken', data.citizenToken);
            }
            if (data?.profile) {
                setProfile(data.profile);
                localStorage.setItem('plazaProfile', JSON.stringify(data.profile));
            }
            setVoteSuccess({
                pointsAwarded: data?.pointsAwarded || 50,
                receipt: data?.receipt,
                surveyResults: data?.surveyResults
            });
            loadPlazaData();
        } catch (err) {
            setVoteError(err.response?.data?.message || err.response?.data?.error || 'No se pudo registrar tu participación.');
        } finally {
            setSubmittingVote(false);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSavingProfile(true);
        setProfileMsg('');
        try {
            const headers = citizenToken ? { Authorization: `Bearer ${citizenToken}` } : {};
            const res = await axios.post(`${API_URL}/api/plaza/profile`, profileForm, { headers });
            const data = res.data?.data;
            if (data?.citizenToken) {
                setCitizenToken(data.citizenToken);
                localStorage.setItem('plazaToken', data.citizenToken);
            }
            if (data?.profile) {
                setProfile(data.profile);
                localStorage.setItem('plazaProfile', JSON.stringify(data.profile));
            }
            setProfileForm((prev) => ({ ...prev, cedula: '' }));
            setProfileMsg('Datos guardados y sesión ciudadana vinculada correctamente.');
        } catch (err) {
            setProfileMsg(err.response?.data?.message || 'Error al guardar tus datos.');
        } finally {
            setSavingProfile(false);
        }
    };

    const handleRedeem = async (rewardId) => {
        if (!citizenToken) {
            setActiveTab('profile');
            setProfileMsg('Ingresa tu RUT en Mis datos para canjear recompensas.');
            return;
        }
        setRedeemingId(rewardId);
        setRewardMsg('');
        try {
            const res = await axios.post(
                `${API_URL}/api/plaza/rewards/redeem`,
                { rewardId },
                { headers: { Authorization: `Bearer ${citizenToken}` } }
            );
            const data = res.data?.data;
            if (data?.profile) {
                setProfile(data.profile);
                localStorage.setItem('plazaProfile', JSON.stringify(data.profile));
            }
            if (data?.redeemed) {
                setRewardMsg(`¡Canje exitoso! Tu código es ${data.redeemed.code}`);
            }
        } catch (err) {
            setRewardMsg(err.response?.data?.message || 'No se pudo completar el canje.');
        } finally {
            setRedeemingId('');
        }
    };

    const handleLogoutCitizen = () => {
        localStorage.removeItem('plazaToken');
        localStorage.removeItem('plazaProfile');
        setCitizenToken('');
        setProfile(null);
        setProfileForm({ cedula: '', displayName: '', email: '', commune: '', region: '' });
    };

    const copyText = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(''), 2000);
    };

    const displayName = profile?.displayName || 'Ciudadano';
    const points = profile?.points || 0;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Top Header Bar */}
            <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-3 flex items-center justify-between sticky top-0 z-30">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600"
                    >
                        <Menu size={20} />
                    </button>
                    <Link to="/" className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-sm">
                            <Landmark size={18} />
                        </div>
                        <div>
                            <span className="font-black text-lg tracking-tight text-slate-900">
                                PLAZA <span className="text-sky-600">CIUDADANA</span>
                            </span>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                Ballots Einsoft · Web3
                            </p>
                        </div>
                    </Link>
                </div>

                <div className="flex items-center gap-3">
                    {web3Status?.configured && (
                        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                            <ShieldCheck size={14} /> {web3Status.networkName}
                        </span>
                    )}
                    <Link to="/login" className="text-xs font-bold text-slate-600 hover:text-blue-600 hidden sm:inline">
                        Crear Encuesta / Votación
                    </Link>
                    <Link to="/" className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors">
                        Inicio
                    </Link>
                </div>
            </header>

            {/* Cadem-style Gradient Points Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 px-4 md:px-8 py-3 flex items-center justify-between text-white shadow-sm">
                <p className="text-xs md:text-sm font-semibold flex items-center gap-2">
                    <Sparkles size={16} className="shrink-0" />
                    Participa con 1 voto único verificable en Blockchain y acumula puntos cívicos.
                </p>
                <div className="flex items-center gap-2 bg-white text-slate-800 px-4 py-1.5 rounded-full shadow-sm text-xs md:text-sm font-bold shrink-0">
                    <span>Tienes <strong className="text-sky-600">{points}</strong> puntos</span>
                    <button
                        type="button"
                        onClick={() => { loadPlazaData(); if (citizenToken) loadCitizenProfile(citizenToken); }}
                        title="Actualizar"
                        className="text-sky-600 hover:rotate-90 transition-transform"
                    >
                        <RefreshCw size={14} />
                    </button>
                </div>
            </div>

            <div className="flex-1 flex relative">
                {/* Left Sidebar matching Cadem layout */}
                <aside className={`${mobileMenuOpen ? 'block absolute inset-y-0 left-0 z-40 shadow-2xl' : 'hidden'} md:block w-64 bg-white border-r border-slate-200 shrink-0`}>
                    <div className="p-6 flex flex-col items-center text-center border-b border-slate-100">
                        <div className="w-20 h-20 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-2xl font-black mb-3 border-4 border-sky-50">
                            {getInitials(displayName)}
                        </div>
                        <h2 className="font-bold text-slate-900 text-lg truncate max-w-full">{displayName}</h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {profile ? `${profile.participationsCount || 0} participaciones` : 'Invitado · Identifícate en Mis datos'}
                        </p>
                    </div>

                    <nav className="p-3 space-y-1">
                        {NAV_ITEMS.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                                        isActive
                                            ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                    }`}
                                >
                                    <Icon size={18} />
                                    {item.label}
                                </button>
                            );
                        })}
                    </nav>

                    {citizenToken && (
                        <div className="p-4 mt-4 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={handleLogoutCitizen}
                                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                            >
                                <LogOut size={14} /> Cambiar Ciudadano
                            </button>
                        </div>
                    )}
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 p-5 md:p-8 max-w-5xl">
                    {/* HOME TAB */}
                    {activeTab === 'home' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                <div className="space-y-2">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold">
                                        Plaza Ciudadana en Vivo
                                    </span>
                                    <h1 className="text-2xl md:text-3xl font-black text-slate-900">
                                        ¡Bienvenido{profile ? `, ${displayName}` : ''}!
                                    </h1>
                                    <p className="text-slate-600 text-sm max-w-xl">
                                        Tu voz cuenta con respaldo criptográfico. Responde consultas abiertas, gana puntos cívicos y canjea beneficios reales o cupones para tus propios eventos.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('surveys')}
                                    className="px-6 py-3.5 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-sky-500/25 flex items-center gap-2 shrink-0"
                                >
                                    Ver Encuestas ({openSurveysCount}) <ArrowRight size={16} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                    <p className="text-xs font-bold text-slate-400 uppercase">Encuestas Activas</p>
                                    <p className="text-3xl font-black text-sky-600 mt-1">{openSurveysCount}</p>
                                </div>
                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                    <p className="text-xs font-bold text-slate-400 uppercase">Tus Participaciones</p>
                                    <p className="text-3xl font-black text-slate-900 mt-1">{profile?.participationsCount || 0}</p>
                                </div>
                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                    <p className="text-xs font-bold text-slate-400 uppercase">Puntos Disponibles</p>
                                    <p className="text-3xl font-black text-emerald-600 mt-1">{points} pts</p>
                                </div>
                            </div>

                            {featuredSurvey && (
                                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800">
                                            Destacada · +{featuredSurvey.rewardPoints} pts
                                        </span>
                                        <span className="text-xs text-slate-500 font-semibold">
                                            {featuredSurvey.participantsCount} respuestas registradas
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900">{featuredSurvey.title}</h3>
                                    {featuredSurvey.description && (
                                        <p className="text-sm text-slate-600">{featuredSurvey.description}</p>
                                    )}
                                    <div className="flex flex-wrap gap-3 pt-1">
                                        {featuredSurvey.isOpenWindow && !answeredSurveyIds.has(String(featuredSurvey._id)) && (
                                            <button
                                                type="button"
                                                onClick={() => openRespondModal(featuredSurvey)}
                                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm flex items-center gap-2"
                                            >
                                                Participar Ahora <ArrowRight size={15} />
                                            </button>
                                        )}
                                        {featuredSurvey.results && (
                                            <button
                                                type="button"
                                                onClick={() => setResultsModalSurvey(featuredSurvey)}
                                                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-sm flex items-center gap-2"
                                            >
                                                <BarChart3 size={15} /> Ver Resultados
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-extrabold">¿Necesitas lanzar tu propia encuesta o votación?</h3>
                                    <p className="text-slate-300 text-sm mt-1">
                                        Encuestas desde $25.000 CLP y votaciones desde $50.000 CLP con activación automática sin esperas.
                                    </p>
                                </div>
                                <Link
                                    to="/login"
                                    className="px-5 py-3 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-100 shrink-0"
                                >
                                    Publicar Encuesta
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* SURVEYS TAB */}
                    {activeTab === 'surveys' && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl font-black text-slate-900">Encuestas Disponibles</h1>
                                    <p className="text-sm text-slate-500">Cada encuesta garantiza 1 participación por persona con nullifier Web3.</p>
                                </div>
                                <div className="relative w-full sm:w-64">
                                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Buscar encuesta..."
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm outline-none focus:border-sky-500"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 flex-wrap">
                                {['Todas', ...categories].map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
                                            selectedCategory === cat
                                                ? 'bg-sky-500 text-white'
                                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            {loadingSurveys ? (
                                <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center">
                                    <Loader2 className="animate-spin text-sky-500 mx-auto" size={36} />
                                </div>
                            ) : filteredSurveys.length === 0 ? (
                                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
                                    <ClipboardList size={42} className="text-slate-300 mx-auto" />
                                    <h3 className="font-bold text-slate-800 text-lg">Aún no hay encuestas en esta categoría</h3>
                                    <p className="text-sm text-slate-500 max-w-md mx-auto">
                                        Cuando una organización publique una encuesta ciudadana aparecerá aquí automáticamente.
                                    </p>
                                    <Link to="/login" className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 text-white rounded-xl text-sm font-bold hover:bg-sky-600">
                                        Crear la primera encuesta <ArrowRight size={15} />
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {filteredSurveys.map((survey) => {
                                        const alreadyAnswered = answeredSurveyIds.has(String(survey._id));
                                        return (
                                            <div key={survey._id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-5">
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                                        <span className="px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 text-[11px] font-bold">
                                                            {survey.category}
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] font-black">
                                                                +{survey.rewardPoints} pts
                                                            </span>
                                                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                                                survey.isOpenWindow ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                                            }`}>
                                                                {survey.isOpenWindow ? 'Abierta' : 'Finalizada'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <h3 className="text-lg font-bold text-slate-900 leading-snug">{survey.title}</h3>
                                                    {survey.description && (
                                                        <p className="text-sm text-slate-600 line-clamp-2">{survey.description}</p>
                                                    )}

                                                    <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                                                        <span>{survey.participantsCount} participaciones</span>
                                                        <span>·</span>
                                                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                                            <ShieldCheck size={13} /> {survey.anchoredCount} on-chain
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2.5 pt-2 border-t border-slate-100">
                                                    {alreadyAnswered ? (
                                                        <span className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center justify-center gap-1.5">
                                                            <CheckCircle2 size={15} /> Respondida
                                                        </span>
                                                    ) : survey.isOpenWindow ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => openRespondModal(survey)}
                                                            className="flex-1 py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                                                        >
                                                            Responder Encuesta <ArrowRight size={14} />
                                                        </button>
                                                    ) : null}

                                                    {survey.results && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setResultsModalSurvey(survey)}
                                                            className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
                                                        >
                                                            <BarChart3 size={14} /> Resultados
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* REWARDS TAB */}
                    {activeTab === 'rewards' && (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-3xl p-6 flex items-center justify-between flex-wrap gap-4 shadow-lg">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-sky-100">Balance Cívico</p>
                                    <h2 className="text-3xl font-black mt-1">{points} puntos disponibles</h2>
                                    <p className="text-xs text-sky-100 mt-1">Canjea certificados o cupones reales aplicables al lanzar tus propias votaciones/encuestas.</p>
                                </div>
                                <Gift size={44} className="text-white/80" />
                            </div>

                            {rewardMsg && (
                                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-sm font-semibold">
                                    {rewardMsg}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {rewardsCatalog.map((reward) => {
                                    const canAfford = points >= reward.pointsCost;
                                    return (
                                        <div key={reward.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between gap-4">
                                            <div>
                                                <div className="flex items-center justify-between gap-2 mb-2">
                                                    <span className="px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 text-[11px] font-bold">
                                                        {reward.badge}
                                                    </span>
                                                    <span className="text-sm font-black text-slate-900">{reward.pointsCost} pts</span>
                                                </div>
                                                <h3 className="font-bold text-slate-900">{reward.title}</h3>
                                                <p className="text-xs text-slate-500 mt-1">{reward.description}</p>
                                            </div>
                                            <button
                                                type="button"
                                                disabled={redeemingId === reward.id || (!canAfford && Boolean(citizenToken))}
                                                onClick={() => handleRedeem(reward.id)}
                                                className={`w-full py-2.5 rounded-xl font-bold text-xs transition-colors ${
                                                    !citizenToken || canAfford
                                                        ? 'bg-slate-900 hover:bg-slate-800 text-white'
                                                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                }`}
                                            >
                                                {redeemingId === reward.id
                                                    ? 'Canjeando...'
                                                    : !citizenToken
                                                        ? 'Identifícate para canjear'
                                                        : canAfford
                                                            ? `Canjear por ${reward.pointsCost} pts`
                                                            : `Te faltan ${reward.pointsCost - points} pts`}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            {(profile?.redemptions || []).length > 0 && (
                                <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
                                    <h3 className="font-bold text-slate-900">Tus Códigos y Canjes</h3>
                                    <div className="space-y-2">
                                        {profile.redemptions.map((item) => (
                                            <div key={item._id || item.code} className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                                                <div>
                                                    <p className="font-bold text-sm text-slate-900">{item.rewardTitle}</p>
                                                    <p className="text-xs text-slate-500">
                                                        Código: <span className="font-mono font-bold text-blue-600">{item.code}</span> · {item.pointsCost} pts
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => copyText(item.code)}
                                                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1"
                                                >
                                                    {copiedCode === item.code ? <><Check size={13} /> Copiado</> : <><Copy size={13} /> Copiar</>}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* PROFILE TAB */}
                    {activeTab === 'profile' && (
                        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 max-w-xl shadow-sm space-y-5">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900">Mis datos</h2>
                                <p className="text-sm text-slate-500 mt-1">
                                    Vincula tu RUT / Cédula para guardar tus puntos e historial y responder encuestas en 1 clic. Nunca vinculamos tu RUT a tus respuestas elegidas.
                                </p>
                            </div>

                            {profile?.maskedCedula && (
                                <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3.5 text-xs text-sky-800 font-semibold">
                                    Sesión activa asociada a RUT terminado en {profile.maskedCedula.replace('••••', '')}.
                                </div>
                            )}

                            <form onSubmit={handleSaveProfile} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-600 uppercase block mb-1">
                                        RUT / Cédula {citizenToken ? '(Opcional para actualizar otros datos)' : '*'}
                                    </label>
                                    <input
                                        required={!citizenToken}
                                        value={profileForm.cedula}
                                        onChange={(e) => setProfileForm({ ...profileForm, cedula: e.target.value })}
                                        placeholder="12.345.678-9"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-500 outline-none text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-600 uppercase block mb-1">Nombre o Alias</label>
                                    <input
                                        value={profileForm.displayName}
                                        onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                                        placeholder="ej: yurie"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-500 outline-none text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-600 uppercase block mb-1">Correo electrónico</label>
                                    <input
                                        type="email"
                                        value={profileForm.email}
                                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                        placeholder="tu@correo.cl"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-500 outline-none text-sm"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-600 uppercase block mb-1">Comuna</label>
                                        <input
                                            value={profileForm.commune}
                                            onChange={(e) => setProfileForm({ ...profileForm, commune: e.target.value })}
                                            placeholder="Providencia"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-500 outline-none text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-600 uppercase block mb-1">Región</label>
                                        <input
                                            value={profileForm.region}
                                            onChange={(e) => setProfileForm({ ...profileForm, region: e.target.value })}
                                            placeholder="Metropolitana"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-500 outline-none text-sm"
                                        />
                                    </div>
                                </div>

                                {profileMsg && (
                                    <p className="text-sm font-semibold text-sky-700 bg-sky-50 border border-sky-200 rounded-xl p-3">
                                        {profileMsg}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={savingProfile}
                                    className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-60"
                                >
                                    {savingProfile ? 'Guardando...' : 'Guardar Mis Datos'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* HISTORY TAB */}
                    {activeTab === 'history' && (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-black text-slate-900">Historial de Participación</h2>
                            {(!profile || (profile.history || []).length === 0) ? (
                                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-2">
                                    <History size={40} className="text-slate-300 mx-auto" />
                                    <p className="font-bold text-slate-700">Aún no registras participaciones en esta sesión.</p>
                                    <p className="text-xs text-slate-500">Responde una encuesta o identifícate en Mis datos con el RUT que usaste antes.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {profile.history.map((item) => (
                                        <div key={item._id || item.ballotCommitment} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-bold text-slate-900">{item.electionTitle}</span>
                                                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold">
                                                        +{item.pointsEarned} pts
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500">
                                                    {item.category} · {new Date(item.participatedAt).toLocaleString('es-CL')}
                                                </p>
                                                {item.ballotCommitment && (
                                                    <p className="text-[11px] font-mono text-slate-400 break-all">
                                                        Commitment: {item.ballotCommitment}
                                                    </p>
                                                )}
                                            </div>
                                            {item.explorerUrl && (
                                                <a
                                                    href={item.explorerUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0"
                                                >
                                                    Ver TX Blockchain <ExternalLink size={13} />
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            {/* RESPOND SURVEY MODAL */}
            {respondingSurvey && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700">
                                    {respondingSurvey.category} · +{respondingSurvey.rewardPoints} pts
                                </span>
                                <h3 className="text-xl font-black text-slate-900 mt-1">{respondingSurvey.title}</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setRespondingSurvey(null)}
                                className="p-2 rounded-xl hover:bg-slate-100 text-slate-500"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-5 flex-1">
                            {voteSuccess ? (
                                <div className="space-y-5 text-center py-4">
                                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                                        <CheckCircle2 size={34} />
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-black text-slate-900">¡Gracias por participar!</h4>
                                        <p className="text-sm text-slate-600 mt-1">
                                            Sumaste <strong className="text-sky-600">+{voteSuccess.pointsAwarded} puntos</strong> y tu participación quedó sellada.
                                        </p>
                                    </div>

                                    {voteSuccess.receipt && (
                                        <div className="bg-slate-900 text-white rounded-2xl p-4 text-left text-xs space-y-2">
                                            <p className="text-slate-400 font-bold uppercase text-[10px]">Comprobante Web3</p>
                                            <p className="font-mono text-emerald-400 break-all">{voteSuccess.receipt.ballotCommitment}</p>
                                            {voteSuccess.receipt.web3?.explorerUrl && (
                                                <a
                                                    href={voteSuccess.receipt.web3.explorerUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1.5 text-sky-300 hover:underline font-bold"
                                                >
                                                    Ver en Polygonscan <ExternalLink size={12} />
                                                </a>
                                            )}
                                        </div>
                                    )}

                                    {voteSuccess.surveyResults && (
                                        <div className="text-left pt-2">
                                            <h5 className="font-bold text-slate-900 mb-3">Resultados en vivo</h5>
                                            <ResultsPanel survey={respondingSurvey} results={voteSuccess.surveyResults} />
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => setRespondingSurvey(null)}
                                        className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmitResponse} className="space-y-5">
                                    {respondingSurvey.description && (
                                        <p className="text-sm text-slate-600">{respondingSurvey.description}</p>
                                    )}

                                    {!citizenToken && (
                                        <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 space-y-3">
                                            <p className="text-xs text-sky-800 font-semibold">
                                                Ingresa tu RUT / Cédula para validar 1 respuesta única por ciudadano (jamás se asocia públicamente a tu opinión).
                                            </p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <input
                                                    required
                                                    value={quickCedula}
                                                    onChange={(e) => setQuickCedula(e.target.value)}
                                                    placeholder="RUT o Cédula *"
                                                    className="px-3.5 py-2.5 rounded-xl border border-sky-200 bg-white text-sm outline-none"
                                                />
                                                <input
                                                    value={quickAlias}
                                                    onChange={(e) => setQuickAlias(e.target.value)}
                                                    placeholder="Alias o Nombre (opcional)"
                                                    className="px-3.5 py-2.5 rounded-xl border border-sky-200 bg-white text-sm outline-none"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {Array.isArray(respondingSurvey.questions) && respondingSurvey.questions.length > 0 ? (
                                        <div className="space-y-4">
                                            {respondingSurvey.questions.map((q, idx) => (
                                                <div key={q._id} className="border border-slate-200 rounded-2xl p-4 space-y-2.5">
                                                    <p className="font-bold text-slate-900 text-sm">
                                                        {idx + 1}. {q.prompt}
                                                        <span className="text-xs font-normal text-slate-400 ml-2">
                                                            {q.allowMultiple ? '(Selección múltiple)' : '(Una opción)'}
                                                        </span>
                                                    </p>
                                                    <div className="space-y-2">
                                                        {(q.options || []).map((opt) => {
                                                            const checked = (multiAnswers[q._id] || []).includes(opt.label);
                                                            return (
                                                                <label
                                                                    key={opt._id || opt.label}
                                                                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                                                                        checked ? 'border-sky-500 bg-sky-50' : 'border-slate-200 hover:bg-slate-50'
                                                                    }`}
                                                                >
                                                                    <input
                                                                        type={q.allowMultiple ? 'checkbox' : 'radio'}
                                                                        name={`q-${q._id}`}
                                                                        checked={checked}
                                                                        onChange={() => toggleMultiOption(q._id, opt.label, q.allowMultiple)}
                                                                        className="text-sky-600"
                                                                    />
                                                                    <span className="text-sm font-medium text-slate-800">{opt.label}</span>
                                                                </label>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="space-y-2.5">
                                            {(respondingSurvey.candidates || []).map((opt) => (
                                                <label
                                                    key={opt._id}
                                                    className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                                                        selectedCandidateId === opt._id
                                                            ? 'border-sky-500 bg-sky-50'
                                                            : 'border-slate-200 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="singleChoice"
                                                        checked={selectedCandidateId === opt._id}
                                                        onChange={() => setSelectedCandidateId(opt._id)}
                                                        className="text-sky-600"
                                                    />
                                                    <div>
                                                        <p className="font-bold text-slate-900 text-sm">{opt.name}</p>
                                                        {opt.description && <p className="text-xs text-slate-500">{opt.description}</p>}
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    )}

                                    {voteError && (
                                        <p className="text-sm font-semibold text-red-600 bg-red-50 border border-red-200 p-3 rounded-xl">
                                            {voteError}
                                        </p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={submittingVote}
                                        className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                                    >
                                        {submittingVote ? <><Loader2 size={16} className="animate-spin" /> Sellando respuesta en Web3...</> : 'Enviar Respuesta'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* RESULTS MODAL */}
            {resultsModalSurvey && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <span className="text-xs font-bold text-sky-600">{resultsModalSurvey.category}</span>
                                <h3 className="text-xl font-black text-slate-900">{resultsModalSurvey.title}</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setResultsModalSurvey(null)}
                                className="p-2 rounded-xl hover:bg-slate-100 text-slate-500"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <ResultsPanel survey={resultsModalSurvey} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlazaCiudadana;
