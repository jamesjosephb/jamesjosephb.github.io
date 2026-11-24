// @ts-check
import { defineEcConfig } from 'astro-expressive-code';

// Code frames (editor / terminal) for MDX and <Code>. Colours follow the site theme, which is dark by default:
// the first theme (dark) is the base, and the light one applies under [data-theme="light"].
export default defineEcConfig({
  themes: ['github-dark', 'github-light'],
  useDarkModeMediaQuery: false,
  themeCssSelector: (theme) => `[data-theme="${theme.type}"]`,
  styleOverrides: {
    borderRadius: '12px',
    borderColor: 'var(--border)',
    codeFontFamily: 'var(--font-mono), ui-monospace, monospace',
    codeFontSize: '0.875rem',
    uiFontFamily: 'var(--font-text), system-ui, sans-serif',
    frames: {
      shadowColor: 'transparent',
      editorActiveTabIndicatorTopColor: '#1B5E9E',
      editorActiveTabIndicatorBottomColor: 'transparent',
    },
  },
});
