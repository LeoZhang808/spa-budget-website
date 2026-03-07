import { useState, useEffect, type FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Settings.css';

export function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setDisplayName(user.display_name ?? '');
    }
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await updateProfile({ email, display_name: displayName });
      setSuccess('Profile updated successfully');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || 'Failed to update profile';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Settings</h1>
      </div>

      <div className="settings-card">
        <h2 className="card-title">Profile</h2>

        {success && <div className="settings-success">{success}</div>}
        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="profileEmail">Email</label>
            <input
              id="profileEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="profileName">Display name</label>
            <input
              id="profileName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <button className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
