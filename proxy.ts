export { auth as proxy } from "@/auth";

// Protège toutes les pages sauf la page de connexion, les routes Auth.js et
// les fichiers statiques.
export const config = {
  matcher: ["/((?!api/auth|login|_next/static|_next/image|favicon.ico).*)"],
};
