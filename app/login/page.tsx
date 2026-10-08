import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ERROR_MESSAGES: Record<string, string> = {
  AccessDenied: "Accès réservé aux comptes Google Aive (@aive.com).",
};

function safeRedirect(callbackUrl: string | undefined): string {
  // Auth.js passe une URL absolue : on n'en garde que le chemin, pour ne
  // jamais rediriger vers un autre domaine.
  if (!callbackUrl) return "/";
  try {
    const url = new URL(callbackUrl, "http://paul.local");
    return url.pathname.startsWith("/login") ? "/" : url.pathname + url.search;
  } catch {
    return "/";
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const callbackUrl = safeRedirect(
    typeof params.callbackUrl === "string" ? params.callbackUrl : undefined
  );
  const error = typeof params.error === "string" ? params.error : undefined;

  if ((await auth())?.user) redirect(callbackUrl);

  return (
    <div className="aive-page-bg flex min-h-screen flex-col items-center justify-center gap-8 px-4 py-16">
      <div className="flex items-center gap-2.5">
        <span aria-hidden="true" className="size-7 rounded-lg bg-gradient-aive" />
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">PAUL</h1>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Connexion</CardTitle>
          <CardDescription>
            Paul est réservé aux équipes Aive. Connecte-toi avec ton compte Google Aive.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {ERROR_MESSAGES[error] ?? "La connexion a échoué, réessaie."}
            </p>
          )}
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: callbackUrl });
            }}
          >
            <Button type="submit" className="w-full bg-gradient-aive text-white hover:opacity-90">
              Se connecter avec Google
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
