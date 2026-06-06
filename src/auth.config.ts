import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      
      // Determine route protection
      const isDashboard = nextUrl.pathname.startsWith("/saved") || nextUrl.pathname.startsWith("/compare");
      const isAuthPage = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/register");

      if (isDashboard) {
        if (isLoggedIn) return true;
        // Redirect unauthenticated users to login
        const loginUrl = new URL("/login", nextUrl);
        loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
        return Response.redirect(loginUrl);
      } else if (isAuthPage) {
        if (isLoggedIn) {
          // Redirect already logged-in users away from login/register to dashboard
          return Response.redirect(new URL("/saved", nextUrl));
        }
        return true;
      }
      
      return true;
    },
  },
  providers: [], // Empty array, providers added in auth.ts to keep this edge-compatible
} satisfies NextAuthConfig;
