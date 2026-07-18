import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verifyVerificationToken } from "@/lib/verification";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
        verificationToken: { label: "Verification Token", type: "text" },
      },
      async authorize(credentials) {
        // Email-verification magic link login
        if (credentials?.verificationToken) {
          try {
            const { email, name } = await verifyVerificationToken(credentials.verificationToken as string);
            return { id: email, email, name };
          } catch {
            return null;
          }
        }

        // Normal password login
        const email = credentials?.email as string;
        const password = credentials?.password as string;
        const name = credentials?.name as string;

        if (!email || !password || password.length < 6) return null;

        return {
          id: email,
          email,
          name: name || email.split("@")[0],
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.name = token.name as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
});
