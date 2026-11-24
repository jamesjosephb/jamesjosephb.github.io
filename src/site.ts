export const SITE = {
  name: 'James Burch',
  title: 'James Burch · Tech lead, AI agent engineering',
  description:
    'James Burch is a senior software engineer and tech lead who builds GitHub Copilot agents for engineering teams and fintech money-movement APIs in .NET and Angular.',
  jobTitle: 'Senior Software Engineer, Tech Lead',
  employer: 'Charles Schwab',
  linkedin: 'https://www.linkedin.com/in/jamesjosephburch',
  github: 'https://github.com/jamesjosephb',
  source: 'https://github.com/jamesjosephb/jamesjosephb.github.io',
  resumePdf: '/James-Burch-Resume.pdf',
  ogImage: '/og/home.png',
  /** Split so the address isn't in the HTML as one string; Footer joins it with JS. */
  email: { user: 'burchjames90', domain: 'gmail.com' },
};

/** Writing stays out of the nav until the first post is published. */
export const SHOW_WRITING = false;

export const NAV = [
  { href: '/work/', label: 'Work', match: '/work/' },
  { href: '/about/', label: 'About', match: '/about/' },
  ...(SHOW_WRITING ? [{ href: '/writing/', label: 'Writing', match: '/writing/' }] : []),
];
