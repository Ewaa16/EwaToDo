import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getUserByEmail, upsertGoogleUser } from "@/lib/db";

if (!process.env.AUTH_SECRET) {
  throw new Error(
    "AUTH_SECRET belum diatur. Salin .env.example ke .env.local lalu isi AUTH_SECRET " +
      "(generate: node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\")."
  );
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  // JWT stateless. maxAge 7 hari (bukan 30) mengurangi jendela penyalahgunaan cookie.
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  // trustHost diperlukan saat self-host non-Vercel / di belakang reverse proxy.
  // Risiko host-header poisoning dimitigasi AUTH_URL yang ditetapkan di env.
  trustHost: true,
  providers: [
    Google,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const user = await getUserByEmail(parsed.data.email);
        if (!user?.password_hash) return null;
        const valid = await bcrypt.compare(
          parsed.data.password,
          user.password_hash
        );
        if (!valid) return null;
        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === "google") {
          const dbUser = await upsertGoogleUser({
            name: user.name ?? "",
            email: user.email ?? "",
            image: user.image,
          });
          token.id = String(dbUser.id);
        } else {
          token.id = user.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },
});
