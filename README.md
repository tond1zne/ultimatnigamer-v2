# Ultimátní Gamer

Výzvy ve hrách i v reálu, body, týdenní žebříček, admin schvalování. Next.js 14 + Prisma (PostgreSQL) + NextAuth, bez dalších závislostí.

## 0. NEJDŘÍV: bezpečnostní úklid (udělej před nasazením nové verze)

Pokud jsou nebo byly klíče vidět, musí se vyměnit. Smazání z kódu nestačí, kdokoli je mohl už zkopírovat.

1. **Resend**: https://resend.com/api-keys, starý klíč smaž (Delete), vytvoř nový.
2. **Databáze (Neon/Supabase)**: nejlepší je založit novou databázi a starou smazat. Jinak aspoň resetuj heslo.
3. **NEXTAUTH_SECRET**: vygeneruj nový (tím se odhlásí všichni). PowerShell:
   `[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(48))`
4. **GitHub**: zkontroluj, jestli se někdy necommitnul soubor `.env`. Nejjednodušší je založit NOVÝ soukromý repozitář a nahrát tuhle složku bez staré historie.
5. **Vercel**: v Environment Variables hodnoty vyměň za nové a u tajných zapni "Sensitive". Staré deploymenty s uniklými hodnotami smaž.
6. Soubor `.env` nikdy neposílej v chatu, nefoť ho a necommituj. Jsou v něm klíče od všeho.

## 1. Lokální spuštění (Windows)

```
npm install
copy .env.example .env
```
Otevři `.env` a vyplň ho (návod v souboru). Pak:
```
npx prisma db push
```
Admin účet (heslo si zvol sám, aspoň 12 znaků, žádné výchozí heslo neexistuje). PowerShell:
```
$env:ADMIN_EMAIL="tvuj@email.cz"; $env:ADMIN_PASSWORD="tvoje-dlouhe-heslo"; npm run db:seed
npm run dev
```
Web běží na http://localhost:3000. V `/admin/week` klikni na **Spustit týden**.

## 2. Vercel

Environment Variables: `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (tvoje https doména), `RESEND_API_KEY`, `MAIL_FROM`.
Build Command nech výchozí (`npm run build`), sám vytvoří tabulky v databázi.
Admin účet vytvoříš jednou lokálně příkazem ze sekce 1, s `DATABASE_URL` a `DIRECT_URL` nastavenými na produkční databázi.

## 3. Co je v bezpečnosti jinak

- Hesla bcrypt (cena 12), min. 10 znaků; žádné výchozí admin heslo
- Potvrzovací tokeny v databázi jen jako SHA-256 hash; potvrzení až po kliknutí na tlačítko (ne přes GET)
- Rate limit na přihlášení, registraci, znovuposlání e-mailu a odesílání důkazů
- Odkazy na důkazy: jen https a jen povolené weby (seznam v `src/lib/validate.ts`)
- Role admina se kontroluje v databázi při každé stránce i akci, ne jen v tokenu
- Bezpečnostní hlavičky (CSP, HSTS, frame-ancestors, nosniff...) v `next.config.js`
- Stejná odpověď při registraci a přihlášení, ať účet existuje nebo ne
- E-maily přes Resend API, klíč jen na serveru, nikde se nevypisuje

## 4. Úpravy

- Tým: `src/lib/site.ts` (fotky do `public/team/`)
- Favicon: `public/icon.svg`
- Povolené weby pro důkazy: `src/lib/validate.ts`
