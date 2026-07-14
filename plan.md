# Project Brief: The REFINERY Website Development

## 1. Executive Summary
**Project:** A brand-new static website for **The REFINERY**, a nonprofit makerspace centered around FIRST Robotics. 
**Objective:** To create an impressive, high-performance static site that showcases the makerspace, highlights engineering projects, provides resources for FRC mentors, and hosts a technical blog. The site must serve as a visual showcase while remaining easy to update via Markdown/MDX in a Git-based workflow.
**Structural Benchmark:** Reference `bionanomics.com` for structural and stylistic inspiration.

## 2. Technical Stack & Infrastructure
*   **Core Framework:** Astro
*   **Documentation/Routing Theme:** Starlight (utilized for its MDX support and organization).
*   **Styling:** Tailwind CSS (crucial for overriding default Starlight documentation layouts on key pages to create impressive, visually distinct UI components).
*   **Content Formatting:** Markdown / MDX.
*   **Hosting:** GitHub Pages.
*   **Version Control:** GitHub / Forgejo (optimized for AI-assisted file changes and commits).

## 3. Developer Directives (Note to Claude)
*   **Independent Research Required:** You must conduct your own web searches/research to gather accurate background information and context on **The REFINERY** to draft the initial placeholder copy and site content.
*   **Layout Customization:** Because Starlight defaults to a documentation-style layout (with sidebars), you are expected to use Astro and Tailwind CSS to build custom layouts for the non-documentation pages (e.g., Home, Projects, Apps). These pages require rich visual elements, such as **hero cards, full-bleed images, and dynamic grid layouts**.
*   **Content Mix:** The site must effortlessly balance highly visual, marketing-style pages with dense, informative text pages (for blog posts, mentor resources, and documentation).

## 4. Sitemap & Page Requirements

### **1. Home**
*   **Purpose:** The main landing page. Introduces The REFINERY and its mission as a FIRST-focused makerspace.
*   **Features:** Impressive visual hero section, high-quality imagery, and summary cards linking to the Blog, Projects, and Apps.

### **2. Apps**
*   **Purpose:** A directory of software applications and sister tools built by or associated with the makerspace.
*   **Content:** Must scale for future additions. Initially, it will feature **TIMS**, with a prominent external link pointing to: `tims.bionanomics.com`.

### **3. Projects**
*   **Purpose:** A portfolio showcasing hands-on engineering and robotics projects (e.g., Robot in 3 Days builds, FRC mechanisms, makerspace creations).
*   **Features:** Grid layout using Tailwind CSS cards, utilizing rich imagery and brief summaries that click through to detailed MDX pages.

### **4. Blog & Resources**
*   **Purpose:** A hub for updates, news, and dense informative content.
*   **Content Categories:** 
    *   Upcoming events and announcements.
    *   Informative resources and guides for FRC mentors.
    *   Highlighted GitHub repositories and technical deep-dives.

### **5. Contact**
*   **Purpose:** Simple connection point. 
*   **Content:** No backend forms required. Prominently display the primary contact email: `refinery@bionanomics.com`.

## 5. Design & Asset Guidelines
*   **Branding:** Logos will be provided by the client in the repository.
*   **Imagery:** For placeholder and initial development imagery, source appropriate FIRST Robotics photos from the **FIRST Indiana Flickr Account**: [https://www.flickr.com/photos/indianafirst/albums/](https://www.flickr.com/photos/indianafirst/albums/).
*   **Styling Tone:** Modern, technical, clean, and impressive. Utilize Tailwind to create depth (shadows, hover effects on cards) and ensure perfect mobile responsiveness.

## 6. Execution Milestones
1.  **Project Initialization:** Scaffold the Astro + Starlight + Tailwind project. Configure for GitHub Pages deployment.
2.  **UI/Layout Development:** Build the custom Astro page templates for the Home, Apps, and Projects pages, bypassing Starlight's default sidebar where appropriate.
3.  **Content Population:** Conduct research on The REFINERY and populate the MDX files with initial draft copy and placeholder images from the provided Flickr link.
4.  **Review & Refine:** Hand over the repository to the client for Git-based adjustments.