# Privacy & compliance risk register

Status: **open — needs review by the pharmacy's privacy/compliance officer.**
This is an engineering inventory of where personal and potentially
health-related data flows today. It is not legal advice. No workflow was
changed to produce it; recommendations below are options for after review.

Legend: 🔴 high · 🟠 medium · 🟢 low / informational

## Data flows today

| Flow | Data | Leaves our systems via | Stored |
|---|---|---|---|
| Refill form (`/api/refill`) | name, phone, optional free-text message (≤200 chars) | **Resend** (email API) → `PHARMACY_EMAIL` inbox | only in the email |
| Order request (`/api/orders`, disabled) | name, phone, optional email, delivery address, notes, OTC items | Resend → `PHARMACY_EMAIL`; Supabase once `create_order()` is applied | email; Supabase `orders` (after migration) |
| Customer confirmation (off) | name, OTC items, totals | Resend → customer's inbox | — |
| WhatsApp / phone links | whatever the customer writes | WhatsApp (Meta), phone carrier | outside our systems |
| Contact map | visitor IP / browser info | Google Maps iframe | Google |
| Cart | product ids, names, prices | — | visitor's browser (localStorage) |
| Admin | staff email + session tokens | Supabase Auth | httpOnly cookies |

## Risks

1. 🔴 **Refill requests are likely PHI and travel by email through third
   parties.** A refill request ties an identifiable person to being a
   patient of the pharmacy. It is sent via Resend to an email inbox.
   *Confirm:* whether Resend offers and has signed a Business Associate
   Agreement (BAA), and whether the destination mailbox is covered by one.

2. 🔴 **Fallback destination is a consumer Gmail address.** If
   `PHARMACY_EMAIL` is not set, both `/api/refill` and `/api/orders` send to
   a hard-coded `@gmail.com` address (`app/api/refill/route.ts`,
   `app/api/orders/route.ts`). Consumer Gmail accounts cannot be covered by a
   Google BAA (Google Workspace accounts can). *Confirm* `PHARMACY_EMAIL` is
   set in every Vercel environment and which account type it is. The fallback
   was left in place so the live refill workflow is not disrupted.

3. 🟠 **Free-text refill message may contain health information** despite the
   on-screen warning ("No incluyas números de receta ni información
   médica"). It is emailed verbatim (HTML-escaped).

4. 🟠 **Order emails can be health-revealing.** OTC items (e.g. pregnancy
   tests, specific medicines) with a name and address may be sensitive even
   without a prescription. Same BAA question as (1) once orders are enabled.

5. 🟠 **Customer confirmation emails** would send the item list to the
   customer's own inbox through Resend. Built but **off**
   (`CUSTOMER_EMAILS_ENABLED`); keep off until reviewed.

6. 🟠 **Hosting/database agreements.** Once orders are stored in Supabase and
   served by Vercel, confirm whether BAAs are needed and available for the
   plans in use (both vendors offer HIPAA programs on specific plans).

7. 🟠 **No retention policy** for refill emails, order records or status
   history. Decide how long each is kept and who can access it.

8. 🟢 **WhatsApp** is offered for questions. Customers may volunteer health
   details there; consider a short notice next to WhatsApp links.

9. 🟢 **Google Maps embed** loads Google content on the contact section;
   mention it in the privacy page or load the map only on click.

10. 🟢 **Logs.** Server logs record only error names, HTTP statuses and order
    references — no names, phones, emails, addresses or messages (verified in
    code review). Keep it that way.

11. 🟢 **Rate limiting** keeps phone numbers (digits only) in server memory for
    up to one hour to limit abuse; never logged or persisted.

12. 🟢 **Privacy page** (`/privacidad`) and **terms** should be reviewed
    against the flows above by the compliance officer (already listed in the
    README checklist).

## Options after review (not implemented)

- Send staff a **notification without content** ("Nueva solicitud de refill —
  ver en el panel") and keep the details in Supabase behind admin RLS, once
  a BAA covers Supabase. Requires a new table and admin screen.
- Remove the refill free-text field, or replace it with fixed choices
  (e.g. "Prefiero recogido / delivery").
- Remove the Gmail fallback so a missing `PHARMACY_EMAIL` fails closed (503)
  instead of sending to a consumer inbox — only after confirming the variable
  is set in production.
- Keep `CUSTOMER_EMAILS_ENABLED=false` until (4)–(5) are resolved.
