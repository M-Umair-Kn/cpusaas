--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

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
-- Name: process_sets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.process_sets (
    process_set_id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    name character varying(100) NOT NULL,
    created_date timestamp without time zone DEFAULT now()
);


--
-- Name: processes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.processes (
    process_id uuid DEFAULT gen_random_uuid() NOT NULL,
    process_set_id uuid,
    pid character varying(10) NOT NULL,
    arrival_time integer NOT NULL,
    burst_time integer NOT NULL,
    priority integer,
    CONSTRAINT processes_arrival_time_check CHECK ((arrival_time >= 0)),
    CONSTRAINT processes_burst_time_check CHECK ((burst_time > 0))
);


--
-- Name: simulations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.simulations (
    simulation_id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    process_set_id uuid,
    algorithm character varying(50) NOT NULL,
    time_quantum integer,
    gantt_data json,
    metrics json
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    user_id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    registration_date timestamp without time zone DEFAULT now()
);


--
-- Data for Name: process_sets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.process_sets (process_set_id, user_id, name, created_date) FROM stdin;
09d01f22-d00f-4df7-8115-0db5b0bf744c	677b5b5f-d3e7-47b6-a93c-e81317be3f97	testProcessSet01	2025-03-13 20:55:36.380499
\.


--
-- Data for Name: processes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.processes (process_id, process_set_id, pid, arrival_time, burst_time, priority) FROM stdin;
6d44fa74-129a-4f48-a3bb-892472596a34	09d01f22-d00f-4df7-8115-0db5b0bf744c	1	0	80	\N
006c81c0-1adb-47c6-8110-5f58399b3d16	09d01f22-d00f-4df7-8115-0db5b0bf744c	2	20	60	\N
e0069ba7-a1be-49ea-9a8c-0378a32a6be9	09d01f22-d00f-4df7-8115-0db5b0bf744c	3	40	65	\N
2bef596c-6ad1-4d28-93f6-ed48ee538bfe	09d01f22-d00f-4df7-8115-0db5b0bf744c	4	60	120	\N
ea6a7008-d712-40d8-b286-0abc07af2492	09d01f22-d00f-4df7-8115-0db5b0bf744c	5	80	30	\N
770e5cb5-6ba3-4ee9-b1d6-16714b994fb7	09d01f22-d00f-4df7-8115-0db5b0bf744c	6	90	90	\N
935c7fc1-bbf0-4733-9051-e54d2a02fb74	09d01f22-d00f-4df7-8115-0db5b0bf744c	7	120	25	\N
a7eb119c-d834-4dfa-becd-0d030a9ef817	09d01f22-d00f-4df7-8115-0db5b0bf744c	8	240	40	\N
79c44bc6-8c9d-40d6-9517-70f889b0fabc	09d01f22-d00f-4df7-8115-0db5b0bf744c	9	260	90	\N
307ce5d2-9725-4b51-827e-211a8b9a2c58	09d01f22-d00f-4df7-8115-0db5b0bf744c	10	380	75	\N
\.


--
-- Data for Name: simulations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.simulations (simulation_id, user_id, process_set_id, algorithm, time_quantum, gantt_data, metrics) FROM stdin;
9772ef93-bc8d-42b9-a30a-23181b322e10	677b5b5f-d3e7-47b6-a93c-e81317be3f97	09d01f22-d00f-4df7-8115-0db5b0bf744c	FCFS	\N	[{"pid":"1","start":0,"end":80},{"pid":"2","start":80,"end":140},{"pid":"3","start":140,"end":205},{"pid":"4","start":205,"end":325},{"pid":"5","start":325,"end":355},{"pid":"6","start":355,"end":445},{"pid":"7","start":445,"end":470},{"pid":"8","start":470,"end":510},{"pid":"9","start":510,"end":600},{"pid":"10","start":600,"end":675}]	{"averageWaitingTime":184,"averageTurnaroundTime":251.5,"averageResponseTime":184,"processMetrics":{"1":{"waitingTime":0,"turnaroundTime":80,"responseTime":0},"2":{"waitingTime":60,"turnaroundTime":120,"responseTime":60},"3":{"waitingTime":100,"turnaroundTime":165,"responseTime":100},"4":{"waitingTime":145,"turnaroundTime":265,"responseTime":145},"5":{"waitingTime":245,"turnaroundTime":275,"responseTime":245},"6":{"waitingTime":265,"turnaroundTime":355,"responseTime":265},"7":{"waitingTime":325,"turnaroundTime":350,"responseTime":325},"8":{"waitingTime":230,"turnaroundTime":270,"responseTime":230},"9":{"waitingTime":250,"turnaroundTime":340,"responseTime":250},"10":{"waitingTime":220,"turnaroundTime":295,"responseTime":220}}}
26ec09c9-782b-4cca-b5fb-5278bf3f6d36	677b5b5f-d3e7-47b6-a93c-e81317be3f97	09d01f22-d00f-4df7-8115-0db5b0bf744c	FCFS	\N	[{"pid":"1","start":0,"end":80},{"pid":"2","start":80,"end":140},{"pid":"3","start":140,"end":205},{"pid":"4","start":205,"end":325},{"pid":"5","start":325,"end":355},{"pid":"6","start":355,"end":445},{"pid":"7","start":445,"end":470},{"pid":"8","start":470,"end":510},{"pid":"9","start":510,"end":600},{"pid":"10","start":600,"end":675}]	{"averageWaitingTime":184,"averageTurnaroundTime":251.5,"averageResponseTime":184,"processMetrics":{"1":{"waitingTime":0,"turnaroundTime":80,"responseTime":0},"2":{"waitingTime":60,"turnaroundTime":120,"responseTime":60},"3":{"waitingTime":100,"turnaroundTime":165,"responseTime":100},"4":{"waitingTime":145,"turnaroundTime":265,"responseTime":145},"5":{"waitingTime":245,"turnaroundTime":275,"responseTime":245},"6":{"waitingTime":265,"turnaroundTime":355,"responseTime":265},"7":{"waitingTime":325,"turnaroundTime":350,"responseTime":325},"8":{"waitingTime":230,"turnaroundTime":270,"responseTime":230},"9":{"waitingTime":250,"turnaroundTime":340,"responseTime":250},"10":{"waitingTime":220,"turnaroundTime":295,"responseTime":220}}}
359b706c-a818-46c1-a238-04ae435c28f0	677b5b5f-d3e7-47b6-a93c-e81317be3f97	09d01f22-d00f-4df7-8115-0db5b0bf744c	FCFS	\N	[{"pid":"1","start":0,"end":80},{"pid":"2","start":80,"end":140},{"pid":"3","start":140,"end":205},{"pid":"4","start":205,"end":325},{"pid":"5","start":325,"end":355},{"pid":"6","start":355,"end":445},{"pid":"7","start":445,"end":470},{"pid":"8","start":470,"end":510},{"pid":"9","start":510,"end":600},{"pid":"10","start":600,"end":675}]	{"averageWaitingTime":184,"averageTurnaroundTime":251.5,"averageResponseTime":184,"processMetrics":{"1":{"waitingTime":0,"turnaroundTime":80,"responseTime":0},"2":{"waitingTime":60,"turnaroundTime":120,"responseTime":60},"3":{"waitingTime":100,"turnaroundTime":165,"responseTime":100},"4":{"waitingTime":145,"turnaroundTime":265,"responseTime":145},"5":{"waitingTime":245,"turnaroundTime":275,"responseTime":245},"6":{"waitingTime":265,"turnaroundTime":355,"responseTime":265},"7":{"waitingTime":325,"turnaroundTime":350,"responseTime":325},"8":{"waitingTime":230,"turnaroundTime":270,"responseTime":230},"9":{"waitingTime":250,"turnaroundTime":340,"responseTime":250},"10":{"waitingTime":220,"turnaroundTime":295,"responseTime":220}}}
40ea256a-64fe-4f4c-838c-df0b8b9644ab	677b5b5f-d3e7-47b6-a93c-e81317be3f97	09d01f22-d00f-4df7-8115-0db5b0bf744c	FCFS	\N	[{"pid":"1","start":0,"end":80},{"pid":"2","start":80,"end":140},{"pid":"3","start":140,"end":205},{"pid":"4","start":205,"end":325},{"pid":"5","start":325,"end":355},{"pid":"6","start":355,"end":445},{"pid":"7","start":445,"end":470},{"pid":"8","start":470,"end":510},{"pid":"9","start":510,"end":600},{"pid":"10","start":600,"end":675}]	{"averageWaitingTime":184,"averageTurnaroundTime":251.5,"averageResponseTime":184,"processMetrics":{"1":{"waitingTime":0,"turnaroundTime":80,"responseTime":0},"2":{"waitingTime":60,"turnaroundTime":120,"responseTime":60},"3":{"waitingTime":100,"turnaroundTime":165,"responseTime":100},"4":{"waitingTime":145,"turnaroundTime":265,"responseTime":145},"5":{"waitingTime":245,"turnaroundTime":275,"responseTime":245},"6":{"waitingTime":265,"turnaroundTime":355,"responseTime":265},"7":{"waitingTime":325,"turnaroundTime":350,"responseTime":325},"8":{"waitingTime":230,"turnaroundTime":270,"responseTime":230},"9":{"waitingTime":250,"turnaroundTime":340,"responseTime":250},"10":{"waitingTime":220,"turnaroundTime":295,"responseTime":220}}}
662cf142-99a4-458e-872d-cfdf66b41382	677b5b5f-d3e7-47b6-a93c-e81317be3f97	09d01f22-d00f-4df7-8115-0db5b0bf744c	FCFS	\N	[{"pid":"1","start":0,"end":80},{"pid":"2","start":80,"end":140},{"pid":"3","start":140,"end":205},{"pid":"4","start":205,"end":325},{"pid":"5","start":325,"end":355},{"pid":"6","start":355,"end":445},{"pid":"7","start":445,"end":470},{"pid":"8","start":470,"end":510},{"pid":"9","start":510,"end":600},{"pid":"10","start":600,"end":675}]	{"averageWaitingTime":184,"averageTurnaroundTime":251.5,"averageResponseTime":184,"processMetrics":{"1":{"waitingTime":0,"turnaroundTime":80,"responseTime":0},"2":{"waitingTime":60,"turnaroundTime":120,"responseTime":60},"3":{"waitingTime":100,"turnaroundTime":165,"responseTime":100},"4":{"waitingTime":145,"turnaroundTime":265,"responseTime":145},"5":{"waitingTime":245,"turnaroundTime":275,"responseTime":245},"6":{"waitingTime":265,"turnaroundTime":355,"responseTime":265},"7":{"waitingTime":325,"turnaroundTime":350,"responseTime":325},"8":{"waitingTime":230,"turnaroundTime":270,"responseTime":230},"9":{"waitingTime":250,"turnaroundTime":340,"responseTime":250},"10":{"waitingTime":220,"turnaroundTime":295,"responseTime":220}}}
55474d16-3ac6-42bc-88c7-0e67279f8903	677b5b5f-d3e7-47b6-a93c-e81317be3f97	09d01f22-d00f-4df7-8115-0db5b0bf744c	FCFS	\N	[{"pid":"1","start":0,"end":80},{"pid":"2","start":80,"end":140},{"pid":"3","start":140,"end":205},{"pid":"4","start":205,"end":325},{"pid":"5","start":325,"end":355},{"pid":"6","start":355,"end":445},{"pid":"7","start":445,"end":470},{"pid":"8","start":470,"end":510},{"pid":"9","start":510,"end":600},{"pid":"10","start":600,"end":675}]	{"averageWaitingTime":184,"averageTurnaroundTime":251.5,"averageResponseTime":184,"processMetrics":{"1":{"waitingTime":0,"turnaroundTime":80,"responseTime":0},"2":{"waitingTime":60,"turnaroundTime":120,"responseTime":60},"3":{"waitingTime":100,"turnaroundTime":165,"responseTime":100},"4":{"waitingTime":145,"turnaroundTime":265,"responseTime":145},"5":{"waitingTime":245,"turnaroundTime":275,"responseTime":245},"6":{"waitingTime":265,"turnaroundTime":355,"responseTime":265},"7":{"waitingTime":325,"turnaroundTime":350,"responseTime":325},"8":{"waitingTime":230,"turnaroundTime":270,"responseTime":230},"9":{"waitingTime":250,"turnaroundTime":340,"responseTime":250},"10":{"waitingTime":220,"turnaroundTime":295,"responseTime":220}}}
39491c62-1b24-4fb3-9062-2576b752cb71	677b5b5f-d3e7-47b6-a93c-e81317be3f97	09d01f22-d00f-4df7-8115-0db5b0bf744c	FCFS	\N	[{"pid":"1","start":0,"end":80},{"pid":"2","start":80,"end":140},{"pid":"3","start":140,"end":205},{"pid":"4","start":205,"end":325},{"pid":"5","start":325,"end":355},{"pid":"6","start":355,"end":445},{"pid":"7","start":445,"end":470},{"pid":"8","start":470,"end":510},{"pid":"9","start":510,"end":600},{"pid":"10","start":600,"end":675}]	{"averageWaitingTime":184,"averageTurnaroundTime":251.5,"averageResponseTime":184,"processMetrics":{"1":{"waitingTime":0,"turnaroundTime":80,"responseTime":0},"2":{"waitingTime":60,"turnaroundTime":120,"responseTime":60},"3":{"waitingTime":100,"turnaroundTime":165,"responseTime":100},"4":{"waitingTime":145,"turnaroundTime":265,"responseTime":145},"5":{"waitingTime":245,"turnaroundTime":275,"responseTime":245},"6":{"waitingTime":265,"turnaroundTime":355,"responseTime":265},"7":{"waitingTime":325,"turnaroundTime":350,"responseTime":325},"8":{"waitingTime":230,"turnaroundTime":270,"responseTime":230},"9":{"waitingTime":250,"turnaroundTime":340,"responseTime":250},"10":{"waitingTime":220,"turnaroundTime":295,"responseTime":220}}}
95fe3410-bd6c-4b49-9b3f-0ef551e4f8c5	677b5b5f-d3e7-47b6-a93c-e81317be3f97	09d01f22-d00f-4df7-8115-0db5b0bf744c	FCFS	\N	[{"pid":"1","start":0,"end":80},{"pid":"2","start":80,"end":140},{"pid":"3","start":140,"end":205},{"pid":"4","start":205,"end":325},{"pid":"5","start":325,"end":355},{"pid":"6","start":355,"end":445},{"pid":"7","start":445,"end":470},{"pid":"8","start":470,"end":510},{"pid":"9","start":510,"end":600},{"pid":"10","start":600,"end":675}]	{"averageWaitingTime":184,"averageTurnaroundTime":251.5,"averageResponseTime":184,"processMetrics":{"1":{"waitingTime":0,"turnaroundTime":80,"responseTime":0},"2":{"waitingTime":60,"turnaroundTime":120,"responseTime":60},"3":{"waitingTime":100,"turnaroundTime":165,"responseTime":100},"4":{"waitingTime":145,"turnaroundTime":265,"responseTime":145},"5":{"waitingTime":245,"turnaroundTime":275,"responseTime":245},"6":{"waitingTime":265,"turnaroundTime":355,"responseTime":265},"7":{"waitingTime":325,"turnaroundTime":350,"responseTime":325},"8":{"waitingTime":230,"turnaroundTime":270,"responseTime":230},"9":{"waitingTime":250,"turnaroundTime":340,"responseTime":250},"10":{"waitingTime":220,"turnaroundTime":295,"responseTime":220}}}
346776a7-289f-41f3-b7c5-1e2bf9008e04	677b5b5f-d3e7-47b6-a93c-e81317be3f97	09d01f22-d00f-4df7-8115-0db5b0bf744c	FCFS	\N	[{"pid":"1","start":0,"end":80},{"pid":"5","start":80,"end":110},{"pid":"6","start":110,"end":200},{"pid":"7","start":200,"end":225},{"pid":"8","start":240,"end":280},{"pid":"9","start":280,"end":370}]	{"averageWaitingTime":20,"averageTurnaroundTime":79.16666666666667,"averageResponseTime":20,"processMetrics":{"1":{"waitingTime":0,"turnaroundTime":80,"responseTime":0},"5":{"waitingTime":0,"turnaroundTime":30,"responseTime":0},"6":{"waitingTime":20,"turnaroundTime":110,"responseTime":20},"7":{"waitingTime":80,"turnaroundTime":105,"responseTime":80},"8":{"waitingTime":0,"turnaroundTime":40,"responseTime":0},"9":{"waitingTime":20,"turnaroundTime":110,"responseTime":20}}}
5dec9584-973d-4905-a853-6d6025876495	677b5b5f-d3e7-47b6-a93c-e81317be3f97	09d01f22-d00f-4df7-8115-0db5b0bf744c	FCFS	\N	[{"pid":"1","start":0,"end":80},{"pid":"2","start":80,"end":140},{"pid":"3","start":140,"end":205},{"pid":"4","start":205,"end":325},{"pid":"5","start":325,"end":355},{"pid":"6","start":355,"end":445},{"pid":"7","start":445,"end":470},{"pid":"8","start":470,"end":510},{"pid":"9","start":510,"end":600},{"pid":"10","start":600,"end":675}]	{"averageWaitingTime":184,"averageTurnaroundTime":251.5,"averageResponseTime":184,"processMetrics":{"1":{"waitingTime":0,"turnaroundTime":80,"responseTime":0},"2":{"waitingTime":60,"turnaroundTime":120,"responseTime":60},"3":{"waitingTime":100,"turnaroundTime":165,"responseTime":100},"4":{"waitingTime":145,"turnaroundTime":265,"responseTime":145},"5":{"waitingTime":245,"turnaroundTime":275,"responseTime":245},"6":{"waitingTime":265,"turnaroundTime":355,"responseTime":265},"7":{"waitingTime":325,"turnaroundTime":350,"responseTime":325},"8":{"waitingTime":230,"turnaroundTime":270,"responseTime":230},"9":{"waitingTime":250,"turnaroundTime":340,"responseTime":250},"10":{"waitingTime":220,"turnaroundTime":295,"responseTime":220}}}
7bafe7ca-bada-4a70-a4d4-eb070f5706b3	677b5b5f-d3e7-47b6-a93c-e81317be3f97	09d01f22-d00f-4df7-8115-0db5b0bf744c	FCFS	\N	[{"pid":"1","start":0,"end":80},{"pid":"2","start":80,"end":140},{"pid":"3","start":140,"end":205},{"pid":"4","start":205,"end":325},{"pid":"5","start":325,"end":355},{"pid":"6","start":355,"end":445},{"pid":"7","start":445,"end":470},{"pid":"8","start":470,"end":510},{"pid":"9","start":510,"end":600},{"pid":"10","start":600,"end":675}]	{"averageWaitingTime":184,"averageTurnaroundTime":251.5,"averageResponseTime":184,"processMetrics":{"1":{"waitingTime":0,"turnaroundTime":80,"responseTime":0},"2":{"waitingTime":60,"turnaroundTime":120,"responseTime":60},"3":{"waitingTime":100,"turnaroundTime":165,"responseTime":100},"4":{"waitingTime":145,"turnaroundTime":265,"responseTime":145},"5":{"waitingTime":245,"turnaroundTime":275,"responseTime":245},"6":{"waitingTime":265,"turnaroundTime":355,"responseTime":265},"7":{"waitingTime":325,"turnaroundTime":350,"responseTime":325},"8":{"waitingTime":230,"turnaroundTime":270,"responseTime":230},"9":{"waitingTime":250,"turnaroundTime":340,"responseTime":250},"10":{"waitingTime":220,"turnaroundTime":295,"responseTime":220}}}
3e1d900f-e0ef-4130-b04e-fbe130479ae8	677b5b5f-d3e7-47b6-a93c-e81317be3f97	09d01f22-d00f-4df7-8115-0db5b0bf744c	FCFS	\N	[{"pid":"1","start":0,"end":80},{"pid":"2","start":80,"end":140},{"pid":"3","start":140,"end":205},{"pid":"4","start":205,"end":325},{"pid":"5","start":325,"end":355},{"pid":"6","start":355,"end":445},{"pid":"7","start":445,"end":470},{"pid":"8","start":470,"end":510},{"pid":"9","start":510,"end":600},{"pid":"10","start":600,"end":675}]	{"averageWaitingTime":184,"averageTurnaroundTime":251.5,"averageResponseTime":184,"processMetrics":{"1":{"waitingTime":0,"turnaroundTime":80,"responseTime":0},"2":{"waitingTime":60,"turnaroundTime":120,"responseTime":60},"3":{"waitingTime":100,"turnaroundTime":165,"responseTime":100},"4":{"waitingTime":145,"turnaroundTime":265,"responseTime":145},"5":{"waitingTime":245,"turnaroundTime":275,"responseTime":245},"6":{"waitingTime":265,"turnaroundTime":355,"responseTime":265},"7":{"waitingTime":325,"turnaroundTime":350,"responseTime":325},"8":{"waitingTime":230,"turnaroundTime":270,"responseTime":230},"9":{"waitingTime":250,"turnaroundTime":340,"responseTime":250},"10":{"waitingTime":220,"turnaroundTime":295,"responseTime":220}}}
621e663f-d885-4ef0-b88b-5e845c69c61a	677b5b5f-d3e7-47b6-a93c-e81317be3f97	09d01f22-d00f-4df7-8115-0db5b0bf744c	FCFS	\N	[{"pid":"1","start":0,"end":80},{"pid":"2","start":80,"end":140},{"pid":"3","start":140,"end":205},{"pid":"4","start":205,"end":325},{"pid":"5","start":325,"end":355},{"pid":"6","start":355,"end":445},{"pid":"7","start":445,"end":470},{"pid":"8","start":470,"end":510},{"pid":"9","start":510,"end":600},{"pid":"10","start":600,"end":675}]	{"averageWaitingTime":184,"averageTurnaroundTime":251.5,"averageResponseTime":184,"processMetrics":{"1":{"waitingTime":0,"turnaroundTime":80,"responseTime":0},"2":{"waitingTime":60,"turnaroundTime":120,"responseTime":60},"3":{"waitingTime":100,"turnaroundTime":165,"responseTime":100},"4":{"waitingTime":145,"turnaroundTime":265,"responseTime":145},"5":{"waitingTime":245,"turnaroundTime":275,"responseTime":245},"6":{"waitingTime":265,"turnaroundTime":355,"responseTime":265},"7":{"waitingTime":325,"turnaroundTime":350,"responseTime":325},"8":{"waitingTime":230,"turnaroundTime":270,"responseTime":230},"9":{"waitingTime":250,"turnaroundTime":340,"responseTime":250},"10":{"waitingTime":220,"turnaroundTime":295,"responseTime":220}}}
24748c54-5e47-48e6-8efd-efa16ff1a7bd	677b5b5f-d3e7-47b6-a93c-e81317be3f97	09d01f22-d00f-4df7-8115-0db5b0bf744c	FCFS	\N	[{"pid":"1","start":0,"end":80},{"pid":"2","start":80,"end":140},{"pid":"3","start":140,"end":205},{"pid":"4","start":205,"end":325},{"pid":"5","start":325,"end":355},{"pid":"6","start":355,"end":445},{"pid":"7","start":445,"end":470},{"pid":"8","start":470,"end":510},{"pid":"9","start":510,"end":600},{"pid":"10","start":600,"end":675}]	{"averageWaitingTime":184,"averageTurnaroundTime":251.5,"averageResponseTime":184,"processMetrics":{"1":{"waitingTime":0,"turnaroundTime":80,"responseTime":0},"2":{"waitingTime":60,"turnaroundTime":120,"responseTime":60},"3":{"waitingTime":100,"turnaroundTime":165,"responseTime":100},"4":{"waitingTime":145,"turnaroundTime":265,"responseTime":145},"5":{"waitingTime":245,"turnaroundTime":275,"responseTime":245},"6":{"waitingTime":265,"turnaroundTime":355,"responseTime":265},"7":{"waitingTime":325,"turnaroundTime":350,"responseTime":325},"8":{"waitingTime":230,"turnaroundTime":270,"responseTime":230},"9":{"waitingTime":250,"turnaroundTime":340,"responseTime":250},"10":{"waitingTime":220,"turnaroundTime":295,"responseTime":220}}}
01a177f9-a2e8-4058-a4ab-bdc5b63e4132	677b5b5f-d3e7-47b6-a93c-e81317be3f97	09d01f22-d00f-4df7-8115-0db5b0bf744c	FCFS	\N	[{"pid":"1","start":0,"end":80},{"pid":"2","start":80,"end":140},{"pid":"3","start":140,"end":205},{"pid":"4","start":205,"end":325},{"pid":"5","start":325,"end":355},{"pid":"6","start":355,"end":445},{"pid":"7","start":445,"end":470},{"pid":"8","start":470,"end":510},{"pid":"9","start":510,"end":600},{"pid":"10","start":600,"end":675}]	{"averageWaitingTime":184,"averageTurnaroundTime":251.5,"averageResponseTime":184,"processMetrics":{"1":{"waitingTime":0,"turnaroundTime":80,"responseTime":0},"2":{"waitingTime":60,"turnaroundTime":120,"responseTime":60},"3":{"waitingTime":100,"turnaroundTime":165,"responseTime":100},"4":{"waitingTime":145,"turnaroundTime":265,"responseTime":145},"5":{"waitingTime":245,"turnaroundTime":275,"responseTime":245},"6":{"waitingTime":265,"turnaroundTime":355,"responseTime":265},"7":{"waitingTime":325,"turnaroundTime":350,"responseTime":325},"8":{"waitingTime":230,"turnaroundTime":270,"responseTime":230},"9":{"waitingTime":250,"turnaroundTime":340,"responseTime":250},"10":{"waitingTime":220,"turnaroundTime":295,"responseTime":220}}}
4cad19f4-26ab-49fd-8281-c84311e7f5f5	677b5b5f-d3e7-47b6-a93c-e81317be3f97	09d01f22-d00f-4df7-8115-0db5b0bf744c	FCFS	\N	[{"pid":"1","start":0,"end":80},{"pid":"2","start":80,"end":140},{"pid":"5","start":140,"end":170},{"pid":"6","start":170,"end":260},{"pid":"7","start":260,"end":285},{"pid":"8","start":285,"end":325},{"pid":"9","start":325,"end":415},{"pid":"10","start":415,"end":490}]	{"averageWaitingTime":60.625,"averageTurnaroundTime":121.875,"averageResponseTime":60.625,"processMetrics":{"1":{"waitingTime":0,"turnaroundTime":80,"responseTime":0},"2":{"waitingTime":60,"turnaroundTime":120,"responseTime":60},"5":{"waitingTime":60,"turnaroundTime":90,"responseTime":60},"6":{"waitingTime":80,"turnaroundTime":170,"responseTime":80},"7":{"waitingTime":140,"turnaroundTime":165,"responseTime":140},"8":{"waitingTime":45,"turnaroundTime":85,"responseTime":45},"9":{"waitingTime":65,"turnaroundTime":155,"responseTime":65},"10":{"waitingTime":35,"turnaroundTime":110,"responseTime":35}}}
e4059776-e159-4508-9219-a46ed045bb97	677b5b5f-d3e7-47b6-a93c-e81317be3f97	09d01f22-d00f-4df7-8115-0db5b0bf744c	FCFS	\N	[{"pid":"1","start":0,"end":80},{"pid":"2","start":80,"end":140},{"pid":"3","start":140,"end":205},{"pid":"4","start":205,"end":325},{"pid":"5","start":325,"end":355},{"pid":"6","start":355,"end":445},{"pid":"7","start":445,"end":470},{"pid":"8","start":470,"end":510},{"pid":"9","start":510,"end":600},{"pid":"10","start":600,"end":675}]	{"averageWaitingTime":184,"averageTurnaroundTime":251.5,"averageResponseTime":184,"processMetrics":{"1":{"waitingTime":0,"turnaroundTime":80,"responseTime":0},"2":{"waitingTime":60,"turnaroundTime":120,"responseTime":60},"3":{"waitingTime":100,"turnaroundTime":165,"responseTime":100},"4":{"waitingTime":145,"turnaroundTime":265,"responseTime":145},"5":{"waitingTime":245,"turnaroundTime":275,"responseTime":245},"6":{"waitingTime":265,"turnaroundTime":355,"responseTime":265},"7":{"waitingTime":325,"turnaroundTime":350,"responseTime":325},"8":{"waitingTime":230,"turnaroundTime":270,"responseTime":230},"9":{"waitingTime":250,"turnaroundTime":340,"responseTime":250},"10":{"waitingTime":220,"turnaroundTime":295,"responseTime":220}}}
14a1d3ea-c3ee-4b56-80f7-7c7ad2eec8af	677b5b5f-d3e7-47b6-a93c-e81317be3f97	09d01f22-d00f-4df7-8115-0db5b0bf744c	FCFS	\N	[{"pid":"1","start":0,"end":80},{"pid":"2","start":80,"end":140},{"pid":"3","start":140,"end":205},{"pid":"4","start":205,"end":325},{"pid":"5","start":325,"end":355},{"pid":"6","start":355,"end":445},{"pid":"7","start":445,"end":470},{"pid":"8","start":470,"end":510},{"pid":"9","start":510,"end":600},{"pid":"10","start":600,"end":675}]	{"averageWaitingTime":184,"averageTurnaroundTime":251.5,"averageResponseTime":184,"processMetrics":{"1":{"waitingTime":0,"turnaroundTime":80,"responseTime":0},"2":{"waitingTime":60,"turnaroundTime":120,"responseTime":60},"3":{"waitingTime":100,"turnaroundTime":165,"responseTime":100},"4":{"waitingTime":145,"turnaroundTime":265,"responseTime":145},"5":{"waitingTime":245,"turnaroundTime":275,"responseTime":245},"6":{"waitingTime":265,"turnaroundTime":355,"responseTime":265},"7":{"waitingTime":325,"turnaroundTime":350,"responseTime":325},"8":{"waitingTime":230,"turnaroundTime":270,"responseTime":230},"9":{"waitingTime":250,"turnaroundTime":340,"responseTime":250},"10":{"waitingTime":220,"turnaroundTime":295,"responseTime":220}}}
e8eed6b4-e1c3-4c16-a7c0-08a580d06cad	677b5b5f-d3e7-47b6-a93c-e81317be3f97	09d01f22-d00f-4df7-8115-0db5b0bf744c	FCFS	\N	[{"pid":"1","start":0,"end":80},{"pid":"2","start":80,"end":140},{"pid":"3","start":140,"end":205},{"pid":"4","start":205,"end":325},{"pid":"5","start":325,"end":355},{"pid":"6","start":355,"end":445},{"pid":"7","start":445,"end":470},{"pid":"8","start":470,"end":510},{"pid":"9","start":510,"end":600},{"pid":"10","start":600,"end":675}]	{"averageWaitingTime":184,"averageTurnaroundTime":251.5,"averageResponseTime":184,"processMetrics":{"1":{"waitingTime":0,"turnaroundTime":80,"responseTime":0},"2":{"waitingTime":60,"turnaroundTime":120,"responseTime":60},"3":{"waitingTime":100,"turnaroundTime":165,"responseTime":100},"4":{"waitingTime":145,"turnaroundTime":265,"responseTime":145},"5":{"waitingTime":245,"turnaroundTime":275,"responseTime":245},"6":{"waitingTime":265,"turnaroundTime":355,"responseTime":265},"7":{"waitingTime":325,"turnaroundTime":350,"responseTime":325},"8":{"waitingTime":230,"turnaroundTime":270,"responseTime":230},"9":{"waitingTime":250,"turnaroundTime":340,"responseTime":250},"10":{"waitingTime":220,"turnaroundTime":295,"responseTime":220}}}
a993ed0f-c529-4bd7-956c-1cfeb0a0a09a	677b5b5f-d3e7-47b6-a93c-e81317be3f97	09d01f22-d00f-4df7-8115-0db5b0bf744c	FCFS	\N	[{"pid":"1","start":0,"end":80},{"pid":"2","start":80,"end":140},{"pid":"3","start":140,"end":205},{"pid":"4","start":205,"end":325},{"pid":"5","start":325,"end":355},{"pid":"6","start":355,"end":445},{"pid":"7","start":445,"end":470},{"pid":"8","start":470,"end":510},{"pid":"9","start":510,"end":600},{"pid":"10","start":600,"end":675}]	{"averageWaitingTime":184,"averageTurnaroundTime":251.5,"averageResponseTime":184,"processMetrics":{"1":{"waitingTime":0,"turnaroundTime":80,"responseTime":0},"2":{"waitingTime":60,"turnaroundTime":120,"responseTime":60},"3":{"waitingTime":100,"turnaroundTime":165,"responseTime":100},"4":{"waitingTime":145,"turnaroundTime":265,"responseTime":145},"5":{"waitingTime":245,"turnaroundTime":275,"responseTime":245},"6":{"waitingTime":265,"turnaroundTime":355,"responseTime":265},"7":{"waitingTime":325,"turnaroundTime":350,"responseTime":325},"8":{"waitingTime":230,"turnaroundTime":270,"responseTime":230},"9":{"waitingTime":250,"turnaroundTime":340,"responseTime":250},"10":{"waitingTime":220,"turnaroundTime":295,"responseTime":220}}}
392b5cca-6e0a-4b66-9a4f-1f52f9f22844	677b5b5f-d3e7-47b6-a93c-e81317be3f97	09d01f22-d00f-4df7-8115-0db5b0bf744c	FCFS	\N	[{"pid":"1","start":0,"end":80},{"pid":"2","start":80,"end":140},{"pid":"3","start":140,"end":205},{"pid":"4","start":205,"end":325},{"pid":"5","start":325,"end":355},{"pid":"6","start":355,"end":445},{"pid":"7","start":445,"end":470},{"pid":"8","start":470,"end":510},{"pid":"9","start":510,"end":600},{"pid":"10","start":600,"end":675}]	{"averageWaitingTime":184,"averageTurnaroundTime":251.5,"averageResponseTime":184,"processMetrics":{"1":{"waitingTime":0,"turnaroundTime":80,"responseTime":0},"2":{"waitingTime":60,"turnaroundTime":120,"responseTime":60},"3":{"waitingTime":100,"turnaroundTime":165,"responseTime":100},"4":{"waitingTime":145,"turnaroundTime":265,"responseTime":145},"5":{"waitingTime":245,"turnaroundTime":275,"responseTime":245},"6":{"waitingTime":265,"turnaroundTime":355,"responseTime":265},"7":{"waitingTime":325,"turnaroundTime":350,"responseTime":325},"8":{"waitingTime":230,"turnaroundTime":270,"responseTime":230},"9":{"waitingTime":250,"turnaroundTime":340,"responseTime":250},"10":{"waitingTime":220,"turnaroundTime":295,"responseTime":220}}}
309f0f0d-16e7-4942-824f-51b935202b44	677b5b5f-d3e7-47b6-a93c-e81317be3f97	09d01f22-d00f-4df7-8115-0db5b0bf744c	FCFS	\N	[{"pid":"1","start":0,"end":80},{"pid":"2","start":80,"end":140},{"pid":"3","start":140,"end":205},{"pid":"4","start":205,"end":325},{"pid":"5","start":325,"end":355},{"pid":"6","start":355,"end":445},{"pid":"7","start":445,"end":470},{"pid":"8","start":470,"end":510},{"pid":"9","start":510,"end":600},{"pid":"10","start":600,"end":675}]	{"averageWaitingTime":184,"averageTurnaroundTime":251.5,"averageResponseTime":184,"processMetrics":{"1":{"waitingTime":0,"turnaroundTime":80,"responseTime":0},"2":{"waitingTime":60,"turnaroundTime":120,"responseTime":60},"3":{"waitingTime":100,"turnaroundTime":165,"responseTime":100},"4":{"waitingTime":145,"turnaroundTime":265,"responseTime":145},"5":{"waitingTime":245,"turnaroundTime":275,"responseTime":245},"6":{"waitingTime":265,"turnaroundTime":355,"responseTime":265},"7":{"waitingTime":325,"turnaroundTime":350,"responseTime":325},"8":{"waitingTime":230,"turnaroundTime":270,"responseTime":230},"9":{"waitingTime":250,"turnaroundTime":340,"responseTime":250},"10":{"waitingTime":220,"turnaroundTime":295,"responseTime":220}}}
024e1054-7925-45e1-9474-f7e39ebdf48e	677b5b5f-d3e7-47b6-a93c-e81317be3f97	09d01f22-d00f-4df7-8115-0db5b0bf744c	FCFS	\N	[{"pid":"1","start":0,"end":80},{"pid":"2","start":80,"end":140},{"pid":"3","start":140,"end":205},{"pid":"4","start":205,"end":325},{"pid":"5","start":325,"end":355},{"pid":"6","start":355,"end":445},{"pid":"7","start":445,"end":470},{"pid":"8","start":470,"end":510},{"pid":"9","start":510,"end":600},{"pid":"10","start":600,"end":675}]	{"averageWaitingTime":184,"averageTurnaroundTime":251.5,"averageResponseTime":184,"processMetrics":{"1":{"waitingTime":0,"turnaroundTime":80,"responseTime":0},"2":{"waitingTime":60,"turnaroundTime":120,"responseTime":60},"3":{"waitingTime":100,"turnaroundTime":165,"responseTime":100},"4":{"waitingTime":145,"turnaroundTime":265,"responseTime":145},"5":{"waitingTime":245,"turnaroundTime":275,"responseTime":245},"6":{"waitingTime":265,"turnaroundTime":355,"responseTime":265},"7":{"waitingTime":325,"turnaroundTime":350,"responseTime":325},"8":{"waitingTime":230,"turnaroundTime":270,"responseTime":230},"9":{"waitingTime":250,"turnaroundTime":340,"responseTime":250},"10":{"waitingTime":220,"turnaroundTime":295,"responseTime":220}}}
a6895386-23c6-4619-a7cd-d044a3afcffe	677b5b5f-d3e7-47b6-a93c-e81317be3f97	09d01f22-d00f-4df7-8115-0db5b0bf744c	FCFS	\N	[{"pid":"1","start":0,"end":80},{"pid":"2","start":80,"end":140},{"pid":"3","start":140,"end":205},{"pid":"4","start":205,"end":325},{"pid":"5","start":325,"end":355},{"pid":"6","start":355,"end":445},{"pid":"7","start":445,"end":470},{"pid":"8","start":470,"end":510},{"pid":"9","start":510,"end":600},{"pid":"10","start":600,"end":675}]	{"averageWaitingTime":184,"averageTurnaroundTime":251.5,"averageResponseTime":184,"processMetrics":{"1":{"waitingTime":0,"turnaroundTime":80,"responseTime":0},"2":{"waitingTime":60,"turnaroundTime":120,"responseTime":60},"3":{"waitingTime":100,"turnaroundTime":165,"responseTime":100},"4":{"waitingTime":145,"turnaroundTime":265,"responseTime":145},"5":{"waitingTime":245,"turnaroundTime":275,"responseTime":245},"6":{"waitingTime":265,"turnaroundTime":355,"responseTime":265},"7":{"waitingTime":325,"turnaroundTime":350,"responseTime":325},"8":{"waitingTime":230,"turnaroundTime":270,"responseTime":230},"9":{"waitingTime":250,"turnaroundTime":340,"responseTime":250},"10":{"waitingTime":220,"turnaroundTime":295,"responseTime":220}}}
430321e9-8cf7-4edf-82a9-1dc2517bcb8d	677b5b5f-d3e7-47b6-a93c-e81317be3f97	09d01f22-d00f-4df7-8115-0db5b0bf744c	FCFS	\N	[{"pid":"1","start":0,"end":80},{"pid":"2","start":80,"end":140},{"pid":"3","start":140,"end":205},{"pid":"4","start":205,"end":325},{"pid":"5","start":325,"end":355},{"pid":"6","start":355,"end":445},{"pid":"7","start":445,"end":470},{"pid":"8","start":470,"end":510},{"pid":"9","start":510,"end":600},{"pid":"10","start":600,"end":675}]	{"averageWaitingTime":184,"averageTurnaroundTime":251.5,"averageResponseTime":184,"processMetrics":{"1":{"waitingTime":0,"turnaroundTime":80,"responseTime":0},"2":{"waitingTime":60,"turnaroundTime":120,"responseTime":60},"3":{"waitingTime":100,"turnaroundTime":165,"responseTime":100},"4":{"waitingTime":145,"turnaroundTime":265,"responseTime":145},"5":{"waitingTime":245,"turnaroundTime":275,"responseTime":245},"6":{"waitingTime":265,"turnaroundTime":355,"responseTime":265},"7":{"waitingTime":325,"turnaroundTime":350,"responseTime":325},"8":{"waitingTime":230,"turnaroundTime":270,"responseTime":230},"9":{"waitingTime":250,"turnaroundTime":340,"responseTime":250},"10":{"waitingTime":220,"turnaroundTime":295,"responseTime":220}}}
b415c0dc-c8d9-46a2-b3de-cf41dcbc55f8	677b5b5f-d3e7-47b6-a93c-e81317be3f97	09d01f22-d00f-4df7-8115-0db5b0bf744c	FCFS	\N	[{"pid":"1","start":0,"end":80},{"pid":"2","start":80,"end":140},{"pid":"3","start":140,"end":205},{"pid":"4","start":205,"end":325},{"pid":"5","start":325,"end":355},{"pid":"6","start":355,"end":445},{"pid":"7","start":445,"end":470},{"pid":"8","start":470,"end":510},{"pid":"9","start":510,"end":600},{"pid":"10","start":600,"end":675}]	{"averageWaitingTime":184,"averageTurnaroundTime":251.5,"averageResponseTime":184,"processMetrics":{"1":{"waitingTime":0,"turnaroundTime":80,"responseTime":0},"2":{"waitingTime":60,"turnaroundTime":120,"responseTime":60},"3":{"waitingTime":100,"turnaroundTime":165,"responseTime":100},"4":{"waitingTime":145,"turnaroundTime":265,"responseTime":145},"5":{"waitingTime":245,"turnaroundTime":275,"responseTime":245},"6":{"waitingTime":265,"turnaroundTime":355,"responseTime":265},"7":{"waitingTime":325,"turnaroundTime":350,"responseTime":325},"8":{"waitingTime":230,"turnaroundTime":270,"responseTime":230},"9":{"waitingTime":250,"turnaroundTime":340,"responseTime":250},"10":{"waitingTime":220,"turnaroundTime":295,"responseTime":220}}}
656e969e-9a51-442f-8e15-8a769fcc5ec7	677b5b5f-d3e7-47b6-a93c-e81317be3f97	09d01f22-d00f-4df7-8115-0db5b0bf744c	FCFS	\N	[{"pid":"1","start":0,"end":80},{"pid":"2","start":80,"end":140},{"pid":"3","start":140,"end":205},{"pid":"4","start":205,"end":325},{"pid":"5","start":325,"end":355},{"pid":"6","start":355,"end":445},{"pid":"7","start":445,"end":470},{"pid":"8","start":470,"end":510},{"pid":"9","start":510,"end":600},{"pid":"10","start":600,"end":675}]	{"averageWaitingTime":184,"averageTurnaroundTime":251.5,"averageResponseTime":184,"processMetrics":{"1":{"waitingTime":0,"turnaroundTime":80,"responseTime":0},"2":{"waitingTime":60,"turnaroundTime":120,"responseTime":60},"3":{"waitingTime":100,"turnaroundTime":165,"responseTime":100},"4":{"waitingTime":145,"turnaroundTime":265,"responseTime":145},"5":{"waitingTime":245,"turnaroundTime":275,"responseTime":245},"6":{"waitingTime":265,"turnaroundTime":355,"responseTime":265},"7":{"waitingTime":325,"turnaroundTime":350,"responseTime":325},"8":{"waitingTime":230,"turnaroundTime":270,"responseTime":230},"9":{"waitingTime":250,"turnaroundTime":340,"responseTime":250},"10":{"waitingTime":220,"turnaroundTime":295,"responseTime":220}}}
4664a5c8-149d-4d94-81e3-7ef9652df0fc	677b5b5f-d3e7-47b6-a93c-e81317be3f97	09d01f22-d00f-4df7-8115-0db5b0bf744c	FCFS	\N	[{"pid":"1","start":0,"end":80},{"pid":"2","start":80,"end":140},{"pid":"3","start":140,"end":205},{"pid":"4","start":205,"end":325},{"pid":"5","start":325,"end":355},{"pid":"6","start":355,"end":445},{"pid":"7","start":445,"end":470},{"pid":"8","start":470,"end":510},{"pid":"9","start":510,"end":600},{"pid":"10","start":600,"end":675}]	{"averageWaitingTime":184,"averageTurnaroundTime":251.5,"averageResponseTime":184,"processMetrics":{"1":{"waitingTime":0,"turnaroundTime":80,"responseTime":0},"2":{"waitingTime":60,"turnaroundTime":120,"responseTime":60},"3":{"waitingTime":100,"turnaroundTime":165,"responseTime":100},"4":{"waitingTime":145,"turnaroundTime":265,"responseTime":145},"5":{"waitingTime":245,"turnaroundTime":275,"responseTime":245},"6":{"waitingTime":265,"turnaroundTime":355,"responseTime":265},"7":{"waitingTime":325,"turnaroundTime":350,"responseTime":325},"8":{"waitingTime":230,"turnaroundTime":270,"responseTime":230},"9":{"waitingTime":250,"turnaroundTime":340,"responseTime":250},"10":{"waitingTime":220,"turnaroundTime":295,"responseTime":220}}}
69088bf5-e2c0-421e-8238-6e1322d1099a	677b5b5f-d3e7-47b6-a93c-e81317be3f97	09d01f22-d00f-4df7-8115-0db5b0bf744c	FCFS	\N	[{"pid":"1","start":0,"end":80},{"pid":"2","start":80,"end":140},{"pid":"3","start":140,"end":205},{"pid":"4","start":205,"end":325},{"pid":"5","start":325,"end":355},{"pid":"6","start":355,"end":445},{"pid":"7","start":445,"end":470},{"pid":"8","start":470,"end":510},{"pid":"9","start":510,"end":600},{"pid":"10","start":600,"end":675}]	{"averageWaitingTime":184,"averageTurnaroundTime":251.5,"averageResponseTime":184,"processMetrics":{"1":{"waitingTime":0,"turnaroundTime":80,"responseTime":0},"2":{"waitingTime":60,"turnaroundTime":120,"responseTime":60},"3":{"waitingTime":100,"turnaroundTime":165,"responseTime":100},"4":{"waitingTime":145,"turnaroundTime":265,"responseTime":145},"5":{"waitingTime":245,"turnaroundTime":275,"responseTime":245},"6":{"waitingTime":265,"turnaroundTime":355,"responseTime":265},"7":{"waitingTime":325,"turnaroundTime":350,"responseTime":325},"8":{"waitingTime":230,"turnaroundTime":270,"responseTime":230},"9":{"waitingTime":250,"turnaroundTime":340,"responseTime":250},"10":{"waitingTime":220,"turnaroundTime":295,"responseTime":220}}}
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (user_id, email, password_hash, registration_date) FROM stdin;
677b5b5f-d3e7-47b6-a93c-e81317be3f97	bc210409408@example.com	$2b$10$jMX/KRrk0k1tcqxwnfLWf.UVe3C6zu9YfyFCzrEfliNQ43Dohh/vm	2025-03-13 20:46:20.739125
\.


--
-- Name: process_sets process_sets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.process_sets
    ADD CONSTRAINT process_sets_pkey PRIMARY KEY (process_set_id);


--
-- Name: processes processes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.processes
    ADD CONSTRAINT processes_pkey PRIMARY KEY (process_id);


--
-- Name: simulations simulations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.simulations
    ADD CONSTRAINT simulations_pkey PRIMARY KEY (simulation_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: process_sets process_sets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.process_sets
    ADD CONSTRAINT process_sets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: processes processes_process_set_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.processes
    ADD CONSTRAINT processes_process_set_id_fkey FOREIGN KEY (process_set_id) REFERENCES public.process_sets(process_set_id);


--
-- Name: simulations simulations_process_set_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.simulations
    ADD CONSTRAINT simulations_process_set_id_fkey FOREIGN KEY (process_set_id) REFERENCES public.process_sets(process_set_id);


--
-- Name: simulations simulations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.simulations
    ADD CONSTRAINT simulations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- PostgreSQL database dump complete
--

