// Generate unique ID
export const uid = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// Get week key (YYYY-W##)
export const weekKey = (date = new Date()) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
};

// Get week label (e.g., "2024년 6월 10주 (06.09 ~ 06.15)")
export const weekLabel = (date = new Date()) => {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1));
  
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  
  const startStr = `${String(start.getMonth() + 1).padStart(2, '0')}.${String(start.getDate()).padStart(2, '0')}`;
  const endStr = `${String(end.getMonth() + 1).padStart(2, '0')}.${String(end.getDate()).padStart(2, '0')}`;
  
  return `${year}년 ${month}월 ${weekNum}주 (${startStr} ~ ${endStr})`;
};

// Build columns for schedule table
export const buildColumns = (startMonth, endMonth) => {
  const cols = [];
  for (let m = startMonth; m <= endMonth; m++) {
    for (let wk = 1; wk <= 4; wk++) {
      cols.push({ m, wk });
    }
  }
  return cols;
};

// Generate cell key for schedule
export const cellKey = (m, wk) => `${m}-${wk}`;

// Calculate project progress percentage
export const projectProgress = (project) => {
  const cols = buildColumns(project.startMonth, project.endMonth);
  const tasks = project.tasks || [];
  const total = cols.length * tasks.length;
  
  if (!total) return 0;
  
  let filled = 0;
  const schedule = project.schedule || {};
  
  tasks.forEach(t => {
    const cells = schedule[t.id] || {};
    cols.forEach(c => {
      if (cells[cellKey(c.m, c.wk)]) filled++;
    });
  });
  
  return Math.round((filled / total) * 100);
};

// Format date to YYYY.MM.DD
export const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
};
