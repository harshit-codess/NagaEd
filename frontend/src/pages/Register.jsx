import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import FormField from '../components/FormField.jsx';
import { useAsyncAction } from '../hooks.js';
import { aiApi, authApi } from '../services/api.js';

const initial = { username: '', email: '', password: '', address: '' };

function validate(f) {
  const e = {};
  if (f.username.trim().length < 3) e.username = 'Username must be at least 3 characters';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = 'Enter a valid email address';
  if (f.password.length < 8 || !/[A-Za-z]/.test(f.password) || !/\d/.test(f.password))
    e.password = 'At least 8 characters with a letter and a number';
  if (f.address.trim().length < 5) e.address = 'Address must be at least 5 characters';
  return e;
}

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [clientErrors, setClientErrors] = useState({});
  const [interests, setInterests] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const registerAction = useAsyncAction(authApi.register);
  const suggestAction = useAsyncAction(aiApi.suggestUsernames);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    setClientErrors(errs);
    if (Object.keys(errs).length) return;

    const result = await registerAction.run({
      username: form.username.trim(),
      email: form.email.trim(),
      password: form.password,
      address: form.address.trim(),
    });
    if (result) navigate('/login', { state: { registered: true } });
  };

  const onSuggest = async () => {
    const list = interests.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 10);
    if (!list.length) return;
    const result = await suggestAction.run(list);
    if (result) setSuggestions(result.suggestions);
  };

  const apiError = registerAction.error;
  const fieldErrors = { ...(apiError?.fieldErrors || {}), ...clientErrors };
  // Show the top-level message unless it's already explained inline per field.
  const topError = apiError && !(apiError.status === 422 && Object.keys(apiError.fieldErrors).length) ? apiError.message : null;

  return (
    <section className="card">
      <h1>Create account</h1>
      <Alert>{topError}</Alert>

      <form onSubmit={onSubmit} noValidate>
        <FormField label="Username" name="username" value={form.username} onChange={onChange} autoComplete="username" error={fieldErrors.username} />
        <FormField label="Email" name="email" type="email" value={form.email} onChange={onChange} autoComplete="email" error={fieldErrors.email} />
        <FormField label="Password" name="password" type="password" value={form.password} onChange={onChange} autoComplete="new-password" hint="Min 8 characters, with a letter and a number" error={fieldErrors.password} />
        <FormField label="Address" name="address" value={form.address} onChange={onChange} autoComplete="street-address" error={fieldErrors.address} />
        <button type="submit" disabled={registerAction.loading}>
          {registerAction.loading ? 'Creating account…' : 'Register'}
        </button>
      </form>

      <hr />
      <h2>Need a username idea?</h2>
      <p className="muted">Enter a few interests (comma separated) and let AI suggest some.</p>
      <div className="row">
        <input aria-label="Interests" placeholder="e.g. astronomy, jazz, trail running" value={interests} onChange={(e) => setInterests(e.target.value)} />
        <button type="button" className="secondary" onClick={onSuggest} disabled={suggestAction.loading || !interests.trim()}>
          {suggestAction.loading ? 'Thinking…' : 'Suggest'}
        </button>
      </div>
      <Alert>{suggestAction.error?.message}</Alert>
      {suggestions.length > 0 && (
        <div className="chips">
          {suggestions.map((s) => (
            <button key={s} type="button" className="chip" onClick={() => setForm((f) => ({ ...f, username: s }))}>
              {s}
            </button>
          ))}
        </div>
      )}

      <p className="muted">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </section>
  );
}
