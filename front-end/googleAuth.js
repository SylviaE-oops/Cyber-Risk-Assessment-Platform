(function () {
  const API_BASE_URL = window.API_BASE_URL || 'http://localhost:3000';
  const AUTH_TOKEN_KEY = 'cyberposture_jwt_token';
  const AUTH_USER_KEY = 'cyberposture_auth_user';
  const GOOGLE_CLIENT_ID = window.GOOGLE_CLIENT_ID || '';

  let isRegistrationMode = false;

  function openLoginModal() {
    isRegistrationMode = false;
    showLoginForm();
    clearLoginError();
    document.getElementById('loginModal').classList.add('open');
    document.getElementById('loginUsername').focus();
  }

  function closeLoginModal() {
    document.getElementById('loginModal').classList.remove('open');
    isRegistrationMode = false;
  }

  function toggleRegistration(event) {
    event.preventDefault();
    isRegistrationMode = !isRegistrationMode;
    if (isRegistrationMode) {
      showRegisterForm();
    } else {
      showLoginForm();
    }
  }

  function showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('modalTitle').textContent = 'Sign in to your account';
    document.getElementById('modalSub').textContent = 'Save your assessments and access your security history.';
    document.getElementById('googleBtnSection').style.display = 'block';
    document.getElementById('dividerSection').style.display = 'flex';
    clearLoginError();
  }

  function showRegisterForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.getElementById('modalTitle').textContent = 'Create your account';
    document.getElementById('modalSub').textContent = 'Join CyberPosture to start saving assessments.';
    document.getElementById('googleBtnSection').style.display = 'none';
    document.getElementById('dividerSection').style.display = 'none';
    clearLoginError();
  }

  function setSignedInUser(username) {
    localStorage.setItem(AUTH_USER_KEY, username);

    const avatarEl = document.getElementById('userAvatar');
    avatarEl.src = 'https://ui-avatars.com/api/?background=0a0d12&color=00e5a0&name=' + encodeURIComponent(username);
    avatarEl.alt = username;

    document.getElementById('userName').textContent = username;
    document.getElementById('userInfo').style.display = 'flex';
    document.getElementById('loginBtn').style.display = 'none';
  }

  function signOut() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    document.getElementById('userInfo').style.display = 'none';
    document.getElementById('loginBtn').style.display = '';
  }

  function clearLoginError() {
    document.getElementById('loginError').textContent = '';
    document.getElementById('registerError').textContent = '';
  }

  function setLoginLoading(isLoading) {
    const btn = document.getElementById('loginSubmitBtn');
    btn.disabled = isLoading;
    btn.textContent = isLoading ? 'Signing in...' : 'Sign in';
  }

  function setRegisterLoading(isLoading) {
    const btn = document.getElementById('registerSubmitBtn');
    btn.disabled = isLoading;
    btn.textContent = isLoading ? 'Creating account...' : 'Create account';
  }

  async function handleLogin() {
    clearLoginError();

    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!username || !password) {
      document.getElementById('loginError').textContent = 'Please enter email and password.';
      return;
    }

    setLoginLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      if (!response.ok || !data.token) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      setSignedInUser(username);
      closeLoginModal();
    } catch (error) {
      document.getElementById('loginError').textContent = error.message || 'Login failed';
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleRegister() {
    clearLoginError();

    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirm').value;

      const org_name = document.getElementById('registerOrgName').value.trim();
      const org_type = document.getElementById('registerOrgType').value;

      if (!username || !password || !confirmPassword || !org_name || !org_type) {
        document.getElementById('registerError').textContent = 'Please fill in all fields.';
      return;
    }

    if (password.length < 6) {
      document.getElementById('registerError').textContent = 'Password must be at least 6 characters.';
      return;
    }

    if (password !== confirmPassword) {
      document.getElementById('registerError').textContent = 'Passwords do not match.';
      return;
    }

    setRegisterLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password, confirmPassword, org_name, org_type })
      });

      const data = await response.json();
      if (!response.ok || !data.token) {
        throw new Error(data.error || 'Registration failed');
      }

      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      setSignedInUser(username);
      closeLoginModal();
    } catch (error) {
      document.getElementById('registerError').textContent = error.message || 'Registration failed';
    } finally {
      setRegisterLoading(false);
    }
  }

  async function handleGoogleCredential(response) {
    clearLoginError();
    try {
      const apiResponse = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: response.credential })
      });

      const data = await apiResponse.json();
      if (!apiResponse.ok || !data.token) {
        throw new Error(data.error || 'Google login failed');
      }

      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      setSignedInUser(data.user?.name || data.user?.username || 'Google User');
      closeLoginModal();
    } catch (error) {
      document.getElementById('loginError').textContent = error.message || 'Google login failed';
    }
  }

  function initGoogleSignIn() {
    if (!GOOGLE_CLIENT_ID) {
      return;
    }

    if (typeof google === 'undefined' || !google.accounts?.id) {
      return;
    }

    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredential
    });

    google.accounts.id.renderButton(
      document.getElementById('googleSignInBtn'),
      { theme: 'outline', size: 'large', shape: 'pill', text: 'signin_with', width: 280 }
    );
  }

  window.addEventListener('load', function () {
    document.getElementById('loginModal').addEventListener('click', function (e) {
      if (e.target === this) closeLoginModal();
    });

    document.getElementById('loginPassword').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') handleLogin();
    });

    document.getElementById('registerConfirm').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') handleRegister();
    });

    const existingToken = localStorage.getItem(AUTH_TOKEN_KEY);
    const existingUser = localStorage.getItem(AUTH_USER_KEY);
    if (existingToken && existingUser) {
      setSignedInUser(existingUser);
    }

    initGoogleSignIn();
  });

  window.handleLogin = handleLogin;
  window.handleRegister = handleRegister;
  window.openLoginModal = openLoginModal;
  window.closeLoginModal = closeLoginModal;
  window.signOut = signOut;
  window.toggleRegistration = toggleRegistration;
})();
