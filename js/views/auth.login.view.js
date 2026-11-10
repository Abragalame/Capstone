/* Login + register (replaces the old name-only demo login). Same layout/classes as before. */
R.login = () => {
  const reg = authMode == 'register';
  return `<div class="lg"><div class="tg">${fsBtn()}${themeBtn()}</div><div class="nv"><img class="lgl" src="logo.png" alt=""><h1>MCPI Canteen</h1><span>Maryknoll College of Panabo, Inc.</span></div><div class="c">
<div class="seg" role="group" aria-label="Log in or register"><button class="${reg ? '' : 'on'}" onclick="setAuthMode('login')">Log in</button><button class="${reg ? 'on' : ''}" onclick="setAuthMode('register')">Register</button></div>
<h2 style="margin-top:14px">${reg ? 'Create your account' : 'Welcome back'}</h2>
${reg ? `<label class="l" for="nm">Your name</label><input class="in" id="nm" autocomplete="name" placeholder="e.g. Juan Dela Cruz">` : ''}
<label class="l" for="em">Email</label><input class="in" id="em" type="email" autocomplete="email" placeholder="you@example.com">
<label class="l" for="pw">Password</label><input class="in" id="pw" type="password" autocomplete="${reg ? 'new-password' : 'current-password'}" placeholder="At least 8 characters" onkeydown="if(event.key=='Enter')submitAuth()">
${reg ? `<div class="rf" style="margin-top:12px"><div><label class="l" for="gr">Grade</label><select class="in" id="gr">${gradeOpts(S.grade)}</select></div><div><label class="l" for="rm">Room number</label><input class="in" id="rm" maxlength="8" autocomplete="off" value="${esc(S.rn)}" placeholder="e.g. 206" oninput="this.value=cleanRn(this.value)"></div></div><small class="rmark">Your grade and room number are used for classroom delivery.</small><label class="l">Student ID (optional)</label><input class="in" id="sid" placeholder="e.g. 2024-0001">` : ''}
<p class="errt" id="authE" role="alert"></p>
<button class="btn" id="authBtn" onclick="submitAuth()">${reg ? 'Create account' : 'Log in'}</button>
${reg ? '<div class="demo">New accounts are students. The admin can make you canteen staff.</div>' : ''}
<p style="text-align:center;margin:0"><a href="#/">Back</a> · <a href="#/guide">How it works</a></p></div></div>`;
};
