import '../../styles/Topbar.css';


export default function Topbar({ pageTitle, user, onMenuClick }) {

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button
          className="topbar__hamburger"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          aria-haspopup="true"
        >
          <span className="topbar__hamburger-bar" />
          <span className="topbar__hamburger-bar" />
          <span className="topbar__hamburger-bar" />
        </button>
        <h1 className="topbar__title">{pageTitle}</h1>
      </div>

      <div className="topbar__right">

        {/* Profile */}
        <div className="topbar__profile">
          <div className="topbar__avatar">
            {user?.initials || 'DR'}
          </div>
          <div className="topbar__profile-info">
            <span className="topbar__profile-name">{user?.name || 'Dr. User'}</span>
            <span className="topbar__profile-role">{user?.id || user?.role || 'Doctor'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
