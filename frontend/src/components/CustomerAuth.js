import { useState } from "react";

const BASE_URL = "http://localhost:5050/api";

export default function CustomerAuth({ onLogin, onBack }) {
  const [mode, setMode]     = useState("login"); // "login" | "register"
  const [form, setForm]     = useState({ first_name: "", last_name: "", email: "", phone: "", password: "" });
  const [error, setError]   = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const switchMode = (m) => { setMode(m); setError(null); };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res  = await fetch(`${BASE_URL}/customers/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Invalid email or password."); return; }
      onLogin(data);
    } catch {
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res  = await fetch(`${BASE_URL}/customers/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: form.first_name,
          last_name:  form.last_name,
          email:      form.email,
          phone:      form.phone,
          password:   form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Registration failed."); return; }

      // Auto-login after successful registration
      const loginRes  = await fetch(`${BASE_URL}/customers/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const loginData = await loginRes.json();
      if (loginRes.ok) onLogin(loginData);
      else switchMode("login");
    } catch {
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing">
      <div className="auth-card">

        <button className="auth-back-btn" onClick={onBack}>← Back</button>

        <div className="auth-brand">Grab<span>Hub</span></div>
        <p className="auth-brand-sub">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </p>

        <div className="auth-tabs">
          <button className={`auth-tab ${mode === "login"    ? "active" : ""}`} onClick={() => switchMode("login")}>Sign In</button>
          <button className={`auth-tab ${mode === "register" ? "active" : ""}`} onClick={() => switchMode("register")}>Create Account</button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        {mode === "login" && (
          <form className="auth-form" onSubmit={handleLogin}>
            <div className="auth-field">
              <label className="auth-label">Email</label>
              <input className="auth-input" type="email" required autoComplete="email"
                placeholder="you@example.com" value={form.email} onChange={set("email")} />
            </div>
            <div className="auth-field">
              <label className="auth-label">Password</label>
              <input className="auth-input" type="password" required autoComplete="current-password"
                placeholder="••••••••" value={form.password} onChange={set("password")} />
            </div>
            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        )}

        {mode === "register" && (
          <form className="auth-form" onSubmit={handleRegister}>
            <div className="auth-row">
              <div className="auth-field">
                <label className="auth-label">First Name</label>
                <input className="auth-input" required placeholder="Jane"
                  value={form.first_name} onChange={set("first_name")} />
              </div>
              <div className="auth-field">
                <label className="auth-label">Last Name</label>
                <input className="auth-input" required placeholder="Doe"
                  value={form.last_name} onChange={set("last_name")} />
              </div>
            </div>
            <div className="auth-field">
              <label className="auth-label">Email</label>
              <input className="auth-input" type="email" required autoComplete="email"
                placeholder="you@example.com" value={form.email} onChange={set("email")} />
            </div>
            <div className="auth-field">
              <label className="auth-label">Phone</label>
              <input className="auth-input" type="tel"
                placeholder="555-0100" value={form.phone} onChange={set("phone")} />
            </div>
            <div className="auth-field">
              <label className="auth-label">Password</label>
              <input className="auth-input" type="password" required autoComplete="new-password"
                placeholder="••••••••" minLength={6} value={form.password} onChange={set("password")} />
            </div>
            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
