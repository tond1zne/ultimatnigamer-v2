import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { getSettings } from "@/lib/settings";
import { mailConfigured } from "@/lib/mail";
import { toggleAdminNotifications } from "@/actions/admin";

export const metadata: Metadata = { title: "Nastavení" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireAdmin();
  const settings = await getSettings();
  const admins = await prisma.user.count({ where: { role: "ADMIN" } });

  return (
    <>
      <h1 className="font-display text-4xl leading-none sm:text-5xl">Nastavení</h1>
      <section className="panel panel-frame flex flex-col gap-5 p-6 sm:p-8">
        <div>
          <h2 className="font-display text-3xl leading-none">E-maily o nových důkazech</h2>
          <p className="mt-2 max-w-lg text-ash">
            Když je to zapnuté, každý nový důkaz pošle e-mail všem adminům ({admins}).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`tag ${settings.notifyAdminOnSubmission ? "tag-ink" : ""}`}>
            {settings.notifyAdminOnSubmission ? "Zapnuto" : "Vypnuto"}
          </span>
          <form action={toggleAdminNotifications}>
            <input type="hidden" name="enabled" value={String(!settings.notifyAdminOnSubmission)} />
            <button className="btn btn-sm" type="submit">{settings.notifyAdminOnSubmission ? "Vypnout" : "Zapnout"}</button>
          </form>
        </div>
        {!mailConfigured() && (
          <p className="border-[3px] border-ink bg-fog p-3 font-bold">
            Odesílání e-mailů není nastavené na serveru, takže se nic neodešle. Chybí RESEND_API_KEY nebo MAIL_FROM.
          </p>
        )}
      </section>
    </>
  );
}
