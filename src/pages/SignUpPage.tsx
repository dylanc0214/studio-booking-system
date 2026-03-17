import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/Button';

export default function SignUpPage() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // API call
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                navigate('/dashboard'); // Or wherever it should go after signup
            } else {
                alert(data.error || 'Registration failed');
            }
        } catch (err) {
            alert('Network error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ArrowLeft size={24} className="text-slate-500" />
                </button>
                <span className="text-sm font-bold text-slate-900">Sign Up</span>
                <div className="w-8"></div> {/* Spacer */}
            </div>

            <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Create an Account</h1>
                    <p className="text-slate-500">Sign up to book your next jam session.</p>
                </div>

                {/* Social Login */}
                <div className="flex flex-col gap-3 mb-8">
                    <button className="flex items-center justify-center gap-3 w-full bg-white border border-slate-200 rounded-full h-12 hover:bg-slate-50 transition-colors font-medium text-slate-700 text-sm shadow-sm">
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                        Sign up with Google
                    </button>
                    <button className="flex items-center justify-center gap-3 w-full bg-slate-900 text-white rounded-full h-12 hover:bg-slate-800 transition-colors font-medium text-sm shadow-lg shadow-slate-200">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.21-.93 3.69-.93.95 0 1.93.29 2.76.74-2.47 1.34-2.66 4.27-1.11 5.68-.59 1.51-1.35 2.92-2.42 4.74zM12.03 5.31c-.13-2.45 1.61-4.63 4.06-4.94.32 2.76-2.68 4.62-4.06 4.94z" /></svg>
                        Sign up with Apple
                    </button>
                </div>

                <div className="relative flex py-2 items-center mb-6">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink mx-4 text-slate-400 text-xs font-medium uppercase tracking-wider">Or continue with email</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                </div>

                {/* Email Form */}
                <form onSubmit={handleSignUp} className="flex flex-col gap-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-11 pr-4 h-12 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 text-slate-900"
                                placeholder="Enter your name"
                                required
                            />
                        </div>
                    </div>

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
                        <label className="text-sm font-medium text-slate-700">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-11 pr-12 h-12 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 text-slate-900"
                                placeholder="Create a password"
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
                        Sign Up
                    </Button>
                </form>

                <p className="text-center mt-8 text-slate-500 text-sm">
                    Already have an account? <button type="button" onClick={() => navigate('/auth')} className="text-indigo-600 font-bold hover:underline">Sign in</button>
                </p>
            </div>
        </div>
    );
}
