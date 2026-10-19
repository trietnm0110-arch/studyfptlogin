import React, { useState } from 'react';
import { FirebaseError } from 'firebase/app';
import type { User } from 'firebase/auth';
import { AlertCircle, Cloud, LogOut, Mail, UserRound, X } from 'lucide-react';
import {
  createEmailAccount,
  firebaseConfigured,
  signInWithEmail,
  signInWithGoogle,
  signOutAccount,
} from '../utils/firebase';

interface AccountModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({ isOpen, user, onClose }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!isOpen) return null;

  const runAuthAction = async (action: () => Promise<unknown>) => {
    setError('');
    setBusy(true);
    try {
      await action();
      setPassword('');
      if (user) onClose();
    } catch (cause) {
      const code = cause instanceof FirebaseError ? cause.code : '';
      const messages: Record<string, string> = {
        'auth/email-already-in-use': 'Email này đã được đăng ký.',
        'auth/invalid-credential': 'Email hoặc mật khẩu không chính xác.',
        'auth/invalid-email': 'Địa chỉ email không hợp lệ.',
        'auth/weak-password': 'Mật khẩu cần có ít nhất 6 ký tự.',
        'auth/popup-closed-by-user': 'Cửa sổ đăng nhập Google đã bị đóng.',
        'auth/unauthorized-domain': 'Tên miền hiện tại chưa được cho phép trong Firebase.',
      };
      setError(messages[code] ?? 'Không thể xác thực. Vui lòng thử lại sau.');
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    return runAuthAction(() =>
      mode === 'signup'
        ? createEmailAccount(email, password, name)
        : signInWithEmail(email, password)
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <section className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-orange-100 p-2 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300">
              <Cloud className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Tài khoản & đồng bộ</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Dữ liệu học tập riêng tư trên đám mây</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Đóng" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          {!firebaseConfigured ? (
            <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
              <div className="flex items-center gap-2 font-bold"><AlertCircle className="h-4 w-4" /> Firebase chưa được cấu hình</div>
              <p className="text-xs leading-5">Ứng dụng vẫn hoạt động và lưu dữ liệu trên thiết bị. Hãy điền các biến VITE_FIREBASE_* trong tệp .env.local, bật Email/Password và tạo Cloud Firestore để sử dụng tài khoản và đồng bộ.</p>
            </div>
          ) : user ? (
            <>
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                {user.photoURL ? <img src={user.photoURL} alt="" className="h-11 w-11 rounded-full" /> : <span className="rounded-full bg-white p-3 text-slate-500 dark:bg-slate-700"><UserRound className="h-5 w-5" /></span>}
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{user.displayName || 'Tài khoản học tập'}</p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                </div>
              </div>
              <button onClick={() => runAuthAction(signOutAccount)} disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                <LogOut className="h-4 w-4" /> Đăng xuất
              </button>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                <button onClick={() => { setMode('signin'); setError(''); }} className={`rounded-lg py-2 text-xs font-bold ${mode === 'signin' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500'}`}>Đăng nhập</button>
                <button onClick={() => { setMode('signup'); setError(''); }} className={`rounded-lg py-2 text-xs font-bold ${mode === 'signup' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500'}`}>Tạo tài khoản</button>
              </div>

              {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</p>}

              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === 'signup' && <label className="block space-y-1 text-xs font-semibold text-slate-600 dark:text-slate-300">Tên hiển thị<input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-orange-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></label>}
                <label className="block space-y-1 text-xs font-semibold text-slate-600 dark:text-slate-300">Email<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-orange-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></label>
                <label className="block space-y-1 text-xs font-semibold text-slate-600 dark:text-slate-300">Mật khẩu<input type="password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-orange-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></label>
                <button type="submit" disabled={busy || !firebaseConfigured} className="w-full rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50">{busy ? 'Đang xử lý...' : mode === 'signup' ? 'Tạo tài khoản' : 'Đăng nhập bằng email'}</button>
              </form>

              <div className="flex items-center gap-3 text-[10px] font-semibold uppercase text-slate-400"><span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />hoặc<span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" /></div>
              <button onClick={() => runAuthAction(signInWithGoogle)} disabled={busy || !firebaseConfigured} className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><Mail className="h-4 w-4" /> Tiếp tục với Google</button>
            </>
          )}
        </div>
      </section>
    </div>
  );
};