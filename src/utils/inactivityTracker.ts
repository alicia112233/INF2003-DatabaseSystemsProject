// Set timeout limit (5 mins = 300000 ms)
const INACTIVITY_LIMIT = 300000;
let inactivityTimer: ReturnType<typeof setTimeout>;

function handleLogout() {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userRole");
  // Clear cookies
  document.cookie = "isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = "userEmail=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = "userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  alert("Logged out due to inactivity.");
  window.location.href = "/";
}

function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    handleLogout();
  }, INACTIVITY_LIMIT);
}

export function setupInactivityTracker() {
  // Only setup if user is logged in
  if (typeof window !== 'undefined' && localStorage.getItem("isLoggedIn") === "true") {
    // Reset on user actions
    ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach(event => {
      window.addEventListener(event, resetInactivityTimer);
    });
    resetInactivityTimer(); // start timer
  }
}

export function clearInactivityTracker() {
  clearTimeout(inactivityTimer);
  if (typeof window !== 'undefined') {
    ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach(event => {
      window.removeEventListener(event, resetInactivityTimer);
    });
  }
}