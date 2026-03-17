import { useState } from "react";
import { login } from "../api";
import type { AuthResponse } from "../types";

type LoginPageProps = {
  onLogin: (auth: AuthResponse) => void;
  onShowRegister: () => void;
};

export default function LoginPage({ onLogin, onShowRegister }: LoginPageProps) {
  const [username, setUsername] = useState("doctor");
  const [password, setPassword] = useState("Doctor@123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const auth = await login({ username, password });
      onLogin(auth);
    } catch (err) {
      setError("Đăng nhập thất bại. Kiểm tra thông tin và máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Đăng nhập bệnh viện</h1>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Tên đăng nhập
            <input value={username} onChange={(e) => setUsername(e.target.value)} />
          </label>
          <label>
            Mật khẩu
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error ? <div className="error">{error}</div> : null}
          <button className="primary" type="submit" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
          <button className="ghost" type="button" onClick={onShowRegister}>
            Đăng ký bệnh nhân
          </button>
        </form>
      </div>
    </div>
  );
}
