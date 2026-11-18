/* The Student / Staff / Admin text shown top-right on every signed-in page. */
const ROLE_LABEL = { student: 'Student', teacher: 'Teacher', staff: 'Staff', admin: 'Admin', pending: 'Pending approval' };
const roleBadge = () => `<span class="rolebadge rb-${S.role}">${ROLE_LABEL[S.role] || 'Student'}</span>`;
const homeHash = () => (S.role === 'admin' ? '#/admin' : S.role === 'staff' ? '#/staff' : S.role === 'pending' ? '#/pending' : '#/home');

/* Who may open which page. Student pages (ordering): student + teacher + admin. Staff page: staff + admin.
   Admin page: admin only. Pending page: accounts waiting for approval (they can open nothing else). */
const canView = (r) =>
  r === 'guide' ? true :
  S.role === 'pending' ? r === 'pending' :
  r === 'pending' ? false :
  r === 'staff' ? S.role !== 'student' :
  r === 'admin' ? S.role === 'admin' :
  S.role !== 'staff'; /* every other page is a student page */

/* Admin only: jump between the three areas of the site. */
const viewSwitch = (active) => S.role !== 'admin' ? '' :
  `<div class="seg viewsw" role="group" aria-label="Switch view">${[['student', 'Student', '#/home'], ['staff', 'Staff', '#/staff'], ['admin', 'Admin', '#/admin']]
    .map(([k, l, h]) => `<button class="${k === active ? 'on' : ''}" onclick="location.hash='${h}'">${l}</button>`).join('')}</div>`;
const viewBar = () => S.role !== 'admin' ? '' :
  `<div class="viewbar"><span>Viewing as <b>Student</b></span>${viewSwitch('student')}</div>`;

/* Which stalls this person works at. No stall label = all stalls (supervisor). Admin = all. */
const myStalls = () => (S.role === 'admin' || !S.stalls.length ? STALLS.map((s) => s.id) : S.stalls);
const canAct = (stallId) => myStalls().includes(Number(stallId));
