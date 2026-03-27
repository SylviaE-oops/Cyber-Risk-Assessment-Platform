// ── Google Sign-In ──────────────────────────────────────────────
// Replace with your actual Google OAuth Client ID from Google Cloud Console:
// https://console.cloud.google.com/ > APIs & Services > Credentials
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

function openLoginModal() {
  document.getElementById('loginModal').classList.add('open');
}

function closeLoginModal() {
  document.getElementById('loginModal').classList.remove('open');
}

function handleGoogleCredential(response) {
  const payload = JSON.parse(atob(response.credential.split('.')[1]));
  const { name, picture } = payload;

  document.getElementById('userAvatar').src = picture;
  document.getElementById('userName').textContent = name;
  document.getElementById('userInfo').style.display = 'flex';
  document.getElementById('loginBtn').style.display = 'none';

  closeLoginModal();
}

function signOut() {
  google.accounts.id.disableAutoSelect();
  document.getElementById('userInfo').style.display = 'none';
  document.getElementById('loginBtn').style.display = '';
}

window.addEventListener('load', function () {
  // Close modal when clicking the backdrop
  document.getElementById('loginModal').addEventListener('click', function (e) {
    if (e.target === this) closeLoginModal();
  });

  if (typeof google === 'undefined') return;

  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleGoogleCredential,
  });

  google.accounts.id.renderButton(
    document.getElementById('googleSignInBtn'),
    { theme: 'filled_black', size: 'large', shape: 'pill', text: 'signin_with' }
  );
});
