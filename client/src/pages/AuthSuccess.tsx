import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Loader2 } from 'lucide-react';

export default function AuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { fetchMe, user } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    const needsSetup = searchParams.get('setup') === 'true';

    if (token) {
      localStorage.setItem('token', token);
      fetchMe().then(() => {
        // If setup flag is present, redirect to role selection
        if (needsSetup) {
          navigate('/auth/complete-profile');
        } else {
          navigate('/dashboard');
        }
      });
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate, fetchMe]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mx-auto mb-4" />
        <p className="text-slate-300 text-lg">Completing sign in...</p>
      </div>
    </div>
  );
}

