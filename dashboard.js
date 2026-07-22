/*
  WaveLink — dashboard page logic (demo)
  In production, this auth check and the user data below would come from
  a real server-side session — see the notes at the bottom of auth-demo.js.
*/
(function(){
  "use strict";

  var session = null;
  try{
    session = JSON.parse(localStorage.getItem('wavelink_demo_session') || 'null');
  } catch(e){ /* localStorage unavailable */ }

  if (!session || !session.robloxUsername){
    window.location.href = 'login.html';
    return;
  }

  var nameEls = [
    document.getElementById('sidebarUsername'),
    document.getElementById('verifyUsername')
  ];
  nameEls.forEach(function(el){ if (el) el.textContent = session.robloxUsername; });

  var welcomeHeading = document.getElementById('welcomeHeading');
  if (welcomeHeading) welcomeHeading.textContent = 'Welcome back, ' + session.robloxUsername;

  var activityUsername = document.getElementById('activityUsername');
  if (activityUsername) activityUsername.textContent = session.robloxUsername;

  var verifyTimestamp = document.getElementById('verifyTimestamp');
  if (verifyTimestamp && session.connectedAt){
    try{
      var d = new Date(session.connectedAt);
      verifyTimestamp.textContent = 'connected ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch(e){}
  }

  var logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn){
    logoutBtn.addEventListener('click', function(){
      try{ localStorage.removeItem('wavelink_demo_session'); } catch(e){}
      window.location.href = 'index.html';
    });
  }

  var sidebar = document.getElementById('appSidebar');
  var menuBtn = document.getElementById('mobileMenuBtn');
  var scrim = document.getElementById('sidebarScrim');
  function closeSidebar(){ sidebar.classList.remove('open'); scrim.classList.remove('open'); }
  if (menuBtn){
    menuBtn.addEventListener('click', function(){
      sidebar.classList.add('open');
      scrim.classList.add('open');
    });
  }
  if (scrim) scrim.addEventListener('click', closeSidebar);
})();
