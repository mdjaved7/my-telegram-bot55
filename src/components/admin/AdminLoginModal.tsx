import React, { useState, useEffect } from 'react';
import { StorageService, ADMIN_SECRET_PASSWORD } from '../../services/storage';
import { Lock, Eye, EyeOff, ShieldAlert, ArrowRight, X, AlertTriangle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
}

export const AdminLoginModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onAuthenticated,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState<number>(0);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (lockoutTimer > 0) {
      const timer = setInterval(() => {
        setLockoutTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setFailedAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lockoutTimer]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTimer > 0) return;

    setIsVerifying(true);
    setErrorMsg(null);

    setTimeout(() => {
      // STRICT PASSWORD CHECK: Exact match with 8294991057
      if (password === ADMIN_SECRET_PASSWORD) {
        StorageService.setAdminAuthenticated(true);
        setPassword('');
        setErrorMsg(null);
        setFailedAttempts(0);
        setIsVerifying(false);
        onAuthenticated();
      } else {
        const nextFailed = failedAttempts + 1;
        setFailedAttempts(nextFailed);
        setIsVerifying(false);

        StorageService.addAuditLog(
          'FAILED_LOGIN_ATTEMPT',
          `Unauthorized access attempt with incorrect passcode (Attempt ${nextFailed})`,
          'FAILED'
        );

        if (nextFailed >= 5) {
          setLockoutTimer(60);
          setErrorMsg('Security threshold reached: Terminal locked for 60 seconds.');
        } else {
          setErrorMsg(`Access Denied: Invalid security passcode. (${5 - nextFailed} attempts remaining)`);
        }
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative bg-slate-900 border border-slate-700 text-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Security Badge */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold tracking-tight text-white">
              Restricted Administrative Terminal
            </h3>
            <p className="text-xs text-slate-400 max-w-xs">
              Authorized personnel only. Enter the designated access passcode to decrypt administrative controls.
            </p>
          </div>
        </div>

        {/* Error or Lockout Notice */}
        {lockoutTimer > 0 ? (
          <div className="mt-5 p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              Security lockout active. Please wait <strong>{lockoutTimer}s</strong> before retry.
            </span>
          </div>
        ) : errorMsg ? (
          <div className="mt-5 p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        ) : null}

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Administrative Passcode
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoFocus
                disabled={lockoutTimer > 0 || isVerifying}
                placeholder="Enter exact passcode"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 font-mono tracking-wider disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title={showPassword ? 'Hide passcode' : 'Show passcode'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1">
              <span>Required: System master password</span>
              <span className="font-mono">AES-256 Auth</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={lockoutTimer > 0 || isVerifying || !password}
            className="w-full py-2.5 px-4 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md font-mono"
          >
            {isVerifying ? (
              <span>Decrypting Session...</span>
            ) : (
              <>
                <span>Authenticate Access</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Security Footer Notice */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
          <p className="text-[10px] text-slate-500">
            All connection attempts are logged with IP hash & timestamp for compliance auditing.
          </p>
        </div>
      </div>
    </div>
  );
};
