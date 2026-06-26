import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, Loader2, CheckCircle, AlertCircle, Recycle } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            setSuccess('✅ Password reset link sent to your email!');
            setEmail('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-12">
            <div className="max-w-md w-full bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-slate-200/60">
                <div className="text-center mb-6">
                    <Link to="/auth/login" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mb-4">
                        <ArrowLeft className="h-4 w-4" /> Back to Login
                    </Link>
                    <div className="h-14 w-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 mx-auto">
                        <Recycle className="h-7 w-7 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mt-4">Reset Password</h2>
                    <p className="text-sm text-slate-500">Enter your email to receive a reset link</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-3 bg-emerald-50 border-l-4 border-emerald-500 rounded-lg flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                        <p className="text-sm text-emerald-700">{success}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Email Address</label>
                        <div className="relative">
                            <Mail className="h-5 w-5 text-slate-400 absolute left-3 top-3" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 transition disabled:opacity-50"
                    >
                        {loading ? (
                            <><Loader2 className="animate-spin h-5 w-5 inline mr-2" /> Sending...</>
                        ) : (
                            <><Send className="h-5 w-5 inline mr-2" /> Send Reset Link</>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;