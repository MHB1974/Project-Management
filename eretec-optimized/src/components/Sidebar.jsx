import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import './Sidebar.css';

export default function Sidebar({ currentPage, onPageChange, profile }) {
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      alert('로그아웃 실패: ' + error.message);
    }
  };

  const navItems = [
    { id: 'projects', label: '프로젝트', icon: '📋' },
    { id: 'weekly', label: '주간업무', icon: '📝' },
    { id: 'announcements', label: '공지사항', icon: '📢' },
    { id: 'members', label: '팀원', icon: '👥' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">PM</span>
        </div>
        <h1>Project<br/>Management</h1>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => {
              onPageChange(item.id);
              setShowMenu(false);
            }}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="profile-info">
          <div className="profile-avatar">{profile.name.charAt(0)}</div>
          <div className="profile-details">
            <div className="profile-name">{profile.name}</div>
            <div className="profile-rank">{profile.rank}</div>
          </div>
        </div>
        <button
          className="btn ghost logout-btn"
          onClick={handleLogout}
          title="로그아웃"
        >
          🔓
        </button>
      </div>
    </aside>
  );
}
