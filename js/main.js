/* Start-up: check the Appwrite setup, restore the session, then draw the page. */
(async function boot() {
  const fail = (msg) => { A.innerHTML = `<div class="boot">${msg}</div>`; };
  if (CONFIG.projectId.startsWith('REPLACE')) return fail('Setup needed: put your Appwrite Project ID in js/config.js');
  try { AW.client; } catch (e) { return fail('Could not load the Appwrite SDK. Check your internet connection.'); }

  try {
    const u = await AuthService.current();
    if (u) await applyUser(u);
  } catch (e) { /* not signed in */ }

  addEventListener('resize', hsAll);
  addEventListener('hashchange', go);
  addEventListener('storage', (e) => { if (e.key == 'mcpi') { load(); go(); } });
  go();
})();
