/* The Student / Staff / Admin text shown top-right on every signed-in page. */
const ROLE_LABEL = { student: 'Student', staff: 'Staff', admin: 'Admin' };
const roleBadge = () => `<span class="rolebadge rb-${S.role}">${ROLE_LABEL[S.role] || 'Student'}</span>`;
const homeHash = () => (S.role === 'admin' ? '#/admin' : S.role === 'staff' ? '#/staff' : '#/home');
