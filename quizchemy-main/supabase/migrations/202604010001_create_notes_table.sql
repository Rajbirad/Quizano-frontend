-- Create notes table for AI-generated notes
-- Includes indexes and RLS policies (user-owned access + public read + service role access)

CREATE TABLE IF NOT EXISTS public.notes (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          TEXT        NOT NULL,
    title            TEXT,
    document_title   TEXT,
    sections         JSONB       NOT NULL DEFAULT '[]'::jsonb,
    source_type      TEXT        NOT NULL DEFAULT 'text',
    content_source   TEXT,
    is_public        BOOLEAN     NOT NULL DEFAULT false,
    content_length   INTEGER     DEFAULT 0,
    sections_count   INTEGER     DEFAULT 0,
    processing_time  FLOAT,
    correlation_id   TEXT,
    task_id          TEXT,
    metadata         JSONB       DEFAULT '{}'::jsonb,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notes_user_id_idx        ON public.notes (user_id);
CREATE INDEX IF NOT EXISTS notes_task_id_idx        ON public.notes (task_id);
CREATE INDEX IF NOT EXISTS notes_correlation_id_idx ON public.notes (correlation_id);
CREATE INDEX IF NOT EXISTS notes_created_at_idx     ON public.notes (created_at DESC);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'notes'
          AND policyname = 'notes_select_own'
    ) THEN
        CREATE POLICY notes_select_own
            ON public.notes FOR SELECT
            USING (auth.uid()::text = user_id OR is_public = true);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'notes'
          AND policyname = 'notes_insert_own'
    ) THEN
        CREATE POLICY notes_insert_own
            ON public.notes FOR INSERT
            WITH CHECK (auth.uid()::text = user_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'notes'
          AND policyname = 'notes_update_own'
    ) THEN
        CREATE POLICY notes_update_own
            ON public.notes FOR UPDATE
            USING (auth.uid()::text = user_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'notes'
          AND policyname = 'notes_delete_own'
    ) THEN
        CREATE POLICY notes_delete_own
            ON public.notes FOR DELETE
            USING (auth.uid()::text = user_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'notes'
          AND policyname = 'notes_service_role_all'
    ) THEN
        CREATE POLICY notes_service_role_all
            ON public.notes FOR ALL
            USING (auth.role() = 'service_role');
    END IF;
END $$;
