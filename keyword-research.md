# Keyword Research: The REFINERY (refineryrobotics.org)

**Date:** 2026-09-23
**Scope:** The whole site. Organic search demand around FIRST robotics (FRC/FTC) support in Northeast Indiana: finding, starting, funding, mentoring, and sponsoring teams, plus the facility, events, and brand.
**Audience:** (1) parents and students looking for a team, (2) teachers and admins starting one, (3) engineers and professionals who might mentor, (4) donors and local employers, (5) coaches of the 15 teams we already back.
**Tools used:** Hand inspection of about 16 live Google SERPs (Sept 2026) plus a review of the site's existing content and routes. **No keyword tool or Search Console data was available,** so volumes are estimated bands, not measured numbers:
`Very low` <10/mo · `Low` 10–100 · `Med` 100–1,000 · `High` >1,000. Difficulty (1–5) comes from who holds page 1 (national orgs such as FIRST, NASA, and TBA count as hard; local news and school pages count as easy).

Full sheet: [`keyword-research.csv`](./keyword-research.csv), 145 keywords, one row per keyword, sorted by priority.

---

## Summary

**Total keywords analyzed:** 145
**Clusters identified:** 25
**Priority clusters (top 20%):** 5 (plus 4 more tied at score 6)

Nobody owns local search in this niche. For "first robotics fort wayne" and "robotics team fort wayne", page 1 is a scatter of Blue Alliance team pages, Journal Gazette/WANE stories, the FWCS pathway page, and industrial-robotics job listings. No hub page explains the whole regional picture, and that is exactly what this site is. Search volumes are small (local nonprofit), but each of these visitors is someone who could join, mentor, donate, or sponsor.

Three things stood out:

1. **The site is not indexed yet.** A `site:refineryrobotics.org` search returns nothing, and "refinery" on its own collides with oil refineries and Refinery29. Brand queries will only work with the "robotics" modifier. Always pair "The REFINERY" with "robotics" or "Fort Wayne" in titles, schema `name`/`alternateName`, and social profiles.
2. **The broad local searches are winnable because nobody youth-focused holds them.** Google reads "robotics fort wayne" and "robotics [county] county" as industrial/jobs searches because no strong youth robotics page exists for those places. See *Generic local terms* below.
3. **Funding pages are timely right now.** NASA's 2026–27 FRC grants are rookie-only, and FIRST dropped its own rookie grant in 2025. Chief Delphi threads show coaches confused about what's still available. An annually refreshed "robotics team grants" roundup with an Indiana angle would earn links and serves our mission directly.

---

## Phased plan

**Phase 1: wording and markup on existing pages (done, branch `seo-phase-1-local-terms`)**
- Home title → "Youth Robotics in Fort Wayne & Northeast Indiana". The meta description and hero copy now say "youth robotics" and "Fort Wayne".
- `areaServed` lists Northeast Indiana, then each of the 12 counties with every town in it, from one shared list in `src/data/service-area.ts`.
- The About "Where We Serve" list shows the 12 counties, and an "Is my area/organization covered?" disclosure lists all 79 incorporated cities and towns (from Wikipedia) by county. That visible text is the source for the markup. Plus a "No team at your school yet?" link to Start a Team.
- The Get Involved "Start or Host a Team" section names all 12 counties. Its meta description now says "Northeast Indiana" and "mentor".
- Team page titles add the host school when the team name doesn't include it (11 of 15).
- `llms.txt` has a "Where we serve" section.

**Phase 2: off-site (no code)**
- Google Business Profile: description, categories, and the 12-county service area.
- Ask WANE, the Journal Gazette, FWCS, team school sites, partners, FIRST Indiana, and TechPoint Youth for links.

**Phase 3: new pages (later)**
- Break "Start or Host a Team" out into its own `/start-a-team/` page, with the counties table, local school/district status (verified against The Blue Alliance and the FIRST team list), and funding.
- Grants roundup (`/resources/robotics-team-grants/`), refreshed every August.
- Then the rest of `/resources/`: team cost, FTC vs FRC, mentor guide.

Not doing: separate county pages (by decision), the "FIRST Robotics Community Center" name (it isn't what The REFINERY is).

---

## Top priority clusters

Priority = Opportunity + Strategic fit − Difficulty (each scored 1–5).

### 1. Local FIRST robotics hub (priority 7)
- **Primary keyword:** first robotics fort wayne (Med, D2)
- **Intent:** Navigational/informational (local)
- **Page type:** Hub/landing page
- **Secondary:** fort wayne robotics, robotics teams northeast indiana, frc teams fort wayne, ftc teams fort wayne, high school robotics fort wayne, robotics club fort wayne, student robotics fort wayne indiana
- **Target URL:** `/` and `/about/teams/` (both exist)
- **Effort:** 2–4 hours (copy and title changes, no new page)
- **Why:** This is the site's core identity, and today no page on page 1 answers it as a whole. The home title ("FIRST Robotics Support in Northeast Indiana") is already good. Add "Fort Wayne" to the H1 area and body copy, and put the team count, cities, and the map on the home page.

### 2. Find a team for my student (priority 7)
- **Primary keyword:** robotics team near me (Med, D2)
- **Intent:** Informational → transactional (parent wants to enroll)
- **Page type:** Finder page with map, grouped by city/school, with a join contact per team
- **Secondary:** how to join a first robotics team, join robotics team fort wayne, robotics for high school students fort wayne, robotics for kids fort wayne, 4-h robotics indiana, homeschool robotics team fort wayne, middle school robotics fort wayne
- **Target URL:** Promote the "Find a Team for Your Student" section of `/get-involved/` to its own `/find-a-team/`
- **Effort:** 1 day (reuses team data and the existing map component)
- **Why:** Highest-intent parent query. The team data already exists in `src/content/teams/`. Say plainly which teams take homeschoolers or students from other schools, because that's what parents actually ask.

### 3. Mentoring locally (priority 7)
- **Primary keyword:** robotics mentor fort wayne (Low, D2)
- **Intent:** Transactional (sign up)
- **Page type:** Recruitment section/page: roles, time commitment, background check, contact form
- **Secondary:** volunteer robotics fort wayne, become a first robotics mentor, stem volunteer opportunities fort wayne, engineering volunteer opportunities indiana, first robotics volunteer indiana, volunteer opportunities for engineers fort wayne
- **Target URL:** `/get-involved/#volunteer` (exists). Keep the "Volunteer" label because outsiders recognize it; the copy already says "ongoing team mentoring", so both words are covered.
- **Effort:** None required
- **Why:** The Journal Gazette story ["Fort Wayne robotics teams seek mentors"](https://www.journalgazette.net/local/schools/education-notebook-fort-wayne-robotics-teams-seek-mentors/article_17cb512c-c6c9-11ef-b2cd-273079118b5d.html) (we already host it in `news/`) proves there's demand. FIRST Indiana covers *event* volunteers, which leaves *team mentoring* in Northeast Indiana open.

### 5. Start a robotics team in Indiana (priority 6)
- **Primary keyword:** how to start a first robotics team (Med, D3)
- **Intent:** Informational
- **Page type:** Step-by-step guide
- **Secondary:** how to start an frc team, how to start an ftc team, start a robotics team at my school, start a robotics team indiana, robotics team requirements, frc rookie team checklist, how to start a robotics club
- **Target URL:** `/resources/start-a-robotics-team/` (new; also starts the `/resources/` section plan.md calls for)
- **Effort:** 1–2 days
- **Why:** firstinspires.org and regional FIRST partners (NYC, Illinois) hold the generic version, but none of them cover Indiana. We've launched 5 teams from scratch, and that first-hand experience is our advantage. Link to the grants, cost, and FTC-vs-FRC pages as a cluster.

### 6. Robotics team grants & funding (priority 6)
- **Primary keyword:** robotics team grants (Med, D3)
- **Intent:** Informational/commercial
- **Page type:** Roundup, refreshed every August
- **Secondary:** frc rookie grant, nasa frc grant, first robotics grants indiana, indiana robotics grant, how to fund a robotics team, robotics team fundraising ideas, ftc team grants, robotics grants for schools
- **Target URL:** `/resources/robotics-team-grants/`
- **Effort:** 1 day + 2 hours/year
- **Why:** Demand spikes every August–October, and the landscape just changed (NASA rookie-only, no FIRST rookie grant). Include the Indiana state robotics grant program and our own funding ($75K moved). Needs a visible "last updated" date.

### 7. Local robotics events (priority 6)
- **Primary keyword:** robotics competition fort wayne (Low, D1)
- **Secondary:** monster match robotics, frc offseason event indiana, robotics events near me, battle of the robots fort wayne
- **Target URL:** `/programs-events/` and event pages. **Monster Match is 2026-10-31. Make sure its page has date, venue, spectator info, and `Event` schema now.**
- **Why:** An easy SERP, and it's timely.

### 8. Donate to STEM / robotics (priority 6)
- **Primary keyword:** donate to robotics team (Low, D2)
- **Secondary:** stem nonprofit fort wayne, support stem education northeast indiana, tax deductible robotics donation, donate robotics equipment
- **Target URL:** `/donate/` (exists, and already states that gifts go through BioNanomics, a registered 501(c)(3), and are tax-deductible). Optional: a line on in-kind donations of tools and parts.

### 9. Corporate sponsorship (priority 6)
- **Primary keyword:** sponsor a robotics team (Low, D2)
- **Secondary:** robotics team sponsorship fort wayne, corporate stem sponsorship indiana, stem workforce development northeast indiana, is sponsoring a robotics team tax deductible
- **Target URL:** Today it's one "sponsor" mention on the site. Build `/sponsor/` with tiers, workforce-pipeline framing for regional manufacturers, and a gift-vs-business-expense FAQ.

### 10–15. Second tier (priority 5)
| Cluster | Primary | Target | Note |
|---|---|---|---|
| Individual team pages | homestead robotics team | `/teams/[slug]/` | The school is already in the meta description, the visible Host line, and `SportsTeam` schema. The gap is only the `<title>` (`4982 — Olympus Robotics`), and only for the 11 of 15 teams whose name doesn't include the school. Optional: add the host to the title (keep the bare number, per the FIRST naming rule in the code). |
| Cost of an FRC/FTC team | how much does an frc team cost | `/resources/robotics-team-cost/` | Pairs with the grants page. A downloadable budget template earns links. |
| Robotics makerspace & facility | robotics makerspace fort wayne | `/about/` facility section | Don't target plain "makerspace fort wayne". TekVenture owns it and the intent is adult memberships. |
| Robot demos & facility tours | robot demonstration for schools | existing program pages | Low volume, high conversion. |
| Brand / navigational | the refinery robotics | `/` | Consistency across entities matters more than content here. |

---

## Generic local terms: "robotics fort wayne", "robotics [county]", "youth robotics indiana"

What page 1 shows today (Sept 2026) and what it would take to get onto it:

| Query | Who ranks today | What Google thinks it means | Difficulty | Realistic target |
|---|---|---|---|---|
| robotics fort wayne | LinkedIn/Indeed jobs, integrators (Decker, Associated, Glaze), robot-built-house news | Industrial jobs and services | 3 | Top 10 is possible within a year. #1 is unlikely while job boards hold it. |
| youth robotics fort wayne | WANE, Journal Gazette, BGC, Science Central, even Fort *Worth* library | Youth programs (weak, scattered results) | 1 | **#1 is achievable.** Nobody targets it. |
| robotics [county] county indiana | Wikipedia county pages, economic-development news, job boards | Industrial | 1 | Top 3 for counties where we have teams |
| youth robotics indiana | Indiana Chamber, FIRST Indiana, TechPoint Youth, GEARS (Osceola) | Statewide programs | 4 | Page 1 is a long shot. Aim for "youth robotics northeast indiana" first. |

### 1. Say the words people search. Today the site doesn't.
- The home H1 is "Shared infrastructure for stronger robotics teams". It names no place and no audience, and the rendered home page mentions "Fort Wayne" once and never uses the word "county".
- "Youth" appears only in the name expansion and the Youth Protection link. Families and funders say **youth robotics**, **student robotics** and **robotics for kids/teens**; the community says "FIRST teams". Use both.
- Fix: work "youth robotics in Fort Wayne and Northeast Indiana" into the home intro and hero sub-copy, and name the host cities (Fort Wayne, Kendallville, Huntington, Fairmount) in body copy. This is a copy change, not a restructure.
- Schema: `areaServed` is one string, "Northeast Indiana". Make it the 12 counties as separate `AdministrativeArea` entries (plus Fort Wayne as a `City`), so the page is tied to each place by name.

### 2. County pages: all 12, written to recruit new teams
The main goal is to reach schools and parents in counties **without** a team you back and let them know you'll help start one. So every county gets a page, and the pages for counties without a team are the most important ones. What keeps these from being doorway pages is real, county-specific facts, not a template with the name swapped:

- **The high schools and districts in the county, and each one's current robotics status:** FIRST team, VEX only, or none. Many Indiana schools run VEX through TechPoint Youth's State Robotics Initiative, which makes them strong candidates for moving up to FTC or FRC.
- **Existing teams in the county, even ones you don't back.** Example: DeKalb County has FRC 5934 DeKalb Crowbotics. Never claim a county has "no robotics".
- **Local funding:** the county's community foundation, and the state K-12 Robotics Competition Grant (up to $50K). Offer to help with the application.
- **Distance** to the Fort Wayne facility and to the nearest team you back.
- **What The REFINERY provides a new team:** launch help, funding, parts, tools, mentors, practice space. Plus a direct "start a team here" contact.

Title pattern: "Start a Robotics Team in Wells County, Indiana" for counties without a team you back, and "Youth Robotics in Noble County, Indiana" for counties with one. When a new team launches, the page switches from the first version to the second. Every school's status needs checking before publishing; the web data here is patchy (a "Decatur Robotics 4026" result, for example, is Decatur, Georgia).

Supporting pieces:
- `areaServed`: all 12 counties plus their main towns (you do serve all of them). School districts go in the visible copy on each county page, not in `areaServed`, since schema.org has no district type.
- Google Business Profile: set the service area to the 12 counties.
- The start-a-team guide and grants roundup (clusters 5–6) are the pages these county pages link to. People in counties without a team are exactly the audience for those.

### 3. Get into the local map results for "robotics fort wayne"
The job boards own the organic results. The fastest way onto page 1 is Google's map pack of local listings. If there's no **Google Business Profile** for the 1750 Broadway facility, create one: pick a category such as "Non-profit organization" (or "Educational institution") and name it "The REFINERY Robotics". This is likely the single biggest lever for "robotics fort wayne" and "robotics near me".

### 4. Links from local press you're already in
WANE and the Journal Gazette rank for these searches and have covered your teams, and the site already hosts ~27 of those stories. Ask those outlets, FWCS, the partner orgs and each team's school site to link to refineryrobotics.org (or to the team's page on it). Local links are what move a local ranking.

### 5. "youth robotics indiana"
GEARS in Osceola calls itself an "Indiana Youth Robotics Center". It's the closest peer model and worth studying. For us: own "youth robotics northeast indiana" (use it in the home title or intro), then get listed on FIRST Indiana and TechPoint Youth resource pages. Their links are the path to the statewide term.

---

## Topic map

```
The REFINERY: FIRST robotics support, Northeast Indiana  (/)
├── Local hub ─────────── first robotics fort wayne            → /, /about/teams/
│   ├── Team pages ────── [school] robotics team, frc ####     → /teams/[slug]/
│   └── Counties ──────── robotics [county] county indiana     → /robotics/[county]-county/ (see below)
├── Families
│   ├── Find a team ───── robotics team near me                → /find-a-team/
│   ├── FTC vs FRC ────── ftc vs frc, fll vs ftc               → /resources/ftc-vs-frc/
│   └── Why FIRST ─────── benefits of first robotics           → /resources/why-first-robotics/
├── Schools & coaches  (/resources/)
│   ├── Start a team ──── how to start a first robotics team   → /resources/start-a-robotics-team/
│   ├── Grants ────────── robotics team grants                 → /resources/robotics-team-grants/
│   ├── Cost ──────────── how much does an frc team cost       → /resources/robotics-team-cost/
│   └── Mentor guide ──── frc mentor guide                     → /resources/frc-mentor-guide/
├── Volunteers ────────── robotics mentor fort wayne           → /get-involved/ (/volunteer/)
├── Supporters
│   ├── Donate ────────── donate to robotics team              → /donate/
│   └── Sponsor ───────── sponsor a robotics team              → /sponsor/
└── Place & programs
    ├── Facility ──────── robotics makerspace fort wayne       → /about/
    ├── Events ────────── robotics competition fort wayne      → /programs-events/
    ├── Demos & tours ─── robot demonstration for schools      → /programs-events/[id]/
    └── Amp Lab ───────── amp lab fort wayne                   → /programs-events/amp-lab/
```

Internal linking: every `/resources/` guide links up to "Find a team" or "Get involved". Every team page links to `/donate/` and `/find-a-team/`. Start-a-team ↔ grants ↔ cost form a tight triangle.

---

## Quick wins

There's no Search Console data yet because the site isn't indexed. These are on-page fixes to existing URLs instead:

| URL | Target query | Action |
|---|---|---|
| `/teams/[slug]/` (11 of 15) | [school] robotics team | Optional: add the host school to `<title>` where the team name omits it (already in description, body, and schema) |

**Next step once live:** verify the site in Google Search Console, then re-run this after about 90 days using real queries at positions 5–20.

---

## Deferred clusters

| Cluster | Reason |
|---|---|
| FTC vs FRC vs FLL (4) | Real parent demand, but forums and FIRST partners hold the snippet. Write it after the /resources/ core. |
| FRC mentor resources (4) | FIRST PDFs, LearnFRC, and Chief Delphi dominate. Worth doing for the teams we serve, but it won't rank soon. |
| Amp Lab / FWCS pathway (4) | Navigational to amplab.fortwayneschools.org. Support that site; don't compete with a partner. |
| Summer robotics programs (3) | Only worth pursuing if we run a recurring summer build (RE-BLITZ?). Local camps skew grades 3–6, which leaves a gap at high-school level. |
| Benefits & scholarships (3) | FIRST's scholarship database owns it; low strategic fit. |
| Girls in robotics / STEM (3) | Needs a real program behind it. |
| FRC technical deep dives (1) | WPILib docs, gm0, and Chief Delphi own it. Fine as blog posts for community goodwill, not as an SEO target. |
| Robot in 3 Days (1) | Owned by the Ri3D teams. |
| General makerspace (−1) | TekVenture/Build Guild own it, and searchers want adult memberships. Audience mismatch. |

---

## Refresh schedule

- **Every August:** grants roundup and cost page (new season numbers, NASA/FIRST grant changes).
- **90 days after launch and indexing:** redo with Search Console queries and fill in the Quick Wins table from real data.
- **Annually:** full refresh. Add real volumes if a keyword tool becomes available (Google Keyword Planner is free with an Ads account).

---

Sources for SERP observations: [FIRST start a team](https://www.firstinspires.org/programs/frc/get-started), [NASA 2026–27 FRC grants](https://robotics.nasa.gov/2026-2027-frc-sponsorship-grants/), [Chief Delphi: no 2025 rookie grant](https://www.chiefdelphi.com/t/no-2025-frc-rookie-team-grant/471787), [FWCS Robotics Entrepreneurship pathway](https://www.fortwayneschools.org/schools-of-success/pathways/robotics), [WANE: FWCS robotics / Electric Works arena](https://www.wane.com/news/local-news/one-mans-generosity-helps-future-generations-within-fwcs/), [TBA Team 4982](https://www.thebluealliance.com/team/4982/), [TekVenture](https://www.tekventure.org/), [FIRST Indiana volunteer](https://www.firstindianarobotics.org/get-involved/volunteer/), [FIRST Robotics BC: FTC vs FRC](https://firstroboticsbc.org/whats-the-difference-between-ftc-and-frc/), [FIRST Robotics Canada: costs](https://firstroboticscanada.org/frc/costs-and-grants/), [PFW summer programs](https://www.pfw.edu/etcs/community-outreach/summer), [Yahoo: Fire Wires / Indiana robotics grant law](https://news.yahoo.com/robotics-fire-wires-team-succeeds-092128787.html).
