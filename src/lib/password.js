
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export const passwordService = {
  async hash(password) {
    return bcrypt.hash(password, SALT_ROUNDS);
  },

  async verify(password, passwordHash) {
    if (
      typeof password !== "string" ||
      typeof passwordHash !== "string"
    ) {
      return false;
    }

    return bcrypt.compare(password, passwordHash);
  },
};
