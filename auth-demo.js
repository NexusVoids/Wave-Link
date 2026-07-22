/*
  WaveLink — demo auth flow
  ---------------------------------------------------------------
  This simulates what happens after a real Roblox OAuth login so the
  product experience can be shown end-to-end without a backend.

  WHAT'S REAL vs SIMULATED:
  - Real: the page/redirect structure below (login -> consent -> dashboard)
    mirrors an actual OAuth authorization-code flow.
  - Simulated: the "Authorize" step here happens on wavelink's own page.
    In production, that screen is hosted BY ROBLOX at
    https://apis.roblox.com/oauth/v1/authorize?client_id=...&redirect_uri=...
    and WaveLink never sees the user's Roblox credentials.
  - Simulated: the resulting "session" is just a localStorage flag with a
    fake username. A real integration exchanges the authorization code
    Roblox sends back for an access token — and that exchange must happen
    on a server, because it requires a client secret that can't live in
    front-end JS. See the comment block at the bottom of this file for
    what that server-side step looks like.
*/
(function(){
  "use strict";

  var loginBtn = document.getElementById('robloxLoginBtn');
  var emailBtn = document.getElementById('emailContinueBtn');
  var overlay = document.getElementById('consentOverlay');
  var authorizeBtn = document.getElementById('consentAuthorize');
  var cancelBtn = document.getElementById('consentCancel');
  var emailInput = document.getElementById('workEmail');

  if (!loginBtn || !overlay) return;

  var DEMO_USERNAMES = ['kaidenn_rblx', 'novabuilder22', 'wavehq_sam', 'roblox_ari'];

  function openConsent(){
    overlay.classList.add('open');
    document.addEventListener('keydown', onEsc);
  }
  function closeConsent(){
    overlay.classList.remove('open');
    document.removeEventListener('keydown', onEsc);
  }
  function onEsc(e){ if (e.key === 'Escape') closeConsent(); }

  loginBtn.addEventListener('click', function(){
    openConsent();
  });

  emailBtn.addEventListener('click', function(e){
    e.preventDefault();
    openConsent();
  });

  cancelBtn.addEventListener('click', closeConsent);
  overlay.addEventListener('click', function(e){
    if (e.target === overlay) closeConsent();
  });

  authorizeBtn.addEventListener('click', function(){
    authorizeBtn.disabled = true;
    authorizeBtn.textContent = 'Authorizing…';

    // Simulated: Roblox confirming the grant and redirecting back with a code
    setTimeout(function(){
      closeConsent();
      startVerifying();
    }, 700);
  });

  function startVerifying(){
    loginBtn.classList.add('loading');
    loginBtn.disabled = true;
    loginBtn.querySelector('.btn-label').textContent = 'Verifying your account…';

    // Simulated: server exchanging the auth code for a token + fetching profile
    setTimeout(function(){
      var username = DEMO_USERNAMES[Math.floor(Math.random() * DEMO_USERNAMES.length)];
      var session = {
        robloxUsername: username,
        connectedAt: new Date().toISOString(),
        demo: true
      };
      try{
        localStorage.setItem('wavelink_demo_session', JSON.stringify(session));
      } catch(e){ /* storage unavailable — continue anyway for this demo */ }

      loginBtn.querySelector('.btn-label').textContent = 'Connected — redirecting…';

      setTimeout(function(){
        window.location.href = 'dashboard.html';
      }, 500);
    }, 1400);
  }
})();

/*
  ---------------------------------------------------------------
  MAKING THIS REAL: server-side steps for actual Roblox OAuth
  ---------------------------------------------------------------
  1. Register an OAuth app at https://create.roblox.com/dashboard/credentials
     to get a client_id and client_secret, and set an allowed redirect_uri.

  2. Replace the "Continue with Roblox" button's behavior with a real
     redirect (no popup/modal needed — Roblox hosts the consent screen):

       const authUrl = new URL('https://apis.roblox.com/oauth/v1/authorize');
       authUrl.searchParams.set('client_id', ROBLOX_CLIENT_ID);
       authUrl.searchParams.set('redirect_uri', 'https://yoursite.com/callback');
       authUrl.searchParams.set('scope', 'openid profile group:read');
       authUrl.searchParams.set('response_type', 'code');
       authUrl.searchParams.set('state', crypto.randomUUID());
       window.location.href = authUrl.toString();

  3. Roblox redirects back to your redirect_uri with a ?code=... param.
     A server endpoint (Node/Express, Cloudflare Worker, Vercel function —
     anything that can keep a secret) exchanges that code for tokens:

       POST https://apis.roblox.com/oauth/v1/token
       Content-Type: application/x-www-form-urlencoded
       client_id=...&client_secret=...&grant_type=authorization_code
       &code=...&redirect_uri=...

  4. That server stores the resulting session (e.g. a signed cookie or
     JWT) and only THEN serves dashboard.html with real account data
     fetched from Roblox's Open Cloud / Users API.

  GitHub Pages can host steps 1-2 (the static site), but step 3 needs a
  small server somewhere — a single serverless function is enough.
*/
