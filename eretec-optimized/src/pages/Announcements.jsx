import { useState } from 'react';
import { database, ref, set, remove } from '../config/firebase';
import { DATA_PATH } from '../config/firebase';
import { PageTitle, Modal } from '../components/index';
import { uid, formatDate } from '../config/utils';
import './Announcements.css';

export default function Announcements({ profile, data }) {
  const [editing, setEditing] = useState(null);
  const announcements = Object.entries(data.announcements || {}).map(([id, a]) => ({ id, ...a })).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  const save = async (form) => {
    const id = form.id || uid();
    await set(ref(database, DATA_PATH + '/announcements/' + id), {
      title: form.title,
      content: form.content,
      createdAt: form.id ? (form.createdAt || Date.now()) : Date.now(),
      createdBy: profile.uid,
      createdByName: profile.name,
      createdByRank: profile.rank,
    });
    setEditing(null);
  };

  const del = async (id) => {
    if (!confirm('이 공지를 삭제할까요?')) return;
    await remove(ref(database, DATA_PATH + '/announcements/' + id));
  };

  return (
    <div>
      <PageTitle
        title="공지사항"
        right={profile.isAdmin && <button className="btn" onClick={() => setEditing({ title: '', content: '' })}>+ 새 공지</button>}
      />
      {announcements.length === 0 && (
        <div className="card" style={{ padding: '50px 24px', textAlign: 'center', color: 'var(--muted)' }}>공지사항이 없습니다.</div>
      )}
      {announcements.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {announcements.map(a => (
            <div key={a.id} className="card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 16 }}>{a.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{a.createdByRank} {a.createdByName} · {formatDate(a.createdAt)}</div>
                </div>
                {profile.isAdmin && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn ghost sm" onClick={() => setEditing(a)}>수정</button>
                    <button className="btn danger sm" onClick={() => del(a.id)}>삭제</button>
                  </div>
                )}
              </div>
              <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{a.content}</div>
            </div>
          ))}
        </div>
      )}
      {editing && <AnnouncementModal announcement={editing} onSave={save} onClose={() => setEditing(null)} />}
    </div>
  );
}

function AnnouncementModal({ announcement, onSave, onClose }) {
  const [form, setForm] = useState({
    id: announcement.id || '',
    title: announcement.title || '',
    content: announcement.content || '',
    createdAt: announcement.createdAt,
  });

  return (
    <Modal onClose={onClose} title={form.id ? '공지 수정' : '새 공지 작성'}>
      <label className="lbl">제목</label>
      <input className="field" style={{ marginBottom: 14 }} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
      <label className="lbl">내용</label>
      <textarea className="field" rows={8} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} style={{ resize: 'vertical', marginBottom: 12, lineHeight: 1.6 }} />
      <div style={{ display: 'flex', gap: 10, marginTop: 14, justifyContent: 'flex-end' }}>
        <button className="btn ghost" onClick={onClose}>취소</button>
        <button className="btn" onClick={() => { if (!form.title.trim()) { alert('제목을 입력하세요.'); return; } if (!form.content.trim()) { alert('내용을 입력하세요.'); return; } onSave(form); }}>저장</button>
      </div>
    </Modal>
  );
}
