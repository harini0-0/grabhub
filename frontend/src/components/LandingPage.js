export default function LandingPage({ setRole }) {
  return (
    <div className="landing">
      <div className="landing-content">
        <h1 className="landing-logo">Grab<span>Hub</span></h1>
        <p className="landing-tagline">Food delivered on your schedule</p>
        <div className="landing-divider" />

        <div className="landing-roles">
          <div className="role-card" onClick={() => setRole("customer")} role="button" tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && setRole("customer")}>
            <span className="role-card-icon">🍽️</span>
            <span className="role-card-title">Customer</span>
            <span className="role-card-sub">Order food &amp; track delivery</span>
          </div>

          <div className="role-card" onClick={() => setRole("delivery")} role="button" tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && setRole("delivery")}>
            <span className="role-card-icon">🚴</span>
            <span className="role-card-title">Delivery Partner</span>
            <span className="role-card-sub">Manage your deliveries</span>
          </div>

          <div className="role-card" onClick={() => setRole("admin")} role="button" tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && setRole("admin")}>
            <span className="role-card-icon">🏪</span>
            <span className="role-card-title">Restaurant Admin</span>
            <span className="role-card-sub">Manage menus &amp; items</span>
          </div>
        </div>
      </div>
    </div>
  );
}
