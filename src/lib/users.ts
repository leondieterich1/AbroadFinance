import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";

export type DbUser = {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  email_verified: boolean;
  failed_login_attempts: number;
  locked_until: string | null;
  last_verification_sent_at: string | null;
};

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;
const VERIFICATION_COOLDOWN_SECONDS = 60;
const PASSWORD_HASH_ROUNDS = 12;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function findUserByEmail(email: string): Promise<DbUser | null> {
  const rows = await sql`SELECT * FROM users WHERE email = ${normalizeEmail(email)}`;
  return (rows[0] as DbUser) ?? null;
}

/** Create or update an unverified signup. Refuses if the email already belongs to a verified account. */
export async function beginSignup(
  email: string,
  name: string,
  password: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const normalizedEmail = normalizeEmail(email);
  const existing = await findUserByEmail(normalizedEmail);
  if (existing?.email_verified) {
    return { ok: false, error: "Für diese E-Mail existiert bereits ein Konto. Bitte melde dich an." };
  }

  const passwordHash = await bcrypt.hash(password, PASSWORD_HASH_ROUNDS);
  if (existing) {
    await sql`UPDATE users SET name = ${name}, password_hash = ${passwordHash} WHERE email = ${normalizedEmail}`;
  } else {
    await sql`INSERT INTO users (email, name, password_hash) VALUES (${normalizedEmail}, ${name}, ${passwordHash})`;
  }
  return { ok: true };
}

/**
 * Enforces a cooldown between verification emails to the same address, so
 * the signup endpoint can't be used to bomb someone's inbox. Records the
 * send immediately (before the email actually goes out) to avoid a race
 * where two quick requests both pass the check.
 */
export async function canSendVerificationEmail(email: string): Promise<boolean> {
  const normalizedEmail = normalizeEmail(email);
  const user = await findUserByEmail(normalizedEmail);
  if (user?.last_verification_sent_at) {
    const elapsedSeconds = (Date.now() - new Date(user.last_verification_sent_at).getTime()) / 1000;
    if (elapsedSeconds < VERIFICATION_COOLDOWN_SECONDS) return false;
  }
  await sql`UPDATE users SET last_verification_sent_at = now() WHERE email = ${normalizedEmail}`;
  return true;
}

export async function markEmailVerified(email: string): Promise<DbUser | null> {
  const rows = await sql`
    UPDATE users SET email_verified = TRUE WHERE email = ${normalizeEmail(email)} RETURNING *
  `;
  return (rows[0] as DbUser) ?? null;
}

export type PasswordCheckResult = { user: DbUser } | { error: "invalid" | "locked" | "unverified" };

/** Verifies a login attempt against the stored bcrypt hash, applying lockout after repeated failures. */
export async function verifyPassword(email: string, password: string): Promise<PasswordCheckResult> {
  const normalizedEmail = normalizeEmail(email);
  const user = await findUserByEmail(normalizedEmail);
  if (!user) return { error: "invalid" };

  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    return { error: "locked" };
  }
  if (!user.email_verified) {
    return { error: "unverified" };
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    const attempts = user.failed_login_attempts + 1;
    const shouldLock = attempts >= MAX_FAILED_ATTEMPTS;
    await sql`
      UPDATE users
      SET failed_login_attempts = ${attempts},
          locked_until = ${shouldLock ? new Date(Date.now() + LOCKOUT_MINUTES * 60_000).toISOString() : null}
      WHERE email = ${normalizedEmail}
    `;
    return { error: shouldLock ? "locked" : "invalid" };
  }

  await sql`UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE email = ${normalizedEmail}`;
  return { user };
}
