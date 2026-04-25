import { BASE_URL } from "./constant";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import axios from "axios";
import { toast } from "./hooks/use-toast";

function parseJwt(token: string) {
  const [, payload] = token.split(".");
  return JSON.parse(Buffer.from(payload, "base64").toString());
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile",
        },
      },
    }),
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      authorization: {
        url: "https://login.microsoftonline.com/organizations/oauth2/v2.0/authorize",
        params: {
          scope: "openid profile email",
          prompt: "select_account",
        },
      },
      token:
        "https://login.microsoftonline.com/organizations/oauth2/v2.0/token",
      userinfo: "https://graph.microsoft.com/oidc/userinfo",
    }),

    Credentials({
      id: "credentials",
      credentials: {
        token: { type: "string" },
      },
      authorize: async (credentials) => {
        try {
          const user = await axios.get(`${BASE_URL}/me`, {
            headers: {
              Authorization: `Bearer ${credentials.token}`,
            },
          });
          console.log(user.data);

          if (user?.data?.data?.status === "banned") {
            await signOut({ redirect: false });
            toast({
              title: "Account Banned",
              description:
                "Your account has been banned. Please contact support.",
              variant: "destructive",
            });

            return null;
          }

          console.log("user", user.data);

          if (user.status === 200) {
            return {
              id: user.data.data.id,
              name: user.data.data.name,
              email: user.data.data.email,
              role: user.data.data.role,
              token: credentials.token as string,
            };
          } else {
            throw new Error("Invalid credentials");
          }
        } catch (error) {
          console.log("error", error);
          throw new Error("Invalid credentials");
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
  },
});
