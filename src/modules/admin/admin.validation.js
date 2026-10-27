
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const adminValidation = {
  validateEmail(email) {
    if (typeof email !== "string") {
      return {
        valid: false,
        error: "Email is required.",
      };
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (
      normalizedEmail.length > 254 ||
      !EMAIL_REGEX.test(normalizedEmail)
    ) {
      return {
        valid: false,
        error: "Please enter a valid email address.",
      };
    }

    return {
      valid: true,
      email: normalizedEmail,
    };
  },

  validatePassword(password) {
    if (typeof password !== "string" || password.length === 0) {
      return {
        valid: false,
        error: "Password is required.",
      };
    }

    if (password.length < 12) {
      return {
        valid: false,
        error: "Password must be at least 12 characters long.",
      };
    }

    if (password.length > 128) {
      return {
        valid: false,
        error: "Password cannot exceed 128 characters.",
      };
    }

    return {
      valid: true,
      password,
    };
  },
};
