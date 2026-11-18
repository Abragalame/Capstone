/* Login + register. Register has three account types:
   Student  -> active immediately.
   Teacher / Staff -> created as "pending"; an admin must approve (and choose the final role). */
let regType = 'student';
const REG_NOTE = {
  student: 'New student accounts work straight away.',
  teacher: 'Teacher accounts need approval from the admin. You can log in, but ordering opens once you are approved.',
  staff: 'Canteen staff accounts need approval from the admin. You will see a waiting page until then.',
};
R.login = () => {
  const reg = authMode == 'register', t = regType, tb = (k, l) => `<button class="${t == k ? 'on' : ''}" onclick="setRegType('${k}')">${l}</button>`;
  return `<div class="lg"><div class="tg">${fsBtn()}${themeBtn()}</div><div class="nv"><img class="lgl" src="logo.png" alt=""><h1>MCPI Canteen</h1><span>Maryknoll College of Panabo, Inc.</span></div><div class="c">
<div class="seg" role="group" aria-label="Log in or register"><button class="${reg ? '' : 'on'}" onclick="setAuthMode('login')">Log in</button><button class="${reg ? 'on' : ''}" onclick="setAuthMode('register')">Register</button></div>
<h2 style="margin-top:14px">${reg ? 'Create your account' : 'Welcome back'}</h2>
${reg ? `<label class="l">I am a…</label><div class="seg regtype" id="regT" role="group" aria-label="Account type">${tb('student', 'Student')}${tb('teacher', 'Teacher')}${tb('staff', 'Staff')}</div>
<label class="l" for="nm">Your name</label><input class="in" id="nm" autocomplete="name" placeholder="e.g. Juan Dela Cruz">` : ''}
<label class="l" for="em">Email</label><input class="in" id="em" type="email" autocomplete="email" placeholder="you@example.com">
<label class="l" for="pw">Password</label><input class="in" id="pw" type="password" autocomplete="${reg ? 'new-password' : 'current-password'}" placeholder="At least 8 characters" onkeydown="if(event.key=='Enter')submitAuth()">
${reg ? `<div id="fEmp" ${t == 'student' ? 'hidden' : ''}><label class="l" for="emp">Employee ID</label><input class="in" id="emp" autocomplete="off" placeholder="e.g. EMP-0123"><small class="rmark">The admin uses this to check who you are.</small></div>
<div id="fRoom" ${t == 'staff' ? 'hidden' : ''}><div class="rf" style="margin-top:12px"><div><label class="l" for="gr">Grade</label><select class="in" id="gr">${gradeOpts(S.grade)}</select></div><div><label class="l" for="rm">Room number</label><input class="in" id="rm" maxlength="8" autocomplete="off" value="${esc(S.rn)}" placeholder="e.g. 206" oninput="this.value=cleanRn(this.value)"></div></div><small class="rmark" id="rmNote">${t == 'teacher' ? 'Your classroom, used for delivery.' : 'Your grade and room number are used for classroom delivery.'}</small></div>
<div id="fSid" ${t == 'student' ? '' : 'hidden'}><label class="l" for="sid">Student ID (optional)</label><input class="in" id="sid" placeholder="e.g. 2024-0001"></div>` : ''}
<p class="errt" id="authE" role="alert"></p>
<button class="btn" id="authBtn" onclick="submitAuth()">${reg ? (t == 'student' ? 'Create account' : 'Request account') : 'Log in'}</button>
${reg ? `<div class="demo" id="regNote">${REG_NOTE[t]}</div>` : ''}
<p style="text-align:center;margin:0"><a href="#/">Back</a> · <a href="#/guide">How it works</a></p></div></div>`;
};
