--
-- PostgreSQL database dump
--

\restrict 3GXsCORI0n4E0NftnhDKffFMsED83EBczvdUIh00ftAOrUHc8z0egj2TcFpLvrO

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: checklist_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.checklist_records (
    id integer NOT NULL,
    flight_id character varying(64) NOT NULL,
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


ALTER TABLE public.checklist_records OWNER TO postgres;

--
-- Name: checklist_records_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.checklist_records_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.checklist_records_id_seq OWNER TO postgres;

--
-- Name: checklist_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.checklist_records_id_seq OWNED BY public.checklist_records.id;


--
-- Name: fips; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fips (
    id integer NOT NULL,
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


ALTER TABLE public.fips OWNER TO postgres;

--
-- Name: fips_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.fips_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.fips_id_seq OWNER TO postgres;

--
-- Name: fips_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.fips_id_seq OWNED BY public.fips.id;


--
-- Name: flights; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.flights (
    id character varying(64) NOT NULL,
    flight_no character varying(32) NOT NULL,
    origin character varying(32),
    destination character varying(32),
    departure_time_utc timestamp with time zone,
    landing_time_utc timestamp with time zone,
    flight_date character varying(16),
    status character varying(16) DEFAULT '计划'::character varying,
    aircraft_type character varying(32),
    flight_type character varying(32),
    category character varying(32),
    has_checklist boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.flights OWNER TO postgres;

--
-- Name: fresh_air_cargo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fresh_air_cargo (
    id integer NOT NULL,
    manual_fips_id integer NOT NULL,
    content jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.fresh_air_cargo OWNER TO postgres;

--
-- Name: fresh_air_cargo_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.fresh_air_cargo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.fresh_air_cargo_id_seq OWNER TO postgres;

--
-- Name: fresh_air_cargo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.fresh_air_cargo_id_seq OWNED BY public.fresh_air_cargo.id;


--
-- Name: manual_fips; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.manual_fips (
    id integer NOT NULL,
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


ALTER TABLE public.manual_fips OWNER TO postgres;

--
-- Name: manual_fips_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.manual_fips_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.manual_fips_id_seq OWNER TO postgres;

--
-- Name: manual_fips_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.manual_fips_id_seq OWNED BY public.manual_fips.id;


--
-- Name: checklist_records id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checklist_records ALTER COLUMN id SET DEFAULT nextval('public.checklist_records_id_seq'::regclass);


--
-- Name: fips id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fips ALTER COLUMN id SET DEFAULT nextval('public.fips_id_seq'::regclass);


--
-- Name: fresh_air_cargo id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fresh_air_cargo ALTER COLUMN id SET DEFAULT nextval('public.fresh_air_cargo_id_seq'::regclass);


--
-- Name: manual_fips id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.manual_fips ALTER COLUMN id SET DEFAULT nextval('public.manual_fips_id_seq'::regclass);


--
-- Name: checklist_records checklist_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checklist_records
    ADD CONSTRAINT checklist_records_pkey PRIMARY KEY (id);


--
-- Name: fips fips_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fips
    ADD CONSTRAINT fips_pkey PRIMARY KEY (id);


--
-- Name: flights flights_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flights
    ADD CONSTRAINT flights_pkey PRIMARY KEY (id);


--
-- Name: fresh_air_cargo fresh_air_cargo_manual_fips_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fresh_air_cargo
    ADD CONSTRAINT fresh_air_cargo_manual_fips_id_key UNIQUE (manual_fips_id);


--
-- Name: fresh_air_cargo fresh_air_cargo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fresh_air_cargo
    ADD CONSTRAINT fresh_air_cargo_pkey PRIMARY KEY (id);


--
-- Name: manual_fips manual_fips_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.manual_fips
    ADD CONSTRAINT manual_fips_pkey PRIMARY KEY (id);


--
-- Name: idx_flights_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_flights_date ON public.flights USING btree (flight_date);


--
-- Name: idx_records_flight_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_records_flight_date ON public.checklist_records USING btree (flight_date);


--
-- Name: idx_records_flight_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_records_flight_unique ON public.checklist_records USING btree (flight_id);


--
-- Name: fresh_air_cargo fresh_air_cargo_manual_fips_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fresh_air_cargo
    ADD CONSTRAINT fresh_air_cargo_manual_fips_id_fkey FOREIGN KEY (manual_fips_id) REFERENCES public.manual_fips(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 3GXsCORI0n4E0NftnhDKffFMsED83EBczvdUIh00ftAOrUHc8z0egj2TcFpLvrO

