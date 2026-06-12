import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, database, ref, set } from '../config/firebase';
import { DATA_PATH } from '../config/firebase';
import { RANKS } from '../config/constants';
import { uid } from '../config/utils';
import './LoginPage.css';

export default function LoginPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [name, setName] = useState('');
  const [rank, setRank] = useState('사원');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('너무 많은 로그인 시도가 있습니다. 잠시 후 다시 시도하세요.');
      } else {
        setError('로그인 실패: ' + err.message);
      }
    }
    setLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('이메일을 입력하세요.');
      return;
    }
    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    if (password !== password2) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!name.trim()) {
      setError('이름을 입력하세요.');
      return;
    }

    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCred.user, { displayName: name });

      // 팀원 정보 저장
      await set(ref(database, `${DATA_PATH}/members/${userCred.user.uid}`), {
        email: email.toLowerCase(),
        name: name.trim(),
        rank,
        order: 999,
        createdAt: Date.now(),
      });

      // 로그인 완료
      setEmail('');
      setPassword('');
      setPassword2('');
      setName('');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('이미 가입된 이메일입니다.');
      } else if (err.code === 'auth/weak-password') {
        setError('더 강한 비밀번호를 선택하세요.');
      } else {
        setError('회원가입 실패: ' + err.message);
      }
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-badge">PM</div>
          <h1>Project Management</h1>
          <p>이레테크 설계팀</p>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="login-form">
            <h2>로그인</h2>
            <label className="lbl">이메일</label>
            <input
              className="field"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={loading}
            />
            <label className="lbl">비밀번호</label>
            <input
              className="field"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
              disabled={loading}
            />
            {error && <div className="error-msg">{error}</div>}
            <button className="btn" style={{ width: '100%', marginTop: 16 }} disabled={loading}>
              {loading ? '로그인 중...' : '로그인'}
            </button>
            <div style={{ textAlign: 'center', marginTop: 12, fontSize: 12 }}>
              아직 계정이 없으신가요?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError('');
                }}
                style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer' }}
              >
                회원가입
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="login-form">
            <h2>회원가입</h2>
            <label className="lbl">이름</label>
            <input
              className="field"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="성명 입력"
              disabled={loading}
            />
            <label className="lbl">직급</label>
            <select className="field" value={rank} onChange={(e) => setRank(e.target.value)} disabled={loading}>
              {RANKS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <label className="lbl">이메일</label>
            <input
              className="field"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={loading}
            />
            <label className="lbl">비밀번호</label>
            <input
              className="field"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6자 이상"
              disabled={loading}
            />
            <label className="lbl">비밀번호 확인</label>
            <input
              className="field"
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              placeholder="비밀번호 재입력"
              disabled={loading}
            />
            {error && <div className="error-msg">{error}</div>}
            <button className="btn" style={{ width: '100%', marginTop: 16 }} disabled={loading}>
              {loading ? '회원가입 중...' : '회원가입'}
            </button>
            <div style={{ textAlign: 'center', marginTop: 12, fontSize: 12 }}>
              이미 계정이 있으신가요?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer' }}
              >
                로그인
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
