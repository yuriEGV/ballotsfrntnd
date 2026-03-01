import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LockKeyhole, Fingerprint, ShieldCheck, Loader2 } from 'lucide-react';
import axios from 'axios';

const civicQuotes = [
    { text: "La democracia es el gobierno del pueblo, por el pueblo, para el pueblo.", author: "Abraham Lincoln" },
    { text: "El voto es el instrumento más poderoso que jamás se ha inventado para romper la injusticia.", author: "Lyndon B. Johnson" },
    { text: "Un hombre sin voto es un hombre sin protección.", author: "Lyndon B. Johnson" },
    { text: "Votar no es solo nuestro derecho, es nuestro poder.", author: "Loung Ung" },
    { text: "La ignorancia del votante en una democracia garantiza la seguridad del candidato.", author: "Bill Moyers" },
    { text: "Cada vez que votas, estás apoyando el tipo de mundo en el que quieres vivir.", author: "Anne Lappe" }
];

const VotingGateway = () => {
    const { electionId } = useParams();
    const navigate = useNavigate();

    const [cedula, setCedula] = useState('');
    const [status, setStatus] = useState('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [randomQuote, setRandomQuote] = useState(civicQuotes[0]);

    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * civicQuotes.length);
        setRandomQuote(civicQuotes[randomIndex]);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!cedula.trim()) return;

        setStatus('loading');
        setErrorMsg('');

        try {
            const res = await axios.post('http://localhost:3000/api/voters/auth', {
                electionId,
                cedula: cedula.trim()
            });

            const { token, voter, election } = res.data.data;

            // Store token securely
            localStorage.setItem('voterToken', token);
            localStorage.setItem('voterInfo', JSON.stringify(voter));
            localStorage.setItem('electionInfo', JSON.stringify(election));

            setStatus('success');
        } catch (err) {
            console.error(err);
            setStatus('error');
            const msg = err.response?.data?.message || 'Error al validar identidad';

            if (err.response?.status === 401) {
                setErrorMsg('El RUT ingresado no se encuentra en el padrón de esta elección. Por favor, verifica los datos o contacta al organizador.');
            } else if (err.response?.status === 403) {
                setErrorMsg('Este RUT ya ha registrado su voto para esta elección.');
            } else if (err.response?.status === 404) {
                setErrorMsg('La elección no existe o ya no se encuentra activa.');
            } else {
                setErrorMsg(msg);
            }
        }
    };

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                <div className="bg-slate-800 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl border border-slate-700">
                    <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Identidad Validada</h2>
                    <p className="text-slate-400 mb-8">El sistema ha encriptado tu conexión de forma segura.</p>
                    <button
                        onClick={() => window.location.href = `/booth/${electionId}`}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/30">
                        Ingresar a la Urna
                    </button>
                    <button
                        onClick={() => setStatus('idle')}
                        className="w-full mt-4 py-2 text-slate-500 hover:text-slate-300 text-sm font-bold transition-all">
                        ← Volver
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Abstract Background */}
            <div className="absolute top-0 right-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[120px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[120px]" />
            </div>

            <div className="w-full max-w-md space-y-6">
                <div className="bg-white p-8 md:p-12 rounded-3xl w-full shadow-2xl border border-slate-100 relative">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 transform -rotate-6">
                            <LockKeyhole className="text-white w-8 h-8 transform rotate-6" />
                        </div>
                    </div>

                    <div className="text-center mt-8 mb-8">
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Ballots Einsoft</h2>
                        <p className="text-slate-500 mt-2 text-sm font-medium">Validación segura de identidad</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex justify-between items-center">
                                Cédula de Identidad (RUT)
                                <Fingerprint className="text-blue-500 w-4 h-4" />
                            </label>
                            <input
                                required
                                type="text"
                                value={cedula}
                                onChange={(e) => setCedula(e.target.value)}
                                className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-medium text-lg text-center tracking-widest bg-slate-50 focus:bg-white"
                                placeholder="12.345.678-9"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'loading' || !cedula}
                            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-xl shadow-slate-900/20 flex justify-center items-center gap-2 group disabled:opacity-70 disabled:hover:bg-slate-900"
                        >
                            {status === 'loading' ? <Loader2 className="animate-spin" /> : 'Validar Identidad'}
                        </button>

                        {errorMsg && (
                            <p className="text-red-500 text-sm font-semibold text-center mt-4 bg-red-50 p-3 rounded-lg border border-red-100">
                                {errorMsg}
                            </p>
                        )}

                        <div className="flex justify-center mt-4">
                            <a href="/" className="text-slate-400 hover:text-blue-600 text-sm font-bold flex items-center gap-1.5 transition-colors">
                                ← Volver al Inicio
                            </a>
                        </div>
                    </form>

                    <div className="mt-8 text-center border-t border-slate-100 pt-6">
                        <p className="text-xs text-slate-400 font-medium flex items-center justify-center gap-1">
                            <ShieldCheck className="w-4 h-4" /> Conexión encriptada end-to-end
                        </p>
                    </div>
                </div>

                {/* Civic Quote */}
                <div className="text-center px-6">
                    <p className="text-slate-500 italic text-sm font-medium">"{randomQuote.text}"</p>
                    <p className="text-slate-400 text-xs font-semibold mt-1">- {randomQuote.author}</p>
                </div>
            </div>
        </div>
    );
};

export default VotingGateway;
