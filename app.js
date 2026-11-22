(() => {
  'use strict';

  const DATA_KEY = 'new-hope-shipping-tracker-v1';
  const PREF_KEY = 'new-hope-shipping-tracker-preferences-v1';
  const INCENTIVE_RATE = 0.07;
  const $ = (selector) => document.querySelector(selector);
  const svgNS = 'http://www.w3.org/2000/svg';
  const words = {
    km: {
      subtitle: 'ប្រព័ន្ធតាមដានការដឹកជញ្ជូន', role: 'បុគ្គលិកដឹកជញ្ជូន', userLabel: 'បុគ្គលិក', totalTons: 'សរុបតោន / TOTAL TONS',
      thisMonth: 'ខែនេះ · this month', earnings: 'ចំណូល / EARNINGS', usdIncentive: 'USD incentive',
      activeDays: 'ថ្ងៃសកម្ម / ACTIVE DAYS', daysRecorded: 'ថ្ងៃមានទិន្នន័យ · days recorded',
      peakDay: 'ថ្ងៃខ្ពស់ / PEAK DAY', peakUnit: 'តោន · tons', dailyChart: 'ក្រាហ្វតោនប្រចាំថ្ងៃ · Daily Tons',
      chartHint: 'បរិមាណដឹកជញ្ជូនតាមថ្ងៃក្នុងខែ', all: 'ទាំងអស់', enterData: 'បញ្ចូលទិន្នន័យ · Enter Data',
      entryHint: 'ថ្ងៃ + បុគ្គលិក + កញ្ចប់', dayLabel: 'ថ្ងៃ / DAY', employeeLabel: 'បុគ្គលិក / EMPLOYEE',
      employeePlaceholder: 'សរសេរឈ្មោះបុគ្គលិក', invalidEmployee: 'សូមសរសេរឈ្មោះបុគ្គលិក។',
      bagsLabel: 'ចំនួនកញ្ចប់ / BAGS', save: 'រក្សាទុក · Save', staffSummary: 'សង្ខេបបុគ្គលិក · Staff Summary',
      staffHint: 'សរុបតាមបុគ្គលិកក្នុងខែនេះ', log: 'កំណត់ត្រា · Log', logHint: 'កំណត់ត្រាដឹកជញ្ជូនប្រចាំខែ',
      thDay: 'ថ្ងៃ', thEmployee: 'បុគ្គលិក', action: 'សកម្មភាព', emptyTitle: 'មិនទាន់មានទិន្នន័យ',
      emptyText: 'បញ្ចូលកំណត់ត្រាដំបូងសម្រាប់ខែនេះ។', localStorageNote: 'ទិន្នន័យត្រូវបានរក្សាទុកក្នុង browser នេះ',
      tons: 'តោន', earned: 'បានទទួល', delete: 'លុប', entries: 'កំណត់ត្រា', confirmDelete: 'តើអ្នកចង់លុបកំណត់ត្រានេះមែនទេ?',
      saved: 'បានរក្សាទុកកំណត់ត្រា', updated: 'បានធ្វើបច្ចុប្បន្នភាពកំណត់ត្រា', removed: 'បានលុបកំណត់ត្រា',
      invalidDay: 'សូមបញ្ចូលថ្ងៃត្រឹមត្រូវក្នុងខែនេះ។', invalidBags: 'ចំនួនកញ្ចប់ត្រូវតែជាចំនួនគត់ចាប់ពីសូន្យឡើងទៅ។',
      noStorage: 'Browser មិនអាចរក្សាទុកទិន្នន័យបានទេ។', dayPrefix: 'ថ្ងៃ'
    },
    en: {
      subtitle: 'Shipping Tracker', role: 'Delivery staff', userLabel: 'Employee', totalTons: 'TOTAL TONS', thisMonth: 'This month',
      earnings: 'EARNINGS', usdIncentive: 'USD incentive', activeDays: 'ACTIVE DAYS', daysRecorded: 'Days recorded',
      peakDay: 'PEAK DAY', peakUnit: 'tons', dailyChart: 'Daily Tons', chartHint: 'Shipping volume by day this month',
      all: 'All', enterData: 'Enter Data', entryHint: 'Day + employee + bags', dayLabel: 'DAY',
      employeeLabel: 'EMPLOYEE', employeePlaceholder: 'Type employee name', invalidEmployee: 'Enter an employee name.', bagsLabel: 'BAGS', save: 'Save record', staffSummary: 'Staff Summary',
      staffHint: 'Monthly totals by employee', log: 'Log', logHint: 'Shipping records for this month',
      thDay: 'DAY', thEmployee: 'EMPLOYEE', action: 'ACTION', emptyTitle: 'No records yet',
      emptyText: 'Add the first shipping record for this month.', localStorageNote: 'Data is stored in this browser only',
      tons: 'Tons', earned: 'Earned', delete: 'Delete', entries: 'entries', confirmDelete: 'Delete this shipping record?',
      saved: 'Record saved', updated: 'Record updated', removed: 'Record deleted',
      invalidDay: 'Enter a valid day in this month.', invalidBags: 'Bag counts must be whole numbers greater than or equal to zero.',
      noStorage: 'This browser could not save the data.', dayPrefix: 'Day'
    }
  };

  const demoRows = [
    [1, 0, 235, 5776], [2, 0, 0, 4847], [3, 0, 82, 6358], [4, 0, 45, 6252],
    [5, 0, 2, 5340], [6, 0, 0, 8691], [7, 0, 2, 4677], [8, 0, 4, 5746],
    [9, 0, 4, 4348], [10, 0, 2, 4155], [11, 0, 2, 5676], [12, 0, 2, 4685], [13, 0, 4, 3304]
  ].map(([day, bags20, bags25, bags30]) => ({
    id: `demo-2026-04-${day}`,
    date: `2026-04-${String(day).padStart(2, '0')}`, staff: 'បុគ្គលិក', bags20, bags25, bags30
  }));

  let prefs = readJSON(PREF_KEY, {});
  let lang = prefs.lang === 'en' ? 'en' : 'km';
  let selectedMonth = /^\d{4}-\d{2}$/.test(prefs.month || '') ? prefs.month : '2026-04';
  let chartStaff = 'all';
  let records = readJSON(DATA_KEY, null);
  if (!Array.isArray(records)) {
    records = demoRows;
    saveJSON(DATA_KEY, records);
  } else {
    let migrated = false;
    records = records.map((row) => {
      if (row.id && row.id.startsWith('demo-') && row.staff !== 'បុគ្គលិក') {
        migrated = true;
        return { ...row, staff: 'បុគ្គលិក' };
      }
      return row;
    });
    if (migrated) saveJSON(DATA_KEY, records);
  }

  function readJSON(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (_) { return fallback; }
  }

  function saveJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (_) { showToast(words[lang].noStorage); return false; }
  }

  function copy() { return words[lang]; }
  function currentMonthRecords() { return records.filter((row) => row.date && row.date.slice(0, 7) === selectedMonth); }
  function tons(row) { return (Number(row.bags20 || 0) * 20 + Number(row.bags25 || 0) * 25 + Number(row.bags30 || 0) * 30) / 1000; }
  function money(amount) { return `$${amount.toFixed(2)}`; }
  function normalizedTons(row) { return Number(tons(row).toFixed(2)); }
  function dayNumber(date) { return Number(date.slice(8, 10)); }

  function savePrefs() { saveJSON(PREF_KEY, { lang, month: selectedMonth }); }

  function applyLanguage() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach((node) => {
      const value = copy()[node.dataset.i18n];
      if (value !== undefined) node.textContent = value;
    });
    $('#staffInput').placeholder = copy().employeePlaceholder;
    $('#languageToggle').textContent = lang === 'km' ? 'EN' : 'ខ្មែរ';
    render();
  }

  function monthDate() {
    const [year, month] = selectedMonth.split('-').map(Number);
    return new Date(year, month - 1, 1);
  }

  function monthName() {
    const date = monthDate();
    if (lang === 'en') return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const names = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
    const khmerDigits = String(date.getFullYear()).replace(/[0-9]/g, (d) => '០១២៣៤៥៦៧៨៩'[Number(d)]);
    return `${names[date.getMonth()]} ${khmerDigits}`;
  }

  function moveMonth(offset) {
    const date = monthDate();
    date.setMonth(date.getMonth() + offset);
    selectedMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    savePrefs();
    render();
  }

  function formatCount(value) { return new Intl.NumberFormat(lang === 'km' ? 'km-KH' : 'en-US').format(value); }

  function render() {
    const monthRows = currentMonthRecords();
    $('#monthLabel').textContent = monthName();
    const allTons = monthRows.reduce((sum, row) => sum + normalizedTons(row), 0);
    const daily = new Map();
    monthRows.forEach((row) => daily.set(dayNumber(row.date), (daily.get(dayNumber(row.date)) || 0) + normalizedTons(row)));
    $('#totalTons').textContent = allTons.toFixed(2);
    $('#totalEarnings').textContent = money(allTons * INCENTIVE_RATE);
    $('#activeDays').textContent = formatCount(daily.size);
    $('#peakTons').textContent = Math.max(0, ...daily.values()).toFixed(2);
    renderFilters();
    renderChart(daily);
    renderStaff(monthRows);
    renderLog(monthRows);
  }

  function renderFilters() {
    const holder = $('#employeeFilters');
    holder.replaceChildren();
    const staffNames = [...new Set(currentMonthRecords().map((row) => row.staff.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    if (chartStaff !== 'all' && !staffNames.includes(chartStaff)) chartStaff = 'all';
    const options = [['all', copy().all], ...staffNames.map((name) => [name, name])];
    options.forEach(([value, label]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `filter-pill${chartStaff === value ? ' active' : ''}`;
      button.textContent = label;
      button.setAttribute('aria-pressed', chartStaff === value ? 'true' : 'false');
      button.addEventListener('click', () => { chartStaff = value; render(); });
      holder.append(button);
    });
  }

  function svgElement(tag, attrs = {}) {
    const node = document.createElementNS(svgNS, tag);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, String(value)));
    return node;
  }

  function renderChart() {
    const chart = $('#tonsChart');
    chart.replaceChildren();
    const rows = currentMonthRecords().filter((row) => chartStaff === 'all' || row.staff === chartStaff);
    const days = Number(new Date(Number(selectedMonth.slice(0, 4)), Number(selectedMonth.slice(5, 7)), 0).getDate());
    const totals = new Array(days + 1).fill(0);
    rows.forEach((row) => { totals[dayNumber(row.date)] += normalizedTons(row); });
    const width = 960, left = 40, right = 18, top = 12, bottom = 34;
    const innerW = width - left - right, innerH = 250 - top - bottom;
    const maximum = Math.max(1, ...totals) * 1.18;
    const y = (value) => top + innerH - (value / maximum) * innerH;
    const x = (day) => left + ((day - 1) / Math.max(1, days - 1)) * innerW;
    const defs = svgElement('defs');
    const gradient = svgElement('linearGradient', { id: 'areaGradient', x1: '0', x2: '0', y1: '0', y2: '1' });
    gradient.append(svgElement('stop', { offset: '0%', 'stop-color': '#20d17c', 'stop-opacity': '.28' }), svgElement('stop', { offset: '100%', 'stop-color': '#20d17c', 'stop-opacity': '0' }));
    defs.append(gradient); chart.append(defs);
    for (let i = 0; i <= 3; i++) {
      const gy = top + (innerH * i / 3);
      chart.append(svgElement('line', { x1: left, y1: gy, x2: width - right, y2: gy, stroke: '#303640', 'stroke-width': '1' }));
      const tick = svgElement('text', { x: left - 9, y: gy + 4, fill: '#777f8c', 'font-size': '10', 'text-anchor': 'end' });
      tick.textContent = (maximum * (1 - i / 3)).toFixed(0); chart.append(tick);
    }
    const points = Array.from({ length: days }, (_, index) => `${x(index + 1)},${y(totals[index + 1])}`);
    const areaPath = `M ${x(1)} ${top + innerH} L ${points.join(' L ')} L ${x(days)} ${top + innerH} Z`;
    chart.append(svgElement('path', { d: areaPath, fill: 'url(#areaGradient)' }));
    chart.append(svgElement('polyline', { points: points.join(' '), fill: 'none', stroke: '#27d17d', 'stroke-width': '3', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'vector-effect': 'non-scaling-stroke' }));
    for (let d = 1; d <= days; d++) {
      if ([1, 5, 10, 15, 20, 25, 30, days].includes(d)) {
        const label = svgElement('text', { x: x(d), y: 239, fill: '#77808d', 'font-size': '10', 'text-anchor': 'middle' });
        label.textContent = String(d); chart.append(label);
      }
      if (totals[d] > 0) chart.append(svgElement('circle', { cx: x(d), cy: y(totals[d]), r: '3.5', fill: '#27d17d', stroke: '#15181e', 'stroke-width': '2' }));
    }
    chart.setAttribute('aria-label', `${copy().dailyChart} — ${chartStaff === 'all' ? copy().all : chartStaff}`);
  }

  function renderStaff(rows) {
    const holder = $('#staffSummaryCards');
    holder.replaceChildren();
    const names = [...new Set(rows.map((row) => row.staff.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    const values = names.map((name) => {
      const mine = rows.filter((row) => row.staff === name);
      return { name, total: mine.reduce((sum, row) => sum + normalizedTons(row), 0) };
    });
    const maximum = Math.max(1, ...values.map((item) => item.total));
    values.forEach((item) => {
      const card = document.createElement('article'); card.className = 'staff-card';
      const name = document.createElement('div'); name.className = 'staff-card-name'; name.textContent = item.name;
      const amount = document.createElement('div'); amount.className = 'staff-card-value'; amount.textContent = item.total.toFixed(2);
      const unit = document.createElement('div'); unit.className = 'staff-card-unit'; unit.textContent = copy().tons;
      const earned = document.createElement('div'); earned.className = 'staff-card-earn'; earned.textContent = `${money(item.total * INCENTIVE_RATE)} ${copy().earned}`;
      const meter = document.createElement('div'); meter.className = 'staff-meter';
      const bar = document.createElement('span'); bar.style.width = `${Math.max(item.total ? 4 : 0, item.total / maximum * 100)}%`; meter.append(bar);
      card.append(name, amount, unit, earned, meter); holder.append(card);
    });
  }

  function renderLog(rows) {
    const body = $('#logRows'); body.replaceChildren();
    const sorted = [...rows].sort((a, b) => dayNumber(a.date) - dayNumber(b.date) || a.staff.localeCompare(b.staff));
    $('#entryCount').textContent = `${formatCount(sorted.length)} ${copy().entries}`;
    $('#emptyState').hidden = sorted.length > 0;
    $('.table-scroll').hidden = sorted.length === 0;
    sorted.forEach((row) => {
      const tr = document.createElement('tr');
      const cells = [String(dayNumber(row.date)), row.staff, Number(row.bags20 || 0) ? formatCount(Number(row.bags20)) : '—', Number(row.bags25 || 0) ? formatCount(Number(row.bags25)) : '—', Number(row.bags30 || 0) ? formatCount(Number(row.bags30)) : '—'];
      cells.forEach((value, index) => {
        const td = document.createElement('td');
        if (index === 1) { const badge = document.createElement('span'); badge.className = 'staff-tag'; badge.textContent = value; td.append(badge); }
        else td.textContent = value;
        tr.append(td);
      });
      const tonsCell = document.createElement('td'); tonsCell.className = 'tons-cell'; tonsCell.textContent = normalizedTons(row).toFixed(2); tr.append(tonsCell);
      const earnedCell = document.createElement('td'); earnedCell.className = 'usd-cell'; earnedCell.textContent = money(normalizedTons(row) * INCENTIVE_RATE); tr.append(earnedCell);
      const actionCell = document.createElement('td');
      const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'delete-button'; remove.textContent = copy().delete;
      remove.setAttribute('aria-label', `${copy().delete} ${copy().dayPrefix} ${dayNumber(row.date)} — ${row.staff}`);
      remove.addEventListener('click', () => deleteRow(row.id)); actionCell.append(remove); tr.append(actionCell);
      body.append(tr);
    });
  }

  function showToast(text) {
    const toast = $('#toast'); if (!toast) return;
    toast.textContent = text; toast.classList.add('show');
    window.clearTimeout(showToast.timer); showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 2300);
  }

  function deleteRow(id) {
    if (!window.confirm(copy().confirmDelete)) return;
    records = records.filter((row) => row.id !== id);
    if (saveJSON(DATA_KEY, records)) { render(); showToast(copy().removed); }
  }

  $('#previousMonth').addEventListener('click', () => moveMonth(-1));
  $('#nextMonth').addEventListener('click', () => moveMonth(1));
  $('#languageToggle').addEventListener('click', () => { lang = lang === 'km' ? 'en' : 'km'; savePrefs(); applyLanguage(); });

  $('#entryForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const t = copy();
    const day = Number($('#dayInput').value);
    const [year, month] = selectedMonth.split('-').map(Number);
    const monthLength = new Date(year, month, 0).getDate();
    const counts = [Number($('#bags20').value), Number($('#bags25').value), Number($('#bags30').value)];
    if (!Number.isInteger(day) || day < 1 || day > monthLength) { $('#formMessage').textContent = t.invalidDay; return; }
    if (counts.some((count) => !Number.isInteger(count) || count < 0)) { $('#formMessage').textContent = t.invalidBags; return; }
    if (counts.every((count) => count === 0)) { $('#formMessage').textContent = t.invalidBags; return; }
    const staff = $('#staffInput').value.trim();
    if (!staff) { $('#formMessage').textContent = t.invalidEmployee; $('#staffInput').focus(); return; }
    const date = `${selectedMonth}-${String(day).padStart(2, '0')}`;
    const old = records.find((row) => row.date === date && row.staff === staff);
    const newRow = { id: old ? old.id : `entry-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, date, staff, bags20: counts[0], bags25: counts[1], bags30: counts[2] };
    records = old ? records.map((row) => row.id === old.id ? newRow : row) : [...records, newRow];
    if (saveJSON(DATA_KEY, records)) {
      $('#formMessage').textContent = old ? t.updated : t.saved;
      render(); showToast(old ? t.updated : t.saved);
    }
  });

  applyLanguage();
})();
