import type { DesignMeta } from '../types';

export default {
  id: 'raft',
  name: 'Raft',
  tagline: 'Dark, technical, product-grade',
  intent:
    'A raft is a group of otters floating together, and this design treats the fleet the same way: one well-run system. It presents LinuxServer.io as serious infrastructure, with a dashboard of live-feeling numbers, terminal-style quick starts and precise, data-dense pages that let engineers trust an image at a glance.',
  traits: [
    'Dark by default with a considered light mode; Geist for UI and Geist Mono for every number, version and date',
    'Homepage leads with a stats dashboard: Hub pulls, monthly pulls, rebuilds this week, arm64 coverage and a top-10 chart',
    'Image pages read like a spec sheet, with a pull command, compose/run quick start, parameter tables and a changelog timeline',
    'The logo gradient is used as light (glows and hover edges), never as text; all text meets WCAG AAA contrast',
  ],
  swatch: ['#0b0913', '#13111e', '#ff79b2', '#7142b7', '#4179d4', '#eeecf5'],
} satisfies DesignMeta;
