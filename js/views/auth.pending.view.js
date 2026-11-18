/* Shown to Teacher / Staff accounts until the admin approves (or declines) them. */
R.pending = () => {
  const declined = S.reqStatus === 'declined', what = S.req === 'teacher' ? 'teacher' : 'canteen staff';
  return `<div class="lg"><div class="tg">${fsBtn()}${themeBtn()}</div><div class="nv"><img class="lgl" src="logo.png" alt=""><h1>MCPI Canteen</h1><span>Maryknoll College of Panabo, Inc.</span></div>
<div class="c" style="text-align:center"><div style="font-size:3rem" aria-hidden="true">${declined ? '🚫' : '⏳'}</div>
<h2>${declined ? 'Request declined' : 'Waiting for admin approval'}</h2>
<p>${declined
    ? `The admin did not approve your ${what} account. If you think this is a mistake, please see the canteen admin.`
    : `Hi ${esc(S.user)}! Your ${what} account request was sent. The admin will review it and choose your role. This page updates by itself once you are approved.`}</p>
<p class="rmark">Signed in as ${esc(S.email)}</p>
<button class="btn" onclick="checkApproval(true)">Check again</button>
<button class="btn ol" onclick="useAsStudent()">Use a student account instead</button>
<button class="btn ol" onclick="logout()">Log out</button></div></div>`;
};
