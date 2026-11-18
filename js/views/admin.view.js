/* Admin page (admin label only): assign who is staff. */
R.admin = () => {
  stfPage = 'admin';
  return `<div class="stf">${stfAside()}<section>${stfTop()}<h1 class="t">Users</h1>
<p><b>Students</b> can use the site straight away. <b>Teachers</b> and <b>Staff</b> sign up as a request: approve it below and choose their role. Admin gives full access, so give it carefully.<br>Staff can be given a <b>stall</b>: they then only see that stall’s dishes and orders. “All stalls” is for a supervisor or cashier.</p>
<div id="req"></div>
<h3 style="margin:18px 0 8px">All users</h3>
<div id="adm"><div class="c">Loading users…</div></div>
<div class="c"><h3>Sample menu</h3><p>Import the original 18 demo dishes, spread across the 7 stalls. Staff can then edit or delete them.</p><button class="btn ol sm" onclick="AdminController.seedMenu()">Import sample menu</button></div></section></div>`;
};
