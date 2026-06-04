"use client";

type AuthMode = "login" | "register";

type AuthFormState = {
  name: string;
  email: string;
  password: string;
};

type AuthCardProps = {
  isAuthenticated: boolean;
  userName: string;
  authMode: AuthMode;
  authForm: AuthFormState;
  authMessage: string;
  onModeChange: (mode: AuthMode) => void;
  onFormChange: (next: AuthFormState) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onSignOut: () => void;
};

export function AuthCard({
  isAuthenticated,
  userName,
  authMode,
  authForm,
  authMessage,
  onModeChange,
  onFormChange,
  onSubmit,
  onSignOut
}: AuthCardProps) {
  if (isAuthenticated) {
    return (
      <div className="auth-box">
        <p className="meta">ログイン中: {userName}</p>
        <button type="button" onClick={onSignOut}>
          ログアウト
        </button>
      </div>
    );
  }

  return (
    <div className="auth-box">
      <form className="auth-form" onSubmit={onSubmit}>
        <div className="auth-mode">
          <button
            type="button"
            className={authMode === "login" ? "secondary-btn" : ""}
            onClick={() => onModeChange("login")}
          >
            ログイン
          </button>
          <button
            type="button"
            className={authMode === "register" ? "secondary-btn" : ""}
            onClick={() => onModeChange("register")}
          >
            新規登録
          </button>
        </div>
        {authMode === "register" && (
          <input
            type="text"
            placeholder="表示名"
            value={authForm.name}
            onChange={(event) => onFormChange({ ...authForm, name: event.target.value })}
          />
        )}
        <input
          type="email"
          placeholder="メールアドレス"
          value={authForm.email}
          onChange={(event) => onFormChange({ ...authForm, email: event.target.value })}
        />
        <input
          type="password"
          placeholder="パスワード"
          value={authForm.password}
          onChange={(event) => onFormChange({ ...authForm, password: event.target.value })}
        />
        <button type="submit">{authMode === "register" ? "登録してログイン" : "ログイン"}</button>
        {authMessage && <p className="meta">{authMessage}</p>}
      </form>
    </div>
  );
}
