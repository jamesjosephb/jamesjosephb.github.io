/**
 * Captions and alt text for /work/finance-sync/. Source: professional-portfolio/handoff/finance-sync/brief.md.
 * Every image on that page comes from a demo database of made-up data.
 */

type Caption = { alt: string; caption: string };

export const gallery: Record<string, Caption> = {
  categories: {
    alt: 'Spending by category, money in against spending for five months, and a table of recurring bills.',
    caption: 'Spending by category against the three-month average, and recurring bills with a status for the month.',
  },
  search: {
    alt: 'Transaction search for the word grocer with a date range, showing 18 results and their totals.',
    caption: 'Search with filters, and totals for everything that matched.',
  },
  detail: {
    alt: 'One transaction with its category changed to Groceries, a note, and a change history.',
    caption:
      'A transaction with a corrected category and a note. The change history records who changed what, and how they were signed in.',
  },
  report: {
    alt: 'The top of the monthly report: key figures, highlights, income against spending, and fixed against flexible spending.',
    caption: 'The monthly report: one self-contained HTML file with no scripts, also printed to PDF.',
  },
};

/** Section 03: the design decisions, each with what it costs. */
export const decisions = [
  {
    decision: 'A SQLite file in a folder outside the repository',
    why: 'One household needs no database server, a backup is a file copy, and the data cannot be committed by accident',
    tradeoff: 'One writer at a time, so writes are short and the web app asks the browser to retry while a sync is writing',
  },
  {
    decision: 'One shared library for storage and the report model',
    why: 'The report, the web app and Claude all give the same numbers',
    tradeoff: 'A change there affects both apps, so both test suites cover it',
  },
  {
    decision: 'The web app listens locally, and a private network provides HTTPS and reach',
    why: 'Nothing is exposed to the internet, and the app handles no certificates',
    tradeoff: 'Only devices on the private network can use it. Claude on a phone or on the web cannot reach it',
  },
  {
    decision: 'The connector is a local program that calls the API with a read-only key',
    why: 'The API stays the only gate to the data, and the connector cannot change anything',
    tradeoff: 'It has to be installed on each computer, and adding write tools would need a new review',
  },
  {
    decision: 'Reports are static files: HTML without JavaScript, a spreadsheet without formulas, and a PDF',
    why: 'They are safe to email and open anywhere',
    tradeoff: 'The PDF step needs a browser installed. Without one, the other two files are still written',
  },
  {
    decision: 'Sign-in data lives in its own database',
    why: 'Credentials and financial history are stored and backed up separately',
    tradeoff: 'Two files to back up',
  },
];

export const phone: Caption = {
  alt: 'The monthly overview on a phone.',
  caption: 'The overview on a phone.',
};
