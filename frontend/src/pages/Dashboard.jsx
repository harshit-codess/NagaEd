import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { authApi } from '../services/api.js';

export default function Dashboard() {
  const { token, user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Re-fetch the profile from the protected endpoint (also validates the token).
  useEffect(() => {
    let cancelled = false;
    authApi
      .getUser(user.id, token)
      .then(({ user: fresh }) => !cancelled && updateUser(fresh))
      .catch((err) => {
        if (cancelled) return;
        if (err.status === 401) {
          logout();
          navigate('/login', { replace: true });
        } else {
          setError(err.message);
        }
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="card">
      <h1>Welcome, {user.username}!</h1>
      {loading && <p className="muted">Loading your profile…</p>}
      <Alert>{error}</Alert>
      <dl className="profile">
        <dt>Email</dt>
        <dd>{user.email}</dd>
        <dt>Address</dt>
        <dd>{user.address}</dd>
      </dl>
    </section>
  );
}
