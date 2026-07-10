import { useState } from 'react';
// import SearchBar from './SearchBar';
import '../../styles/Topbar.css';

const MOCK_NOTIFICATIONS = [
  { id: 1, text: 'New patient Ahmed Hassan registered', time: '5 min ago', unread: true },
  { id: 2, text: 'Case #204 marked as completed', time: '22 min ago', unread: true },
  { id: 3, text: 'Sara Khaled reserved case #198', time: '1 hr ago', unread: false },
  { id: 4, text: 'Waiting list updated — 3 new entries', time: '3 hrs ago', unread: false },
];

export default function Topbar({ pageTitle, user, 
  // searchValue, onSearchChange,
   onMenuClick }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => n.unread).length;

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
        {/*Search */}
         {/* <SearchBar
          placeholder="Search patients, cases..."
          value={searchValue}
          onChange={onSearchChange}
        /> */}

        {/* Notifications */}
        <div className="topbar__notif-wrap">
          <button
            className="topbar__icon-btn"
            onClick={() => setNotifOpen((o) => !o)}
            aria-label="Notifications"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="topbar__badge">{unreadCount}</span>
            )}
          </button>

          {notifOpen && (
            <div className="topbar__dropdown">
              <div className="topbar__dropdown-header">
                <span>Notifications</span>
                <span className="topbar__unread-count">{unreadCount} new</span>
              </div>
              <ul className="topbar__notif-list">
                {MOCK_NOTIFICATIONS.map((n) => (
                  <li key={n.id} className={`topbar__notif-item${n.unread ? ' topbar__notif-item--unread' : ''}`}>
                    <span className="topbar__notif-dot" />
                    <div className="topbar__notif-body">
                      <p className="topbar__notif-text">{n.text}</p>
                      <span className="topbar__notif-time">{n.time}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="topbar__profile">
          <div className="topbar__avatar">
            {user?.initials || 'DR'}
          </div>
          <div className="topbar__profile-info">
            <span className="topbar__profile-name">{user?.name || 'Dr. User'}</span>
            <span className="topbar__profile-role">{user?.role || 'Doctor'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
