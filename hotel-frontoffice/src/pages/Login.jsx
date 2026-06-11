import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdHotel, MdLockOutline, MdBadge, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import ActionButton from '../components/ActionButton';
import { loginStaff } from '../api/auth';
import { setCookie } from '../api/cookieHelper';

const Login = () => {
  const [staffCode, setStaffCode] = useState('STF-02');
  const [password, setPassword] = useState('SarahHMS2026');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!staffCode || !password) {
      setError('Please fill in all fields.');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await loginStaff(staffCode, password);
      if (response && response.success) {
        const { token, profile } = response.data;
        
        // Save auth details in secure cookies
        setCookie('employeeToken', token, 7);
        setCookie('employeeName', profile.name, 7);
        setCookie('employeeRole', profile.role, 7);
        setCookie('employeeCode', profile.uniqueCode, 7);
        
        localStorage.setItem('isAuthenticated', 'true');
        navigate('/dashboard');
      } else {
        setError(response.message || 'Authentication failed.');
      }
    } catch (err) {
      console.error('Staff Login Error:', err);
      const errMsg = err.response?.data?.message || 'Unable to connect to the backend server. Please verify Django is running.';
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
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
          {/* Staff Code input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Staff Code / ID</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-400">
                <MdBadge size={20} />
              </span>
              <input
                type="text"
                required
                value={staffCode}
                onChange={(e) => setStaffCode(e.target.value)}
                placeholder="e.g. STF-02 or 29384756"
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
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm text-text-main focus:border-accent outline-none bg-slate-50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex="-1"
              >
                {showPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
              </button>
            </div>
          </div>

          {/* Remember me & Forgot password */}
          <div className="flex-between text-xs font-medium text-text-muted pt-1">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-slate-300 text-accent focus:ring-accent" />
              <span>Remember me</span>
            </label>
            {/* <span className="hover:underline cursor-pointer hover:text-accent transition-colors">Forgot Password?</span> */}
          </div>

          {/* Submit */}
          <ActionButton
            type="submit"
            variant="primary"
            className="w-full py-3"
            disabled={isLoading}
          >
            {isLoading ? 'Verifying Credentials...' : 'Sign In to Dashboard'}
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
