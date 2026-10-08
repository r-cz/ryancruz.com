/**
 * Career and education source: public/Resume.pdf (February 24, 2025).
 * Project descriptions verified against the public repository READMEs:
 * https://github.com/r-cz/iam-tools
 * https://github.com/r-cz/dsconfig-helper
 * Content is prerendered; visitors make no GitHub requests.
 */
export const profile = {
  name: 'Ryan Cruz',
  role: 'Senior Cybersecurity Engineer',
  lede: 'I build identity and access solutions at Southwest Airlines. Based in Dallas, usually thinking about what’s next.',
  links: [
    { label: 'Email', href: 'mailto:mail@ryancruz.com' },
    { label: 'GitHub', href: 'https://github.com/r-cz' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/cruzryan' },
    { label: 'Résumé', href: '/Resume.pdf' },
  ],
  about: [
    'I’m a cybersecurity engineer specializing in identity and access management. My work spans enterprise and customer identity: designing systems, moving beyond legacy platforms, and helping people get where they need to go securely.',
    'Before Southwest, I helped people untangle technical problems at Apple and built tools to make everyday work a little easier. Outside of work, you’ll find me exploring somewhere new, out on a trail, watching a film, or tinkering in my homelab.',
  ],
}

export const projects = [
  {
    name: 'IAM Tools',
    kind: 'Web app · TypeScript',
    description:
      'A collection of tools for understanding and debugging identity systems. Inspect JWTs, explore OIDC providers, walk through OAuth flows, and work with SAML, LDAP, and SCIM.',
    href: 'https://github.com/r-cz/iam-tools',
    live: 'https://iam-tools.racruz7.workers.dev',
  },
  {
    name: '.dsconfig Helper',
    kind: 'VS Code extension · PingDirectory',
    description:
      'Language support for PingDirectory configuration files, with syntax highlighting and snippets for common configuration tasks.',
    href: 'https://github.com/r-cz/dsconfig-helper',
  },
]

export const experience = [
  {
    years: '2018 — Now',
    role: 'Senior Cybersecurity Engineer',
    org: 'Southwest Airlines',
    note: 'Building a modern identity solution for Southwest.com customers. Helped migrate enterprise sign-in to a new identity provider, enabling SSO and MFA for more than 70,000 employees across hundreds of applications.',
  },
  {
    years: '2016 — 2018',
    role: 'Mac+ Technical Advisor',
    org: 'Apple',
    note: 'Technical support across Mac, iPhone and Apple Watch, including identity and access issues with Apple ID, iCloud and iTunes accounts.',
  },
  {
    years: '2017 — 2018',
    role: 'IT Asset Management Intern',
    org: 'Equifax',
    note: 'Project manager for a University of Georgia engineering capstone that enriched an asset management library with data on unrecognized applications.',
  },
  {
    years: '2013 — 2014',
    role: 'IT Intern',
    org: 'INP North America',
    note: 'Local and remote technical support, plus Visual Basic automation for recurring Excel and PowerPoint tasks.',
  },
]

export const education = {
  years: '2014 — 2018',
  degree: 'B.S. Computer Systems Engineering',
  school: 'University of Georgia',
  note: 'Zell Miller Scholarship recipient and Presidential Scholar.',
}
