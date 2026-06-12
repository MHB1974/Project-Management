import { useState, useEffect } from 'react';
import { auth, database, ref, onValue } from './config/firebase';
import { ADMIN_EMAILS } from './config/constants';
import Sidebar from './components/Sidebar';
import Projects from './pages/Projects';
import Weekly from './pages/Weekly';
import Announcements from './pages/Announcements';
import Members from './pages/Members';
import LoginPage from './pages/LoginPage';
import './styles/App.css';

export default function App() {
  const [page, setPage] = useState('projects');
  const [profile, setProfile] = useState(null);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  // 인증 상태 감시
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const isAdmin = ADMIN_EMAILS.includes(user.email.toLowerCase());
        setProfile({
          uid: user.uid,
          email: user.email,
          name: user.displayName || user.email.split('@')[0],
          rank: isAdmin ? '이사' : '사원',
          isAdmin,
        });
        
        // Firebase 데이터 구독
        const dataRef = ref(database, '/emc/data');
        onValue(dataRef, (snapshot) => {
          setData(snapshot.val() || {});
          setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>로딩 중...</p>
      </div>
    );
  }

  if (!profile) {
    return <LoginPage />;
  }

  return (
    <div className="app">
      <Sidebar currentPage={page} onPageChange={setPage} profile={profile} />
      <div className="main-content">
        {page === 'projects' && <Projects profile={profile} data={data} />}
        {page === 'weekly' && <Weekly profile={profile} data={data} />}
        {page === 'announcements' && <Announcements profile={profile} data={data} />}
        {page === 'members' && <Members profile={profile} data={data} />}
      </div>
    </div>
  );
}
