import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import FormField from '../components/FormField.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useAsyncAction } from '../hooks.js';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [clientErrors, setClientErrors] = useState({});
  const loginAction = useAsyncAction(login);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.email.trim()) errs.email = 'Email is required';
    if (!form.password) errs.password = 'Password is required';
    setClientErrors(errs);
    if (Object.keys(errs).length) return;

    const user = await loginAction.run({ email: form.email.trim(), password: form.password });
    if (user) navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
  };

  return (
    <section className="card">
      <h1>Log in</h1>
      {location.state?.registered && <Alert kind="success">Account created - please log in.</Alert>}
      <Alert>{loginAction.error?.message}</Alert>
      <form onSubmit={onSubmit} noValidate>
        <FormField label="Email" name="email" type="email" value={form.email} onChange={onChange} autoComplete="email" error={clientErrors.email} />
        <FormField label="Password" name="password" type="password" value={form.password} onChange={onChange} autoComplete="current-password" error={clientErrors.password} />
        <button type="submit" disabled={loginAction.loading}>
          {loginAction.loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p className="muted">
        No account yet? <Link to="/register">Register</Link>
      </p>
    </section>
  );
}
