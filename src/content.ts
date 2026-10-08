/**
 * Career and education source: public/Resume.pdf (February 24, 2025).
 * Projects: https://martenldap.com and the public READMEs for
 * https://github.com/r-cz/iam-tools and https://github.com/r-cz/dsconfig-helper.
 * Content is prerendered; visitors make no GitHub requests.
 */
export const profile = {
  name: 'Ryan Cruz',
  role: 'Identity engineer',
  email: 'mail@ryancruz.com',
  links: [
    { label: 'GitHub', href: 'https://github.com/r-cz' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/cruzryan' },
    { label: 'Résumé', href: '/Resume.pdf' },
  ],
}

export const projects = [
  {
    name: 'Marten',
    description: 'A native LDAP browser for Mac.',
    href: 'https://martenldap.com',
  },
  {
    name: 'IAM Tools',
    description: 'Inspect JWTs, OIDC providers, OAuth flows and SAML in the browser.',
    href: 'https://iam-tools.racruz7.workers.dev',
  },
  {
    name: '.dsconfig Helper',
    description: 'PingDirectory configuration support for VS Code.',
    href: 'https://github.com/r-cz/dsconfig-helper',
  },
]

export const experience = [
  { years: '2018 — Now', role: 'Senior Cybersecurity Engineer', org: 'Southwest Airlines' },
  { years: '2016 — 2018', role: 'Mac+ Technical Advisor', org: 'Apple' },
]

export const education = {
  years: '2014 — 2018',
  degree: 'B.S. Computer Systems Engineering',
  school: 'University of Georgia',
}
