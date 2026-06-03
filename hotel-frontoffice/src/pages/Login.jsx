import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdHotel, MdLockOutline, MdMailOutline } from 'react-icons/md';
import ActionButton from '../components/ActionButton';

const Login = () => {
  const [email, setEmail] = useState('praveen.reddy@blackcube.ae');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    
    // Success dummy auth
    localStorage.setItem('isAuthenticated', 'true');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-main px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 space-y-6">
        
        {/* Logo & Brand */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="h-12 w-12 bg-primary text-accent rounded-xl flex items-center justify-center shadow-md">
            <MdHotel size={28} />
          </div>
          <h2 className="text-2xl font-bold text-primary mt-2">BlackCube FrontOffice</h2>
          <p className="text-sm text-text-muted">Enter your credentials to access the HMS dashboard</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Email Address</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-400">
                <MdMailOutline size={20} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@snowlinebloom.com"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm text-text-main focus:border-accent outline-none bg-slate-50 transition-colors"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Password</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-400">
                <MdLockOutline size={20} />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm text-text-main focus:border-accent outline-none bg-slate-50 transition-colors"
              />
            </div>
          </div>

          {/* Remember me & Forgot password */}
          <div className="flex-between text-xs font-medium text-text-muted pt-1">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-slate-300 text-accent focus:ring-accent" />
              <span>Remember me</span>
            </label>
            <span className="hover:underline cursor-pointer hover:text-accent transition-colors">Forgot Password?</span>
          </div>

          {/* Submit */}
          <ActionButton
            type="submit"
            variant="primary"
            className="w-full py-3"
          >
            Sign In to Dashboard
          </ActionButton>
        </form>

        {/* Info Box */}
        <div className="border-t border-slate-100 pt-4 text-center">
          <p className="text-xs text-text-muted leading-relaxed">
            Authorized Front Office Staff Only. <br />
            Support: <a href="https://blackcube.ae/" className="font-semibold text-primary hover:underline">BlackCube Solutions</a>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;
