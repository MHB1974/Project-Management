import { useState, useEffect } from 'react';
import { database, ref, set } from '../config/firebase';
import { DATA_PATH } from '../config/firebase';
import { PageTitle } from '../components/index';
import { weekKey, weekLabel } from '../config/utils';
import './Weekly.css';

const ADMIN_EMAILS = ['hbmoon@eretec.com'];

export default function Weekly({ profile, data }) {
  const [offset, setOffset] = useState(0);
  const [showAll, setShowAll] = useState(profile.isAdmin);
  const base = new Date();
  base.setDate(base.getDate() + offset * 7);
  const wk = weekKey(base);
  const label = weekLabel(base);

  const allMembers = Object.entries(data.members || {}).map(([id, m]) => ({ id, ...m })).sort((a, b) => (a.order || 0) - (b.order || 0));
  const members = profile.isAdmin ? allMembers : allMembers.filter(m => !ADMIN_EMAILS.includes((m.email || '').toLowerCase()));
  
  const weekData = (data.weekly?.[wk]) || {};
  const [draft, setDraft] = useState((weekData[profile.uid]?.text) || '');

  useEffect(() => {
    setDraft((weekData[profile.uid]?.text) || '');
  }, [wk]);

  const save = async () => {
    await set(ref(database, DATA_PATH + '/weekly/' + wk + '/' + profile.uid), {
      text: draft,
      name: profile.name,
      rank: profile.rank,
      updatedAt: Date.now(),
    });
    setShowAll(true);
  };

  return (
    <div>
      <PageTitle
        title="주간업무"
        right={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="btn ghost sm" onClick={() => setOffset(o => o - 1)}>◂ 이전주</button>
            <button className="btn ghost sm" onClick={() => setOffset(0)}>이번주</button>
            <button className="btn ghost sm" onClick={() => setOffset(o => o + 1)}>다음주 ▸</button>
          </div>
        }
      />
      <div style={{ fontSize: 14, color: 'var(--accent-2)', marginBottom: 18 }}>{label}</div>

      {!showAll && !profile.isAdmin && (
        <div className="card" style={{ padding: 18, marginBottom: 18, width: '50%' }}>
          <div style={{ fontSize: 14, marginBottom: 10 }}>{profile.rank} {profile.name} <span className="tag">내 업무</span></div>
          <textarea
            className="field"
            rows={8}
            maxLength={300}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="이번 주 업무 내용을 자유롭게 작성하세요"
            style={{ resize: 'vertical', lineHeight: 1.6 }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{draft.length} / 300자</span>
            <button className="btn" onClick={save}>저장</button>
          </div>
        </div>
      )}

      {showAll && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
            <div style={{ fontSize: 14, color: 'var(--muted)' }}>팀 전체 주간업무</div>
            {!profile.isAdmin && <button className="btn ghost sm" onClick={() => setShowAll(false)}>◂ 돌아가기</button>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
            {members.map(m => {
              const rec = weekData[m.id];
              return (
                <div key={m.id} className="card" style={{ padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13 }}>{m.rank} {m.name}</span>
                    {m.id === profile.uid && <span className="tag" style={{ color: 'var(--accent)' }}>나</span>}
                  </div>
                  <div style={{ fontSize: 11, color: rec?.text ? 'var(--text)' : 'var(--muted)', whiteSpace: 'pre-wrap', lineHeight: 1.5, minHeight: 20 }}>
                    {rec?.text || '내용 없음'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
