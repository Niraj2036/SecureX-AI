import type { NextAuthConfig, Session } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
  }
}

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export const authConfig = {
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
        token.role = user.role || "employee";
        token.token = user.token || null;
      }

      if (account?.provider === "google") {
        try {
          const res = await fetch(`${backendUrl}/oauth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              accessToken: account.access_token,
              idToken: account.id_token,
            }),
          });
          const data = await res.json();
          if (data?.data) {
            token.token = data.data.token;
            token.id = data.data.user.id;
            token.name = data.data.user.name;
            token.email = data.data.user.email;
            token.role = data.data.user.role;
          }
        } catch (error) {
          console.error("Failed to validate Google token with backend", error);
        }
      }

      if (account?.provider === "microsoft-entra-id") {
        try {
          const res = await fetch(`${backendUrl}/oauth/microsoft`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              accessToken: account.access_token,
              idToken: account.id_token,
              email: token.email,
              name: token.name,
              image: token.image,
            }),
          });
          const data = await res.json();
          if (data?.data) {
            token.token = data.data.token;
            token.id = data.data.user.id;
            token.name = data.data.user.name;
            token.email = data.data.user.email;
            token.role = data.data.user.role;
          }
        } catch (error) {
          console.error("Failed to validate Microsoft token with backend", error);
        }
      }

      return token;
    },

    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        name: token.name as string,
        email: token.email as string,
        image: token.image as string,
        role: token.role as string,
        token: token.token as string,
        emailVerified: null,
      };
      session.accessToken = token.accessToken as string | undefined;
      return session;
    },

    async signIn({ user, account, profile }) {
      if (account?.provider === "credentials") {
        return true;
      }

      if (account?.provider === "google") {
        try {
          if (!profile?.email) {
            throw new Error("No email in Google profile");
          }
          const res = await fetch(`${backendUrl}/oauth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              accessToken: account.access_token,
              idToken: account.id_token,
              email: profile.email,
              name: profile.name,
              image: profile.picture,
            }),
          });
          const data = await res.json();

          if (data?.token) {
            user.token = data.token;
            user.id = data.user.id;
            user.role = data.user.role;
          }

          return true;
        } catch (error) {
          console.error("Google signIn error:", error);
          throw new Error("Google signIn error");
        }
      }

      if (account?.provider === "microsoft-entra-id") {
        try {
          if (!profile?.email) {
            throw new Error("No email in Microsoft profile");
          }

          const res = await fetch(`${backendUrl}/oauth/microsoft`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              accessToken: account.access_token,
              idToken: account.id_token,
              email: profile.email,
              name: profile.name,
              image: profile.picture,
            }),
          });
          const data = await res.json();

          if (data?.token) {
            user.token = data.token;
            user.id = data.user.id;
            user.role = data.user.role;
          }

          return true;
        } catch (error) {
          console.error("Microsoft signIn error:", error);
          throw new Error("Microsoft signIn error");
        }
      }

      return false;
    },

    async redirect({ baseUrl }) {
      return `${baseUrl}/dashboard`;
    },

    authorized({ auth, request: { nextUrl } }) {
      const publicRoutes = [
        "/",
        "/auth/login",
        "/auth/register",
        "/auth/verify-otp",
        "/auth/new-password",
        "/auth/forgot-password",
        "/auth/signup",
        "/auth/otp",
        "/auth/invite",
        "/privacy-policy",
        "/terms-of-service",
        "/.well-known",
        "/.well-known/microsoft-identity-association.json",
      ];
      return publicRoutes.includes(nextUrl.pathname) || !!auth;
    },
  },
  providers: [],
} satisfies NextAuthConfig;