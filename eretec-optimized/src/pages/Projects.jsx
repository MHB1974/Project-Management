import { useState } from 'react';
import { database, ref, set, update, remove } from '../config/firebase';
import { DATA_PATH } from '../config/firebase';
import { PageTitle, Modal } from '../components/index';
import { uid, buildColumns, cellKey, projectProgress, formatDate } from '../config/utils';
import { MONTH_NAMES, PROJECT_STATUSES } from '../config/constants';
import './Projects.css';

export default function Projects({ profile, data }) {
  const projects = Object.entries(data.projects || {}).map(([id, p]) => ({ id, ...p })).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  const members = Object.entries(data.members || {}).map(([id, m]) => ({ id, ...m })).sort((a, b) => (a.order || 0) - (b.order || 0));
  
  const [editing, setEditing] = useState(null);
  const [activeId, setActiveId] = useState(projects[0]?.id || null);

  const isAdmin = profile.isAdmin;
  const active = projects.find(p => p.id === activeId) || projects[0] || null;

  const saveHeader = async (form) => {
    if (form.id) {
      await update(ref(database, DATA_PATH + '/projects/' + form.id), {
        name: form.name,
        client: form.client,
        startMonth: form.startMonth,
        endMonth: form.endMonth,
        note: form.note,
        status: form.status || '대기',
        assignedMembers: form.assignedMembers || [],
      });
    } else {
      const id = uid();
      await set(ref(database, DATA_PATH + '/projects/' + id), {
        name: form.name,
        client: form.client,
        startMonth: form.startMonth,
        endMonth: form.endMonth,
        note: form.note || '상기 공정은 현장상황에 따라 변경될 수 있습니다.',
        status: form.status || '대기',
        createdAt: Date.now(),
        tasks: [{ id: uid(), name: '설계' }, { id: uid(), name: '제조' }],
        schedule: {},
        assignedMembers: form.assignedMembers || [],
      });
      setActiveId(id);
    }
    setEditing(null);
  };

  const delProject = async (id) => {
    if (!confirm('이 프로젝트를 삭제할까요?')) return;
    await remove(ref(database, DATA_PATH + '/projects/' + id));
    if (activeId === id) setActiveId(null);
  };

  return (
    <div>
      <PageTitle
        title="프로젝트"
        sub="공정별 일정표"
        right={isAdmin && <button className="btn" onClick={() => setEditing('new')}>+ 프로젝트 추가</button>}
      />
      
      {projects.length === 0 && (
        <div className="card" style={{ padding: '50px 24px', textAlign: 'center', color: 'var(--muted)' }}>
          등록된 프로젝트가 없습니다. {isAdmin && '오른쪽 위에서 추가하세요.'}
        </div>
      )}

      {projects.length > 0 && (
        <>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
            {projects.map(p => (
              <button
                key={p.id}
                onClick={() => setActiveId(p.id)}
                style={{
                  border: '1px solid ' + (active?.id === p.id ? 'var(--accent)' : 'var(--line)'),
                  background: active?.id === p.id ? 'var(--accent)' : 'transparent',
                  color: active?.id === p.id ? '#1a0d00' : 'var(--muted)',
                  borderRadius: 10,
                  padding: '8px 14px',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                {p.name}
              </button>
            ))}
          </div>

          {active && <ScheduleTable key={active.id} project={active} profile={profile} members={members} onEditHeader={() => setEditing({ ...active })} onDelete={() => delProject(active.id)} />}
        </>
      )}

      {editing && <HeaderModal project={editing === 'new' ? null : editing} members={members} onSave={saveHeader} onClose={() => setEditing(null)} />}
    </div>
  );
}

function ScheduleTable({ project, profile, members, onEditHeader, onDelete }) {
  const assigned = project.assignedMembers || [];
  const isAssigned = assigned.includes(profile.uid);
  const canEdit = profile.isAdmin || isAssigned;
  
  const cols = buildColumns(project.startMonth, project.endMonth);
  const tasks = project.tasks || [];
  const prog = projectProgress(project);
  const [draft, setDraft] = useState(project.schedule || {});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const schedule = draft;

  const setCell = (taskId, m, wk, val) => {
    setDraft(prev => {
      const next = { ...prev };
      const row = { ...(next[taskId] || {}) };
      if (val) row[cellKey(m, wk)] = true;
      else delete row[cellKey(m, wk)];
      next[taskId] = row;
      return next;
    });
    setDirty(true);
  };

  const getCell = (taskId, m, wk) => !!(schedule[taskId]?.[cellKey(m, wk)]);

  const saveSchedule = async () => {
    setSaving(true);
    const clean = {};
    Object.keys(draft).forEach(tid => {
      const row = {};
      Object.keys(draft[tid] || {}).forEach(k => {
        if (draft[tid][k]) row[k] = true;
      });
      if (Object.keys(row).length) clean[tid] = row;
    });
    await update(ref(database, DATA_PATH + '/projects/' + project.id), { schedule: clean });
    setDirty(false);
    setSaving(false);
  };

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '12px', background: 'var(--navy-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 14 }}>{project.name}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{project.client || '발주처 미정'}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 9, color: 'var(--muted)' }}>공정율</div>
          <div style={{ fontSize: 13, color: 'var(--accent)' }}>{prog}%</div>
          {profile.isAdmin && <button className="btn ghost sm" onClick={onEditHeader} style={{ marginLeft: 8 }}>수정</button>}
        </div>
      </div>
      <div style={{ overflowX: 'auto', padding: '12px' }}>
        <table style={{ borderCollapse: 'collapse', userSelect: 'none', fontSize: 13, margin: '0 auto' }}>
          <tbody>
            {tasks.map(t => (
              <tr key={t.id}>
                <td style={{ border: '1px solid var(--line)', padding: '8px', minWidth: 120, background: 'var(--navy-3)' }}>
                  {t.name}
                </td>
                {cols.map((c, i) => (
                  <td
                    key={i}
                    onMouseDown={() => canEdit && setCell(t.id, c.m, c.wk, !getCell(t.id, c.m, c.wk))}
                    style={{
                      border: '1px solid var(--line)',
                      width: 24,
                      height: 24,
                      background: getCell(t.id, c.m, c.wk) ? 'linear-gradient(90deg,var(--accent),var(--accent-2))' : 'transparent',
                      cursor: canEdit ? 'pointer' : 'default',
                    }}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {dirty && (
        <div style={{ padding: '12px', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: 'var(--yellow)' }}>● 저장되지 않은 변경</span>
          <button className="btn sm" onClick={saveSchedule} disabled={saving}>{saving ? '저장 중…' : '저장'}</button>
        </div>
      )}
    </div>
  );
}

function HeaderModal({ project, members, onSave, onClose }) {
  const defaultAssigned = project ? project.assignedMembers : [];
  const [f, setF] = useState({
    id: project?.id || '',
    name: project?.name || '',
    client: project?.client || '',
    startMonth: project?.startMonth || 7,
    endMonth: project?.endMonth || 12,
    status: project?.status || '대기',
    note: project?.note || '',
    assignedMembers: defaultAssigned,
  });

  return (
    <Modal onClose={onClose} title={project ? '프로젝트 수정' : '새 프로젝트'}>
      <label className="lbl">프로젝트명</label>
      <input className="field" style={{ marginBottom: 12 }} value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
      <label className="lbl">발주처</label>
      <input className="field" style={{ marginBottom: 12 }} value={f.client} onChange={e => setF({ ...f, client: e.target.value })} />
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <label className="lbl">시작월</label>
          <select className="field" value={f.startMonth} onChange={e => setF({ ...f, startMonth: Number(e.target.value) })}>
            {MONTH_NAMES.map((n, i) => <option key={i} value={i + 1}>{n}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label className="lbl">종료월</label>
          <select className="field" value={f.endMonth} onChange={e => setF({ ...f, endMonth: Number(e.target.value) })}>
            {MONTH_NAMES.map((n, i) => <option key={i} value={i + 1}>{n}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 14, justifyContent: 'flex-end' }}>
        <button className="btn ghost" onClick={onClose}>취소</button>
        <button className="btn" onClick={() => { if (!f.name.trim()) { alert('프로젝트명을 입력하세요.'); return; } onSave(f); }}>저장</button>
      </div>
    </Modal>
  );
}
