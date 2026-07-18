import { SignJWT, jwtVerify } from "jose";

function secret() {
  return new TextEncoder().encode(process.env.AUTH_SECRET!);
}

export async function createVerificationToken(email: string, name: string): Promise<string> {
  return new SignJWT({ email, name, purpose: "email-verification" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .setIssuedAt()
    .sign(secret());
}

export async function verifyVerificationToken(token: string): Promise<{ email: string; name: string }> {
  const { payload } = await jwtVerify(token, secret());
  if (payload.purpose !== "email-verification") throw new Error("Invalid token purpose");
  return { email: payload.email as string, name: payload.name as string };
}
