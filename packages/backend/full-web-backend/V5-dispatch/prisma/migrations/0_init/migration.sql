-- ============================================================
-- 基线迁移 0_init —— flight_dispatch 的初始结构
-- ------------------------------------------------------------
-- 内容 = 线上库 2026-10-03 的真实结构（pg_dump --schema-only 导出，未做手工改写）：
--   7 张表 + 2 个序列 + 13 个索引 + 4 个自定义函数 + pgcrypto 扩展
--
-- ★ 为什么自定义函数必须写在这里：
--   Prisma 只能描述「表 / 列 / 索引 / 约束」，看不懂 PL/pgSQL 函数。
--   而业务代码有 9 处 SQL 在调用它们，所以只能靠迁移文件来建：
--     base_flight_uuid()     —— 剥掉 ecyilang 航班的 '-d' / '-a' 航段后缀
--     flight_no_variants()   —— 航班号等价写法（CSS122 ↔ O3122），配合 && 判同航班
--     try_date()             —— 宽松转日期，脏串返回 NULL 而不抛错
--     resolve_flight_uuid()  —— 由「航班号 + 日期」反查航班 id
--   ⚠️ 以后要改这些函数，请**新增一个迁移目录**（<时间戳>_xxx/migration.sql），
--      不要就地改本文件里已有的函数体 —— 已应用过的迁移不会再执行。
--
-- ★ 两种用法，按库的现状选一种：
--   A. 全新库：pnpm prisma migrate deploy
--        → 建表 + 建函数 + 建索引，一步到位
--   B. 已有库（就是现在这个，表已经在了）：**不要 deploy**，否则会报表已存在。
--        只需把它标记成「已应用」：
--          pnpm prisma migrate resolve --applied 0_init
--        之后再改结构就走 pnpm prisma migrate dev（留历史）或 pnpm db:push（不留历史）。
-- ============================================================

--
-- PostgreSQL database dump
--


-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: base_flight_uuid(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.base_flight_uuid(p text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $_$
    BEGIN
      IF p IS NULL THEN
        RETURN NULL;
      END IF;
      RETURN regexp_replace(btrim(p), '-[da]$', '');
    END;
    $_$;


--
-- Name: flight_no_variants(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.flight_no_variants(p_no text) RETURNS text[]
    LANGUAGE plpgsql STABLE
    AS $_$
    DECLARE
      cs    text;
      pfx   text;
      num   text;
      forms text[];
    BEGIN
      IF p_no IS NULL OR btrim(p_no) = '' THEN
        RETURN ARRAY[]::text[];
      END IF;
      cs := upper(regexp_replace(btrim(p_no), '/.*$', ''));

      pfx := COALESCE((regexp_match(cs, '^([A-Z]{2,3})([0-9]+)$'))[1],
                      (regexp_match(cs, '^([A-Z0-9]{2})([0-9]+)$'))[1]);
      num := COALESCE((regexp_match(cs, '^([A-Z]{2,3})([0-9]+)$'))[2],
                      (regexp_match(cs, '^([A-Z0-9]{2})([0-9]+)$'))[2]);

      IF pfx IS NULL OR num IS NULL THEN
        RETURN ARRAY[cs];
      END IF;

      forms := ARRAY[pfx || num];
      IF to_regclass('airplane_company_name_code') IS NOT NULL THEN
        forms := forms || COALESCE(
          (SELECT ARRAY[upper(airplane_company_iata_code) || num]
             FROM airplane_company_name_code
            WHERE upper(airplane_company_icao_code) = pfx LIMIT 1), ARRAY[]::text[]);
        forms := forms || COALESCE(
          (SELECT ARRAY[upper(airplane_company_icao_code) || num]
             FROM airplane_company_name_code
            WHERE upper(airplane_company_iata_code) = pfx LIMIT 1), ARRAY[]::text[]);
      END IF;

      RETURN (SELECT array_agg(DISTINCT f) FROM unnest(forms) f WHERE f IS NOT NULL AND f <> '');
    END;
    $_$;


--
-- Name: resolve_flight_uuid(text, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.resolve_flight_uuid(p_callsign text, p_day date) RETURNS character varying
    LANGUAGE plpgsql STABLE
    AS $$
    DECLARE
      v text;
    BEGIN
      IF p_callsign IS NULL OR btrim(p_callsign) = '' THEN
        RETURN NULL;
      END IF;
      SELECT fuuid INTO v FROM (
        SELECT e.id::text AS fuuid, 1 AS prio,
               ABS(COALESCE(try_date(e.d_flight_date), try_date(e.a_flight_date), p_day) - p_day) AS dist
          FROM ecyilang e
         WHERE flight_no_variants(COALESCE(e.d_flight_no_full, '')) && flight_no_variants(p_callsign)
            OR flight_no_variants(COALESCE(e.a_flight_no_full, '')) && flight_no_variants(p_callsign)
        UNION ALL
        SELECT f.id::text, 2, ABS(COALESCE(try_date(f.mapped_date), p_day) - p_day)
          FROM fips f
         WHERE flight_no_variants(COALESCE(f.flight_no, '')) && flight_no_variants(p_callsign)
        UNION ALL
        SELECT m.id::text, 3,
               ABS(COALESCE(try_date(LEFT(m.aldt, 10)), try_date(LEFT(m.landing_time, 10)), p_day) - p_day)
          FROM manual_fips m
         WHERE flight_no_variants(COALESCE(m.flight_no, '')) && flight_no_variants(p_callsign)
      ) c
      ORDER BY dist, prio, fuuid
      LIMIT 1;
      RETURN v;
    END;
    $$;


--
-- Name: try_date(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.try_date(p text) RETURNS date
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    BEGIN
      IF p IS NULL OR btrim(p) = '' THEN
        RETURN NULL;
      END IF;
      RETURN btrim(p)::date;
    EXCEPTION WHEN others THEN
      RETURN NULL;
    END;
    $$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: airplane_company_name_code; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.airplane_company_name_code (
    id integer NOT NULL,
    chinese_airplane_company_name character varying(64) CONSTRAINT airplane_company_name_code_chinese_airplane_company_na_not_null NOT NULL,
    airplane_company_iata_code character varying(8),
    airplane_company_icao_code character varying(8)
);


--
-- Name: airplane_company_name_code_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.airplane_company_name_code_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: airplane_company_name_code_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.airplane_company_name_code_id_seq OWNED BY public.airplane_company_name_code.id;


--
-- Name: airport_name_code; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.airport_name_code (
    id integer NOT NULL,
    chinese_airport_name character varying(64) NOT NULL,
    english_airport_name character varying(96),
    airport_iata_code character varying(8),
    airport_icao_code character varying(8)
);


--
-- Name: airport_name_code_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.airport_name_code_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: airport_name_code_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.airport_name_code_id_seq OWNED BY public.airport_name_code.id;


--
-- Name: checklist_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.checklist_records (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    flight_uuid character varying(64) NOT NULL,
    flight_no character varying(32),
    aircraft_type character varying(32),
    checklist_category character varying(32) NOT NULL,
    flight_date character varying(16),
    header jsonb,
    items jsonb,
    video_supervision jsonb,
    inspector character varying(64),
    status character varying(16) DEFAULT 'draft'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: ecyilang; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ecyilang (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    d_flight_type_code character varying(16),
    d_plan_time character varying(16),
    d_jx character varying(16),
    d_flight_date character varying(32),
    d_flight_no_full character varying(32),
    d_country_type character varying(16),
    d_name character varying(64),
    d_craft_seat_code character varying(16),
    d_state_name character varying(32),
    d_time character varying(16),
    d_abnormal_state character varying(16),
    a_flight_type_code character varying(16),
    a_plan_time character varying(16),
    a_jx character varying(16),
    a_flight_date character varying(32),
    a_flight_no_full character varying(32),
    a_country_type character varying(16),
    a_name character varying(64),
    a_craft_seat_code character varying(16),
    a_state_name character varying(32),
    a_time character varying(16),
    a_abnormal_state character varying(16),
    k_h character varying(8),
    created_at timestamp with time zone DEFAULT now(),
    d_name_iata_code character varying(8),
    d_name_icao_code character varying(8),
    a_name_iata_code character varying(8),
    a_name_icao_code character varying(8)
);


--
-- Name: fips; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fips (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task character varying(8),
    flight_no character varying(32),
    origin_station character varying(8),
    dest_station character varying(8),
    landing_station character varying(8),
    in_out_time character varying(19),
    sobt character varying(19),
    eobt character varying(19),
    atot character varying(19),
    sibt character varying(19),
    eldt character varying(19),
    aldt character varying(19),
    corridor character varying(16),
    runway character varying(16),
    stand character varying(16),
    aircraft_type character varying(16),
    source_file character varying(32),
    source_date character varying(16),
    mapped_date character varying(16),
    checklist_category character varying(32),
    checklist_uuid character varying(64)
);


--
-- Name: manual_fips; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.manual_fips (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task character varying(16),
    flight_no character varying(32) NOT NULL,
    origin_station character varying(16),
    dest_station character varying(16),
    landing_station character varying(16),
    in_out_time character varying(32),
    sobt character varying(32),
    eobt character varying(32),
    atot character varying(32),
    sibt character varying(32),
    eldt character varying(32),
    aldt character varying(32),
    corridor character varying(16),
    runway character varying(16),
    stand character varying(16),
    aircraft_type character varying(32),
    landing_time character varying(32),
    checklist_category character varying(32),
    checklist_uuid character varying(64),
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: special_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.special_records (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    flight_uuid character varying(64),
    callsign character varying(32) NOT NULL,
    "belongTime" date NOT NULL,
    "nodesTime" jsonb DEFAULT '{}'::jsonb,
    "createTime" timestamp with time zone DEFAULT now(),
    "updateTime" timestamp with time zone DEFAULT now()
);


--
-- Name: airplane_company_name_code id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.airplane_company_name_code ALTER COLUMN id SET DEFAULT nextval('public.airplane_company_name_code_id_seq'::regclass);


--
-- Name: airport_name_code id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.airport_name_code ALTER COLUMN id SET DEFAULT nextval('public.airport_name_code_id_seq'::regclass);


--
-- Name: airplane_company_name_code airplane_company_name_code_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.airplane_company_name_code
    ADD CONSTRAINT airplane_company_name_code_pkey PRIMARY KEY (id);


--
-- Name: airport_name_code airport_name_code_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.airport_name_code
    ADD CONSTRAINT airport_name_code_pkey PRIMARY KEY (id);


--
-- Name: checklist_records checklist_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checklist_records
    ADD CONSTRAINT checklist_records_pkey PRIMARY KEY (id);


--
-- Name: ecyilang ecyilang_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ecyilang
    ADD CONSTRAINT ecyilang_pkey PRIMARY KEY (id);


--
-- Name: fips fips_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fips
    ADD CONSTRAINT fips_pkey PRIMARY KEY (id);


--
-- Name: manual_fips manual_fips_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manual_fips
    ADD CONSTRAINT manual_fips_pkey PRIMARY KEY (id);


--
-- Name: special_records special_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.special_records
    ADD CONSTRAINT special_records_pkey PRIMARY KEY (id);


--
-- Name: airplane_company_name_code_iata_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX airplane_company_name_code_iata_key ON public.airplane_company_name_code USING btree (airplane_company_iata_code);


--
-- Name: airplane_company_name_code_icao_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX airplane_company_name_code_icao_key ON public.airplane_company_name_code USING btree (airplane_company_icao_code);


--
-- Name: airplane_company_name_code_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX airplane_company_name_code_name_key ON public.airplane_company_name_code USING btree (chinese_airplane_company_name);


--
-- Name: airport_name_code_iata_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX airport_name_code_iata_key ON public.airport_name_code USING btree (airport_iata_code);


--
-- Name: airport_name_code_icao_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX airport_name_code_icao_key ON public.airport_name_code USING btree (airport_icao_code);


--
-- Name: airport_name_code_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX airport_name_code_name_key ON public.airport_name_code USING btree (chinese_airport_name);


--
-- Name: idx_ecyilang_a_flight_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ecyilang_a_flight_date ON public.ecyilang USING btree (a_flight_date);


--
-- Name: idx_ecyilang_d_flight_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ecyilang_d_flight_date ON public.ecyilang USING btree (d_flight_date);


--
-- Name: idx_records_flight_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_records_flight_date ON public.checklist_records USING btree (flight_date);


--
-- Name: idx_records_flight_uuid; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_records_flight_uuid ON public.checklist_records USING btree (flight_uuid);


--
-- Name: idx_special_records_belong_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_special_records_belong_time ON public.special_records USING btree ("belongTime");


--
-- Name: idx_special_records_flight_uuid; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_special_records_flight_uuid ON public.special_records USING btree (flight_uuid);


--
-- Name: special_records_callsign_belong_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX special_records_callsign_belong_key ON public.special_records USING btree (callsign, "belongTime");


--
-- PostgreSQL database dump complete
--


