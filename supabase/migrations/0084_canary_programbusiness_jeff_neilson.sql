-- Seal two gaps in the watermark canary set:
--   (a) programbusiness.com (entire domain) — the existing exact-match
--       only catches jeffneilson@programbusiness.com. Any other planted
--       name @ programbusiness.com slips through. Use contains mode with
--       the @-anchor so it acts as a domain-level catch-all.
--   (b) Jeff Neilson by name — the existing canary only catches his exact
--       email. A name swap with a new email would slip through.
-- Both spellings (Neilson / Nielson) covered.
--
-- match_mode 'domain' is supported by the TS loader but the table CHECK
-- constraint allows only 'exact' / 'contains' / 'digits_only'. Using
-- 'contains' with a leading "@" anchor produces the same effect since
-- contains-mode strips % and does substring match.

insert into public.data_load_denylist (source, kind, match_mode, pattern, note, active) values
  ('Neilson generic', 'email', 'contains', '@programbusiness.com',
   'Catch-all for any email at programbusiness.com (broader than Jeff''s exact email)',
   true),
  ('Neilson generic', 'contact_name_in_agency', 'contains', 'jeff neilson|',
   'Jeff Neilson at any agency (name-only contains match; trailing pipe matches any agency)',
   true),
  ('Neilson generic', 'contact_name_in_agency', 'contains', 'jeff nielson|',
   'Jeff Nielson (alternate spelling) at any agency',
   true);
