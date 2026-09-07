/**
 * Career and education source: public/Resume.pdf (February 24, 2025).
 * Project descriptions verified against the public repository READMEs:
 * https://github.com/r-cz/iam-tools
 * https://github.com/r-cz/dsconfig-helper
 * Project content is rendered locally; no GitHub request is made by visitors.
 */
const linkArrow =
  '<svg class="link-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10"/></svg>'

export function renderPortfolio(): string {
  return `
    <header class="portfolio-header">
      <a class="portfolio-wordmark" href="#portfolio" aria-label="Ryan Cruz, portfolio home">Ryan Cruz</a>
      <nav class="portfolio-nav" aria-label="Portfolio sections">
        <a href="#about">About</a>
        <a href="#experience">Experience</a>
        <a href="#projects">Projects</a>
        <a href="#education">Education</a>
      </nav>
    </header>

    <div class="portfolio-intro">
      <div class="portfolio-intro-copy">
        <h1>Ryan Cruz.</h1>
        <p class="portfolio-role">Senior Cybersecurity Engineer</p>
        <p class="portfolio-intro-description">I build identity and access solutions at Southwest Airlines.<br> Based in Dallas. Usually thinking about what’s next.</p>
        <div class="portfolio-intro-links">
          <a href="/Resume.pdf">Résumé ${linkArrow}</a>
          <a href="mailto:mail@ryancruz.com">Get in touch ${linkArrow}</a>
        </div>
        <p class="portfolio-location">Dallas, Texas · Home airport: DAL</p>
      </div>
    </div>

    <section class="portfolio-section" id="about" aria-labelledby="about-heading">
      <div class="section-heading">
        <p class="portfolio-kicker">01</p>
        <h2 id="about-heading">About</h2>
      </div>
      <div class="section-copy">
        <p>I’m a cybersecurity engineer specializing in identity and access management. My work spans enterprise and customer identity: designing systems, moving beyond legacy platforms, and helping people get where they need to go securely.</p>
        <p>At Southwest, that means working on identity for customers and employees. Before that, I helped people untangle technical problems at Apple and built tools to make everyday work a little easier.</p>
        <p>Outside of work, you’ll find me exploring somewhere new, out on a trail, watching a film, or tinkering in my homelab.</p>
      </div>
    </section>

    <section class="portfolio-section" id="experience" aria-labelledby="experience-heading">
      <div class="section-heading">
        <p class="portfolio-kicker">02</p>
        <h2 id="experience-heading">Experience</h2>
      </div>
      <ol class="experience-list">
        <li class="experience-row">
          <div class="experience-company"><h3>Southwest Airlines</h3><span>Dallas, Texas</span></div>
          <div class="experience-detail">
            <p class="experience-role">Senior Cybersecurity Engineer</p>
            <p class="experience-date">Aug 2018 — Present</p>
            <p>Building a modern identity solution for Southwest.com customers. Helped migrate enterprise sign-in to a new identity provider, enabling SSO and MFA for more than 70,000 employees across hundreds of applications.</p>
            <p>Previously supported Southwest’s cybersecurity technologies on the Cybersecurity Operations team.</p>
          </div>
        </li>
        <li class="experience-row">
          <div class="experience-company"><h3>Apple</h3><span>Athens, Georgia</span></div>
          <div class="experience-detail">
            <p class="experience-role">Mac+ Technical Advisor</p>
            <p class="experience-date">Sep 2016 — May 2018</p>
            <p>Provided technical support across Mac, iPhone, and Apple Watch, including identity and access issues with Apple ID, iCloud, and iTunes accounts.</p>
          </div>
        </li>
        <li class="experience-row">
          <div class="experience-company"><h3>Equifax</h3><span>Alpharetta, Georgia</span></div>
          <div class="experience-detail">
            <p class="experience-role">IT Asset Management Intern</p>
            <p class="experience-date">Aug 2017 — May 2018</p>
            <p>Developed software to enrich an asset management library with information about unrecognized applications. Served as project manager for this University of Georgia engineering capstone.</p>
          </div>
        </li>
        <li class="experience-row">
          <div class="experience-company"><h3>INP North America</h3><span>Alpharetta, Georgia</span></div>
          <div class="experience-detail">
            <p class="experience-role">IT Intern</p>
            <p class="experience-date">Aug 2013 — Aug 2014</p>
            <p>Supported employees and office infrastructure with local and remote technical support. Automated recurring Excel and PowerPoint tasks with Visual Basic.</p>
          </div>
        </li>
      </ol>
    </section>

    <section class="portfolio-section" id="projects" aria-labelledby="projects-heading">
      <div class="section-heading">
        <p class="portfolio-kicker">03</p>
        <h2 id="projects-heading">Projects</h2>
      </div>
      <div class="project-list">
        <article class="project-row">
          <p class="project-type">Web application · TypeScript</p>
          <h3><a href="https://github.com/r-cz/iam-tools">IAM Tools ${linkArrow}</a></h3>
          <p>A collection of tools for understanding and debugging identity systems. Inspect JWTs, explore OIDC providers, walk through OAuth flows, and work with SAML, LDAP, and SCIM.</p>
          <a class="project-link" href="https://github.com/r-cz/iam-tools">Explore the repository ${linkArrow}</a>
        </article>
        <article class="project-row">
          <p class="project-type">VS Code extension · PingDirectory</p>
          <h3><a href="https://github.com/r-cz/dsconfig-helper">.dsconfig Helper ${linkArrow}</a></h3>
          <p>Language support for PingDirectory configuration files, with syntax highlighting and snippets for common configuration tasks.</p>
          <a class="project-link" href="https://github.com/r-cz/dsconfig-helper">Explore the repository ${linkArrow}</a>
        </article>
      </div>
    </section>

    <section class="portfolio-section" id="education" aria-labelledby="education-heading">
      <div class="section-heading">
        <p class="portfolio-kicker">04</p>
        <h2 id="education-heading">Education</h2>
      </div>
      <div class="education-detail">
        <h3>University of Georgia</h3>
        <p class="education-degree">B.S. in Computer Systems Engineering</p>
        <p class="experience-date">Aug 2014 — May 2018 · Athens, Georgia</p>
        <p>Zell Miller Scholarship recipient and Presidential Scholar. Completed the Emerging Engineering Leaders Development Program certificate.</p>
      </div>
    </section>

    <footer class="portfolio-footer">
      <div class="portfolio-footer-copy"><a class="contact-link" href="mailto:mail@ryancruz.com">Get in touch ${linkArrow}</a></div>
      <nav class="portfolio-contact" aria-label="Contact and profiles">
        <a href="mailto:mail@ryancruz.com">Email ${linkArrow}</a>
        <a href="https://github.com/r-cz">GitHub ${linkArrow}</a>
        <a href="https://linkedin.com/in/cruzryan">LinkedIn ${linkArrow}</a>
        <a href="/Resume.pdf">Résumé ${linkArrow}<small>PDF · February 2025</small></a>
      </nav>
      <div class="portfolio-colophon"><span>Ryan Cruz · Dallas, Texas</span></div>
    </footer>
  `
}
