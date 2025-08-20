export function getAuthErrorMessage(error: any): string {
  const errorCode = error?.code || error?.message || ""

  // Firebase auth error codes to user-friendly messages
  const errorMessages: Record<string, string> = {
    "auth/invalid-credential": "Invalid email or password. Please check your credentials and try again.",
    "auth/user-not-found": "No account found with this email address. Please check your email or create a new account.",
    "auth/wrong-password": "Incorrect password. Please try again or reset your password.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/user-disabled": "This account has been disabled. Please contact support for assistance.",
    "auth/too-many-requests": "Too many failed attempts. Please wait a moment before trying again.",
    "auth/network-request-failed": "Network error. Please check your internet connection and try again.",
    "auth/email-already-in-use": "An account with this email already exists. Please sign in instead.",
    "auth/weak-password": "Password should be at least 6 characters long.",
    "auth/operation-not-allowed": "This sign-in method is not enabled. Please contact support.",
    "auth/invalid-verification-code": "Invalid verification code. Please try again.",
    "auth/invalid-verification-id": "Invalid verification ID. Please try again.",
    "auth/missing-email": "Please enter your email address.",
    "auth/missing-password": "Please enter your password.",
    "auth/requires-recent-login": "Please sign in again to complete this action.",
    "auth/popup-closed-by-user": "Sign-in was cancelled. Please try again.",
    "auth/cancelled-popup-request": "Sign-in was cancelled. Please try again.",
    "auth/popup-blocked": "Pop-up was blocked by your browser. Please allow pop-ups and try again.",
  }

  // Check if it's a Firebase error with a code
  if (errorCode.startsWith("auth/")) {
    return errorMessages[errorCode] || "An authentication error occurred. Please try again."
  }

  // Check if the error message contains Firebase error patterns
  for (const [code, message] of Object.entries(errorMessages)) {
    if (errorCode.includes(code) || error?.message?.includes(code)) {
      return message
    }
  }

  // Default fallback messages
  if (errorCode.toLowerCase().includes("network") || errorCode.toLowerCase().includes("connection")) {
    return "Network error. Please check your internet connection and try again."
  }

  if (errorCode.toLowerCase().includes("timeout")) {
    return "Request timed out. Please try again."
  }

  // Generic fallback
  return "Something went wrong. Please try again or contact support if the problem persists."
}
