import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    CheckCircle, User, Info, Loader2, ChevronRight,
    ShieldCheck, Lock, AlertTriangle, FileText, XCircle, ExternalLink, Copy, Check
} from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config.js';

const VotingBooth = () => {
    const { electionId } = useParams();
    const navigate = useNavigate();

    const [election, setElection] = useState(null);
    const [voter, setVoter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [voted, setVoted] = useState(false);
    const [voteReceipt, setVoteReceipt] = useState(null);
    const [copiedHash, setCopiedHash] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBoothData = async () => {
            const token = localStorage.getItem('voterToken');
            const voterData = JSON.parse(localStorage.getItem('voterInfo') || '{}');

            if (!token || !voterData.id) {
                navigate(`/vote/${electionId}`);
                return;
            }

            setVoter(voterData);

            try {
                const res = await axios.get(`${API_URL}/api/elections/${electionId}`);
                setElection(res.data.data);
            } catch (err) {
                console.error("Error fetching election data:", err);
                setError("No se pudo cargar la información de la elección.");
            } finally {
                setLoading(false);
            }
        };
        fetchBoothData();
    }, [electionId, navigate]);

    const handleCastVote = async () => {
        if (!selectedCandidate) return;
        setSubmitting(true);
        setError('');

        try {
            const token = localStorage.getItem('voterToken');
            const res = await axios.post(`${API_URL}/api/ballots`, {
                candidateId: selectedCandidate === 'blank' || selectedCandidate === 'nulo' ? null : selectedCandidate._id,
                electionId: electionId,
                isNulo: selectedCandidate === 'nulo'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setVoteReceipt(res.data?.data || null);
            setVoted(true);
            localStorage.removeItem('voterToken');
            localStorage.removeItem('voterInfo');
        } catch (err) {
            const serverError = err.response?.data?.error || err.response?.data?.message;
            setError(serverError || 'Hubo un error al procesar tu voto. Por favor reintenta.');
        } finally {
            setSubmitting(false);
        }
    };

    const copyReceiptCommitment = () => {
        if (!voteReceipt?.ballotCommitment) return;
        navigator.clipboard.writeText(voteReceipt.ballotCommitment);
        setCopiedHash(true);
        setTimeout(() => setCopiedHash(false), 2500);
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-500" size={48} />
        </div>
    );

    if (voted) return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] p-8 md:p-12 max-w-lg w-full text-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <CheckCircle size={48} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-3">¡Voto Recibido!</h2>
                <p className="text-slate-500 mb-6 font-medium leading-relaxed text-sm">
                    Tu voto fue sellado criptográficamente sin exponer tu identidad ni tu preferencia en la blockchain.
                </p>

                {voteReceipt && (
                    <div className="bg-slate-900 text-left rounded-2xl p-5 mb-6 space-y-3 border border-slate-800">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Comprobante Criptográfico (Commitment)
                            </span>
                            <button
                                type="button"
                                onClick={copyReceiptCommitment}
                                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold"
                            >
                                {copiedHash ? <><Check size={13} /> Copiado</> : <><Copy size={13} /> Copiar</>}
                            </button>
                        </div>
                        <p className="font-mono text-[11px] text-emerald-400 break-all bg-slate-950/70 p-2.5 rounded-lg">
                            {voteReceipt.ballotCommitment}
                        </p>

                        {voteReceipt.web3?.anchored ? (
                            <div className="pt-2 border-t border-slate-800 space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-emerald-400 font-bold">⛓️ Anclado On-Chain</span>
                                    <span className="text-slate-400">{voteReceipt.web3.network} · Bloque #{voteReceipt.web3.blockNumber}</span>
                                </div>
                                <p className="font-mono text-[11px] text-blue-300 break-all">
                                    TX: {voteReceipt.web3.txHash}
                                </p>
                                {voteReceipt.web3.explorerUrl && (
                                    <a
                                        href={voteReceipt.web3.explorerUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                                    >
                                        Verificar en Explorador Blockchain <ExternalLink size={14} />
                                    </a>
                                )}
                            </div>
                        ) : (
                            <p className="text-[11px] text-amber-300 pt-1">
                                Comprobante sellado con hash local ({voteReceipt.hash?.slice(0, 18)}...).
                            </p>
                        )}
                    </div>
                )}

                <button
                    onClick={() => navigate('/')}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
                >
                    Volver al Inicio
                </button>
            </div>
        </div>
    );

    const candidates = election?.candidates || [];

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 md:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-blue-600 font-bold text-sm tracking-wider uppercase">
                            <Lock size={14} /> Cabina de Votación Segura
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">{election?.title}</h1>
                        <p className="text-slate-500 font-medium">Elección oficial de Einsoft Ballots</p>
                    </div>

                    <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl shadow-sm flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                            <User size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase">Votante Identificado</p>
                            <p className="text-sm font-bold text-slate-700">{voter?.name}</p>
                            {election?.settings?.weightedVoting && (
                                <p className="text-[11px] font-bold text-indigo-600">Ponderación: {voter?.weight || 1}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-100 p-6 rounded-[2rem] flex gap-4 items-center">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/20">
                        <Info size={24} />
                    </div>
                    <p className="text-blue-800 font-medium leading-tight">
                        Por favor, selecciona una de las opciones a continuación y presiona "Confirmar Mi Voto".
                        Recuerda que una vez enviado, no podrás cambiar tu elección.
                    </p>
                </div>

                {/* Candidates Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {candidates.map((candidate) => (
                        <div
                            key={candidate._id}
                            onClick={() => setSelectedCandidate(candidate)}
                            className={`group relative bg-white border-2 rounded-[2rem] p-6 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${selectedCandidate?._id === candidate._id
                                ? 'border-blue-600 ring-8 ring-blue-600/5 shadow-2xl bg-blue-50/30'
                                : 'border-slate-100 hover:border-blue-300 hover:shadow-lg'
                                }`}
                        >
                            <div className="flex gap-5">
                                <div className="shrink-0">
                                    {candidate.imageUrl ? (
                                        <img
                                            src={candidate.imageUrl}
                                            alt={candidate.name}
                                            className="w-24 h-24 object-cover rounded-2xl shadow-md border-2 border-slate-50"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300">
                                            <User size={40} />
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-1 py-1">
                                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                        {candidate.name}
                                    </h3>
                                    <p className="text-sm text-slate-500 line-clamp-3 font-medium">
                                        {candidate.description || 'Sin propuesta detallada registrada.'}
                                    </p>
                                </div>
                            </div>

                            {selectedCandidate?._id === candidate._id && (
                                <div className="absolute top-4 right-4 text-blue-600 animate-bounce">
                                    <CheckCircle size={28} />
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Voto Nulo Option */}
                    <div
                        onClick={() => setSelectedCandidate('nulo')}
                        className={`group relative bg-white border-2 rounded-[2rem] p-6 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${selectedCandidate === 'nulo'
                            ? 'border-red-600 ring-8 ring-red-600/5 shadow-2xl bg-red-50/30'
                            : 'border-slate-100 hover:border-red-300 hover:shadow-lg'
                            }`}
                    >
                        <div className="flex gap-5">
                            <div className="shrink-0 text-red-500">
                                <div className="w-24 h-24 bg-red-50 rounded-2xl flex items-center justify-center border-2 border-red-100">
                                    <XCircle size={40} />
                                </div>
                            </div>
                            <div className="space-y-1 py-1">
                                <h3 className="text-xl font-black text-slate-900 group-hover:text-red-600 transition-colors">Voto Nulo</h3>
                                <p className="text-sm text-slate-500 font-medium">Anula tu voto formalmente para que sea contabilizado en el acta.</p>
                            </div>
                        </div>
                        {selectedCandidate === 'nulo' && (
                            <div className="absolute top-4 right-4 text-red-600 animate-bounce">
                                <CheckCircle size={28} />
                            </div>
                        )}
                    </div>

                    {/* Voto en Blanco Option */}
                    <div
                        onClick={() => setSelectedCandidate('blank')}
                        className={`group relative bg-white border-2 border-dashed rounded-[2rem] p-6 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center ${selectedCandidate === 'blank'
                            ? 'border-amber-500 ring-8 ring-amber-500/5 shadow-2xl bg-amber-50/30'
                            : 'border-slate-200 hover:border-amber-300 hover:shadow-lg'
                            }`}
                    >
                        <div className="text-center space-y-2">
                            <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center transition-colors ${selectedCandidate === 'blank' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                <FileText size={24} />
                            </div>
                            <h3 className={`text-xl font-bold transition-colors ${selectedCandidate === 'blank' ? 'text-amber-600' : 'text-slate-500'}`}>
                                Voto en Blanco
                            </h3>
                            <p className="text-xs text-slate-400 font-medium italic">No selecciono ningún candidato</p>
                        </div>
                        {selectedCandidate === 'blank' && (
                            <div className="absolute top-4 right-4 text-amber-500 animate-bounce">
                                <CheckCircle size={28} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Final Submission Card */}
                <div className={`transition-all duration-500 p-8 rounded-[2.5rem] bg-white border border-slate-200 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 ${!selectedCandidate ? 'opacity-50 grayscale' : 'opacity-100'}`}>
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl">
                            <ShieldCheck size={32} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900">Confirmación de Voto</h3>
                            <p className="text-slate-500 font-medium">Tu elección será sellada criptográficamente antes del envío.</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 w-full md:w-auto">
                        <button
                            disabled={!selectedCandidate || submitting}
                            onClick={handleCastVote}
                            className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white px-10 py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-2xl shadow-slate-900/30 active:scale-95 group"
                        >
                            {submitting ? <Loader2 className="animate-spin" size={24} /> : (
                                <>
                                    Confirmar Mi Voto
                                    <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                        {error && (
                            <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-xl border border-red-100">
                                <AlertTriangle size={16} />
                                <span className="text-xs font-bold">{error}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                        Sistema de Votación Einsoft · Respaldo Criptográfico Web3 · 2026
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VotingBooth;

