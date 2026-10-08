import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// Seuls les comptes Google Workspace de l'organisation Aive peuvent accéder à
// Paul. `hd` filtre l'écran de choix de compte côté Google, mais il se
// contourne facilement : la vraie vérification est faite dans `signIn`.
export const AIVE_DOMAIN = "aive.com";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      authorization: { params: { hd: AIVE_DOMAIN, prompt: "select_account" } },
    }),
  ],
  pages: { signIn: "/login", error: "/login" },
  callbacks: {
    signIn({ account, profile }) {
      if (account?.provider !== "google" || !profile) return false;
      return (
        profile.email_verified === true &&
        profile.hd === AIVE_DOMAIN &&
        typeof profile.email === "string" &&
        profile.email.toLowerCase().endsWith(`@${AIVE_DOMAIN}`)
      );
    },
    // Utilisé par proxy.ts : toute page sans session redirige vers /login.
    authorized({ auth }) {
      return !!auth?.user;
    },
  },
});
