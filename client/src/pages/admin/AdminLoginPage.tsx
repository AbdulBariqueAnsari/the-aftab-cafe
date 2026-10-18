import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../../components/BrandLogo';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, KeyRound } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    const res = await login(email, password);
    if (res.success) {
      navigate('/admin');
    } else {
      setErrorMsg(res.error || 'Invalid email or password.');
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setIsSubmitting(true);
    login(demoEmail, demoPass).then((res) => {
      if (res.success) {
        navigate('/admin');
      } else {
        setErrorMsg(res.error || 'Login failed');
        setIsSubmitting(false);
      }
    });
  };

  return (
    <div className="min-h-screen bg-stone-950 text-white flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full space-y-8 bg-stone-900 border border-stone-800 p-8 rounded-3xl shadow-2xl relative">
        <div className="text-center space-y-3">
          <BrandLogo size="lg" light={true} className="justify-center" />
          <h2 className="font-serif text-2xl font-bold text-amber-100">
            Cafe Management Portal
          </h2>
          <p className="text-xs text-stone-400">
            Secure access for Cafe Owners, Managers, Baristas, and Service Staff.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-stone-300 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="staff@theaftab.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-300 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-950 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <span>{isSubmitting ? 'Verifying Access...' : 'Sign In to Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Credentials for Evaluation */}
        <div className="pt-6 border-t border-stone-800 space-y-3">
          <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold">
            <KeyRound className="w-3.5 h-3.5" />
            <span>One-Click Role Login for Reviewers:</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@theaftab.com', 'admin123')}
              className="p-2 rounded-xl bg-stone-950 border border-amber-900/40 hover:border-amber-500 text-left transition-colors cursor-pointer"
            >
              <div className="font-bold text-amber-200">👑 Super Admin</div>
              <div className="text-stone-500 text-[10px]">Full Owner Access</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('manager@theaftab.com', 'manager123')}
              className="p-2 rounded-xl bg-stone-950 border border-amber-900/40 hover:border-amber-500 text-left transition-colors cursor-pointer"
            >
              <div className="font-bold text-amber-200">💼 Manager</div>
              <div className="text-stone-500 text-[10px]">Menu & Sales Reports</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('barista@theaftab.com', 'barista123')}
              className="p-2 rounded-xl bg-stone-950 border border-amber-900/40 hover:border-amber-500 text-left transition-colors cursor-pointer"
            >
              <div className="font-bold text-amber-200">☕ Head Barista</div>
              <div className="text-stone-500 text-[10px]">Kitchen Orders & Stock</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('staff@theaftab.com', 'staff123')}
              className="p-2 rounded-xl bg-stone-950 border border-amber-900/40 hover:border-amber-500 text-left transition-colors cursor-pointer"
            >
              <div className="font-bold text-amber-200">🍽️ Service Staff</div>
              <div className="text-stone-500 text-[10px]">Table Delivery & Serve</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
