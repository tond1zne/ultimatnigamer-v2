import { withAuth } from "next-auth/middleware";

// Jen první vrstva. Skutečná kontrola práv je znovu na serveru v každé stránce a akci.
export default withAuth({ pages: { signIn: "/login" } });

export const config = { matcher: ["/admin/:path*", "/profile/:path*"] };
