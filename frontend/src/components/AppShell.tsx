import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { setAuthToken } from "../lib/authToken";

export function AppShell() {
  const navigate = useNavigate();

  function onLogout() {
    setAuthToken(null);
    navigate("/login", { replace: true });
  }

  return (
    <>
      <div className="bg" aria-hidden />
      <div className="app">
        <header className="header">
          <div className="brand">
            <div className="mark" aria-hidden />
            <div style={{ minWidth: 0 }}>
              <div className="title">Brogress</div>
            </div>
          </div>
          <div className="header-actions">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `btn ${isActive ? "btn-toggle-on" : ""}`.trim()
              }
            >
              Summary
            </NavLink>
            <NavLink
              to="/stats"
              className={({ isActive }) =>
                `btn ${isActive ? "btn-toggle-on" : ""}`.trim()
              }
            >
              Your brogress
            </NavLink>
            <button type="button" className="btn btn-linkish" onClick={onLogout}>
              Log out
            </button>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </>
  );
}
