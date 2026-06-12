import { database, ref, remove, get, update } from '../config/firebase';
import { DATA_PATH } from '../config/firebase';
import { PageTitle } from '../components/index';
import './Members.css';

const ADMIN_EMAILS = ['hbmoon@eretec.com'];

export default function Members({ profile, data }) {
  const members = Object.entries(data.members || {}).map(([id, m]) => ({ id, ...m })).sort((a, b) => (a.order || 0) - (b.order || 0));

  const removeMember = async (m) => {
    const isMemberAdmin = ADMIN_EMAILS.includes((m.email || '').toLowerCase());
    if (isMemberAdmin) {
      alert('관리자 계정은 방출할 수 없습니다.');
      return;
    }
    if (!confirm(m.rank + ' ' + m.name + ' 님을 팀에서 방출할까요?')) return;

    try {
      await remove(ref(database, DATA_PATH + '/members/' + m.id));
      const wkSnap = await get(ref(database, DATA_PATH + '/weekly'));
      if (wkSnap.exists()) {
        const updates = {};
        Object.keys(wkSnap.val()).forEach(week => {
          updates[week + '/' + m.id] = null;
        });
        await update(ref(database, DATA_PATH + '/weekly'), updates);
      }
    } catch (e) {
      alert('방출 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <div>
      <PageTitle title="팀원" sub={'설계팀 팀원 ' + members.length + '명'} />
      {members.length === 0 && (
        <div className="card" style={{ padding: '50px 24px', textAlign: 'center', color: 'var(--muted)' }}>아직 등록된 팀원이 없습니다. 회원가입하면 자동으로 추가됩니다.</div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
        {members.map(m => {
          const isMemberAdmin = ADMIN_EMAILS.includes((m.email || '').toLowerCase());
          const canRemove = profile.isAdmin && !isMemberAdmin && m.id !== profile.uid;
          return (
            <div key={m.id} className="card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 16 }}>{m.name} <span className="tag">{m.rank}</span></div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{m.email}</div>
                </div>
                {isMemberAdmin && <span className="tag" style={{ color: 'var(--accent)' }}>관리자</span>}
              </div>
              {canRemove && (
                <div style={{ marginTop: 14, textAlign: 'right' }}>
                  <button className="btn danger sm" onClick={() => removeMember(m)}>방출</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {profile.isAdmin && members.length > 0 && (
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 14 }}>방출 시 팀원 목록과 주간업무에서 제거됩니다.</div>
      )}
    </div>
  );
}
