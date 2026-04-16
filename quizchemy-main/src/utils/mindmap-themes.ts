/**
 * Mind Map Theme Configurations
 */

export interface MindMapTheme {
  id: string;
  name: string;
  colors: {
    root: string;
    level1: string;
    level2: string;
    level3: string;
    level4: string;
    text: string;
    link: string;
    background: string;
  };
}

export const mindMapThemes: MindMapTheme[] = [
  {
    id: 'default',
    name: 'Indigo Sunset',
    colors: {
      root: '#1d1b6a',
      level1: '#4f46e5',
      level2: '#7ea6f6',
      level3: '#f97316',
      level4: '#f1a2a7',
      text: '#1e293b',
      link: '#3b82f6',
      background: '#ffffff',
    },
  },
  {
    id: 'berry-mint',
    name: 'Berry Mint',
    colors: {
      root: '#6b3148',
      level1: '#f05b37',
      level2: '#35b48a',
      level3: '#6aa8df',
      level4: '#c6c6bb',
      text: '#1e293b',
      link: '#75b1c6',
      background: '#ffffff',
    },
  },
  {
    id: 'graphite-pastel',
    name: 'Graphite Pastel',
    colors: {
      root: '#292d33',
      level1: '#74b3e8',
      level2: '#d07be8',
      level3: '#f09a79',
      level4: '#9fe69a',
      text: '#1e293b',
      link: '#eadb8f',
      background: '#ffffff',
    },
  },
  {
    id: 'teal-pop',
    name: 'Teal Pop',
    colors: {
      root: '#0d9488',
      level1: '#c0d400',
      level2: '#f59e0b',
      level3: '#ff3131',
      level4: '#4259c6',
      text: '#1e293b',
      link: '#1992dd',
      background: '#ffffff',
    },
  },
  {
    id: 'forest-moss',
    name: 'Forest Moss',
    colors: {
      root: '#0b3b1d',
      level1: '#0e6e3a',
      level2: '#5f6f43',
      level3: '#3e9259',
      level4: '#b0a481',
      text: '#1e293b',
      link: '#c4c8ad',
      background: '#ffffff',
    },
  },
  {
    id: 'dusk-contrast',
    name: 'Dusk Contrast',
    colors: {
      root: '#3d3a56',
      level1: '#d6284f',
      level2: '#e7c500',
      level3: '#4f4aa8',
      level4: '#0f5ea8',
      text: '#1e293b',
      link: '#f1cf3a',
      background: '#ffffff',
    },
  },
  {
    id: 'ocean-citrus',
    name: 'Ocean Citrus',
    colors: {
      root: '#0f172a',
      level1: '#2563eb',
      level2: '#22c55e',
      level3: '#eab308',
      level4: '#fb7185',
      text: '#1e293b',
      link: '#06b6d4',
      background: '#ffffff',
    },
  },
  {
    id: 'plum-sun',
    name: 'Plum Sun',
    colors: {
      root: '#4c1d95',
      level1: '#a855f7',
      level2: '#f43f5e',
      level3: '#f59e0b',
      level4: '#10b981',
      text: '#1e293b',
      link: '#60a5fa',
      background: '#ffffff',
    },
  },
];

export const getThemeById = (themeId: string): MindMapTheme => {
  return mindMapThemes.find(t => t.id === themeId) || mindMapThemes[0];
};
