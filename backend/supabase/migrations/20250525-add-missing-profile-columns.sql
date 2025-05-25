BEGIN;

ALTER TABLE public.profiles
    -- add in one statement so the migration stays transactional
    ADD COLUMN IF NOT EXISTS simp_preference     text,
    ADD COLUMN IF NOT EXISTS preferred_country   text;

COMMIT;