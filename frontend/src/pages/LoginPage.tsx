import { FormEvent, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { loginRequest } from "../lib/authApi";
import { getAuthToken, setAuthToken } from "../lib/authToken";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } } | null)?.from
    ?.pathname;

  const [nick, setNick] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (getAuthToken()) {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { token } = await loginRequest(nick.trim(), password);
      setAuthToken(token);
      navigate(from && from !== "/login" ? from : "/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="bg" aria-hidden />
      <div className="app login-page">
        <div className="panel login-panel">
          <div className="panel-head">
            <h1 className="panel-title">Sign in</h1>
            <p className="panel-hint">Username and password for your Brogress account.</p>
          </div>
          <form className="login-form" onSubmit={onSubmit}>
            <label className="login-label" htmlFor="login-nick">
              Username
            </label>
            <input
              id="login-nick"
              name="nick"
              className="composerExerciseInput login-input"
              autoComplete="username"
              value={nick}
              onChange={(e) => setNick(e.target.value)}
              required
            />
            <label className="login-label" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              className="composerExerciseInput login-input"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error ? (
              <p className="login-error" role="alert">
                {error}
              </p>
            ) : null}
            <div className="login-actions">
              <button
                type="submit"
                className="btn primary login-submit"
                disabled={submitting}
                aria-label="Sign in"
              >
                <span className="login-submit-label">Sign in</span>
                <span className="login-arrow" aria-hidden>
                  →
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
