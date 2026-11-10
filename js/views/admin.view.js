/* Admin page (admin label only): assign who is staff. */
R.admin = () => {
  stfPage = 'admin';
  return `<div class="stf">${stfAside()}<section>${stfTop()}<h1 class="t">Users</h1>
<p>Every new account is a <b>Student</b>. Promote people to <b>Staff</b> here. They see their new page the next time they open or refresh the site.</p>
<div id="adm"><div class="c">Loading users…</div></div>
<div class="c"><h3>Sample menu</h3><p>Import the original 18 demo dishes, spread across the 7 stalls. Staff can then edit or delete them.</p><button class="btn ol sm" onclick="AdminController.seedMenu()">Import sample menu</button></div></section></div>`;
};
