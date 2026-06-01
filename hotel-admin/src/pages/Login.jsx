import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import ActionButton from '../components/ActionButton';
import { loginSuperAdmin } from '../api/auth';
import { setCookie } from '../api/cookieHelper';

const Login = () => {
  const [email, setEmail] = useState('admin@blackcube.ae');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  
  const navigate = useNavigate();

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const emailTrimmed = email.trim();
    const passwordTrimmed = password.trim();

    // 1. Strict Frontend Form Checks (Prevents API call if inputs are missing)
    if (!emailTrimmed && !passwordTrimmed) {
      const msg = 'Please enter both email and password.';
      setError(msg);
      addToast(msg, 'warning');
      return;
    }
    if (!emailTrimmed) {
      const msg = 'Please enter your email.';
      setError(msg);
      addToast(msg, 'warning');
      return;
    }
    if (!passwordTrimmed) {
      const msg = 'Please enter your password.';
      setError(msg);
      addToast(msg, 'warning');
      return;
    }

    setIsLoading(true);

    try {
      // Call the Super Admin login backend API via Axios
      const response = await loginSuperAdmin(emailTrimmed, passwordTrimmed);

      if (response && response.success) {
        const { token, profile } = response.data;

        // Persist admin authentication token and details in secure browser cookies (DevTools readable)
        setCookie('adminToken', token, 7); // Stores token for 7 days
        setCookie('adminUserEmail', profile.email, 7); // Stores user email for 7 days

        // Display premium success toast
        addToast('Login successful! Welcome to the Admin Portal.', 'success');

        // Delayed redirection so user can see toast notification
        setTimeout(() => {
          navigate('/');
          setIsLoading(false);
        }, 1200);
      } else {
        const errMsg = response.message || 'Login failed. Invalid credentials.';
        setError(errMsg);
        addToast(errMsg, 'error');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Super Admin authentication error:', err);
      
      // Parse custom error structures ('Email is wrong', 'Password is wrong') returned by Django
      const responseData = err.response?.data;
      const errMsg = responseData?.message || 'Unable to connect to the backend server. Please verify Django is running.';
      
      setError(errMsg);
      addToast(errMsg, 'error');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-main px-4 font-sans selection:bg-accent selection:text-white">
      {/* Dynamic light gradient accents */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[30%] -left-[20%] w-[70%] h-[70%] rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute -bottom-[30%] -right-[20%] w-[70%] h-[70%] rounded-full bg-slate-900/5 blur-[120px]" />
      </div>

      <div className="relative max-w-md w-full bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 p-8 space-y-6 z-10 animate-slide-up">
        
        {/* Brand/Logo Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="h-14 w-14 bg-primary text-accent rounded-2xl flex items-center justify-center shadow-lg border border-slate-800 transition-all hover:scale-105 duration-300">
            <ShieldAlert size={30} className="text-accent" />
          </div>
          <div className="space-y-1 mt-1">
            <h2 className="text-2xl font-bold tracking-tight text-primary">Hotel Admin Panel</h2>
            <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Enterprise Management Suite</p>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-semibold leading-relaxed animate-fade-in flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email Input Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Email Address</label>
            <div className="relative flex items-center group">
              <span className="absolute left-3.5 text-slate-400 group-focus-within:text-accent transition-colors duration-200">
                <Mail size={18} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@blackcube.ae"
                className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm text-text-main focus:border-accent focus:ring-2 focus:ring-accent/15 outline-none bg-slate-50/50 focus:bg-white transition-all duration-200 font-medium"
              />
            </div>
          </div>

          {/* Password Input Field */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Password</label>
              <span className="text-[11px] font-semibold text-accent hover:underline cursor-pointer transition-all">
                Forgot?
              </span>
            </div>
            <div className="relative flex items-center group">
              <span className="absolute left-3.5 text-slate-400 group-focus-within:text-accent transition-colors duration-200">
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-3 border border-slate-200 rounded-xl text-sm text-text-main focus:border-accent focus:ring-2 focus:ring-accent/15 outline-none bg-slate-50/50 focus:bg-white transition-all duration-200 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 rounded transition-colors"
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember Me Toggle */}
          <div className="flex items-center gap-2 pt-0.5">
            <input 
              type="checkbox" 
              id="remember" 
              defaultChecked 
              className="w-4 h-4 rounded border-slate-300 text-accent focus:ring-accent accent-accent cursor-pointer" 
            />
            <label htmlFor="remember" className="text-xs font-medium text-text-muted cursor-pointer select-none">
              Keep me logged in for 30 days
            </label>
          </div>

          {/* Submit Action */}
          <ActionButton
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl font-bold tracking-wide transition-all shadow-md bg-primary hover:bg-slate-800 text-white"
          >
            {isLoading ? "Verifying Credentials..." : "Authenticate & Enter"}
          </ActionButton>
        </form>

        {/* Footer Support Section */}
        <div className="border-t border-slate-100 pt-4 text-center">
          <p className="text-[11px] text-text-muted leading-relaxed font-medium">
            Authorized Personnel Only. <br />
            Protected by <a href="https://blackcube.ae/" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:text-accent transition-colors">BlackCube Security Suite</a>
          </p>
        </div>

      </div>

      {/* Visual Toast Alerts */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast-alert ${
              toast.type === 'success' ? 'toast-alert-success' :
              toast.type === 'warning' ? 'toast-alert-warning' :
              toast.type === 'error' ? 'toast-alert-error' :
              'toast-alert-info'
            }`}
          >
            <span className="toast-message">{toast.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="toast-close"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Login;
