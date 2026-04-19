import { NavLink, Outlet } from "react-router-dom";

export function AppShell() {
  return (
    <>
      <div className="bg" aria-hidden />
      <div className="app">
        <header className="header">
          <div className="brand">
            <div className="mark" aria-hidden />
            <div style={{ minWidth: 0 }}>
              <div className="title">Brogress</div>
              <div className="subtitle">Trening bez zbędnego tłumaczenia</div>
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
              Trening
            </NavLink>
            <NavLink
              to="/stats"
              className={({ isActive }) =>
                `btn ${isActive ? "btn-toggle-on" : ""}`.trim()
              }
            >
              Objętość
            </NavLink>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </>
  );
}
