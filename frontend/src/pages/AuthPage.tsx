import { useState } from "react";
import { authLogin, authSignup } from "../lib/api";
import { clearToken, setToken } from "../lib/auth";
import { useNavigate } from "react-router-dom";

export function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit() {
    setMsg(null);
    setLoading(true);
    try {
      const fn = mode === "login" ? authLogin : authSignup;
      const res = await fn(email.trim(), password);
      if (res.error || !res.token) {
        setMsg(res.error || "Authentication failed");
        return;
      }
      setToken(res.token);
      setMsg("Logged in successfully.");
      setTimeout(() => nav("/history"), 500);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-2xs font-bold uppercase tracking-[0.2em] text-sky-700">Account</p>
      <h1 className="mt-2 font-display text-2xl font-bold text-slate-900">
        {mode === "login" ? "Login" : "Create account"}
      </h1>
      <div className="mt-4 space-y-3">
        <input
          type="email"
          className="input-field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <input
          type="password"
          className="input-field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button type="button" className="btn-primary w-full" onClick={onSubmit} disabled={loading}>
          {loading ? "Please wait..." : mode === "login" ? "Login" : "Sign up"}
        </button>
        <button
          type="button"
          className="w-full text-xs font-medium text-sky-700 hover:text-sky-900"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
        >
          {mode === "login" ? "Need an account? Sign up" : "Already registered? Login"}
        </button>
        <button
          type="button"
          className="w-full text-xs font-medium text-rose-600 hover:text-rose-800"
          onClick={() => {
            clearToken();
            setMsg("Logged out from browser session.");
          }}
        >
          Logout
        </button>
      </div>
      {msg && <p className="mt-3 text-sm text-slate-600">{msg}</p>}
    </div>
  );
}
