import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/Button';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = (import.meta as any).env.VITE_GOOGLE_CLIENT_ID || '';

const GoogleLoginButton = ({ onSuccess, onLoading }: { onSuccess: (res: any) => void, onLoading: () => void }) => {
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => onSuccess(tokenResponse),
  });

  return (
    <button
      type="button"
      onClick={() => {
        onLoading();
        login();
      }}
      className="flex items-center justify-center gap-3 w-full bg-white border border-slate-200 rounded-full h-12 hover:bg-slate-50 transition-colors font-medium text-slate-700 text-sm shadow-sm"
    >
      <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
      Continue with Google
    </button>
  );
};

export default function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const payload = credentialResponse.credential
        ? { credential: credentialResponse.credential }
        : { access_token: credentialResponse.access_token };

      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        if (data.user?.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        alert(data.error || 'Google Login failed');
      }
    } catch (err) {
      alert('Network error during Google Login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        if (data.user?.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="flex flex-col min-h-screen bg-slate-50 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-slate-500" />
          </button>
          <span className="text-sm font-bold text-slate-900">Sign In</span>
          <div className="w-8"></div> {/* Spacer */}
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h1>
            <p className="text-slate-500">Sign in to book your next jam session.</p>
          </div>

          {/* Social Login */}
          <div className="flex flex-col gap-3 mb-8 items-center">
            <GoogleLoginButton
              onSuccess={handleGoogleSuccess}
              onLoading={() => setIsLoading(true)}
            />
          </div>

          <div className="relative flex py-2 items-center mb-6">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-xs font-medium uppercase tracking-wider">Or continue with email</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 h-12 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 text-slate-900"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-700">Password</label>
                <a href="#" className="text-xs font-medium text-indigo-600 hover:text-indigo-700">Forgot?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 h-12 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 text-slate-900"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <Button type="submit" size="lg" className="mt-4 w-full shadow-lg shadow-indigo-200" isLoading={isLoading}>
              Sign In
            </Button>
          </form>

          <p className="text-center mt-8 text-slate-500 text-sm">
            Don't have an account? <button type="button" onClick={() => navigate('/signup')} className="text-indigo-600 font-bold hover:underline">Sign up</button>
          </p>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
