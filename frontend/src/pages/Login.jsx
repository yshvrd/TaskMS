import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, CheckSquare, AlertCircle, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');

  // Hide the success message after 2 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        window.history.replaceState({}, document.title);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.access_token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center relative overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-70"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-70"></div>

      <div className="relative sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-indigo-200">
              <CheckSquare className="h-8 w-8 text-white" />
            </div>
            <span className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">
              TaskMS
            </span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl py-10 px-8 shadow-2xl shadow-slate-200/50 sm:rounded-3xl border border-white">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
            <p className="text-sm text-slate-500 mt-2">Enter your credentials to access your workspace</p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            
            {/* Error Banner */}
            {error && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="h-5 w-5 text-rose-500 mt-0.5 mr-3 shrink-0" />
                <p className="text-sm text-rose-700 font-medium">{error}</p>
              </div>
            )}

            {/* Success Banner */}
            {successMessage && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start animate-in fade-in slide-in-from-top-2 duration-300">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 mr-3 shrink-0" />
                <p className="text-sm text-emerald-700 font-medium">{successMessage}</p>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 pl-1">Email address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    required
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between pl-1 mb-1.5">
                  <label className="block text-sm font-medium text-slate-700">Password</label>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type="password"
                    required
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center text-sm text-slate-500">
            Don't have an account? Contact your administrator.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
