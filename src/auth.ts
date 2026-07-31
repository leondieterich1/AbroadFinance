import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verifyVerificationToken } from "@/lib/verification";
import { markEmailVerified, verifyPassword } from "@/lib/users";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        verificationToken: { label: "Verification Token", type: "text" },
      },
      async authorize(credentials) {
        // Email-verification magic link login
        if (credentials?.verificationToken) {
          try {
            const { email } = await verifyVerificationToken(credentials.verificationToken as string);
            const user = await markEmailVerified(email);
            if (!user) return null;
            return { id: user.id, email: user.email, name: user.name, isAdmin: user.is_admin };
          } catch {
            return null;
          }
        }

        // Password login — verified against the bcrypt hash in the database,
        // with account lockout after repeated failed attempts.
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const result = await verifyPassword(email, password);
        if ("error" in result) return null;
        return { id: result.user.id, email: result.user.email, name: result.user.name, isAdmin: result.user.is_admin };
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.name = user.name;
        token.email = user.email;
        token.isAdmin = user.isAdmin ?? false;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.isAdmin = token.isAdmin ?? false;
      }
      return session;
    },
  },
});
