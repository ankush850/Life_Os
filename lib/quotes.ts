export interface Quote {
  text: string;
  author: string;
}

export interface Wallpaper {
  url: string;
  title: string;
  credit: string;
}

export const MOTIVATIONAL_QUOTES: Quote[] = [
  {
    text: "First, solve the problem. Then, write the code.",
    author: "John Johnson",
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
  },
  {
    text: "Clean code always looks like it was written by someone who cares.",
    author: "Michael Feathers",
  },
  {
    text: "Focus on being productive instead of busy.",
    author: "Tim Ferriss",
  },
  {
    text: "Simplicity is the soul of efficiency.",
    author: "Austin Freeman",
  },
  {
    text: "Make it work, make it right, make it fast.",
    author: "Kent Beck",
  },
  {
    text: "Code is like humor. When you have to explain it, it’s bad.",
    author: "Cory House",
  },
  {
    text: "The best way to predict the future is to invent it.",
    author: "Alan Kay",
  },
  {
    text: "Your talent determines what you can do. Your motivation determines how much you are willing to do.",
    author: "Lou Holtz",
  },
  {
    text: "Small daily improvements over time lead to stunning results.",
    author: "Robin Sharma",
  },
  {
    text: "Continuous improvement is better than delayed perfection.",
    author: "Mark Twain",
  },
  {
    text: "Amateurs sit and wait for inspiration, the rest of us just get up and go to work.",
    author: "Stephen King",
  },
];

export const PRESET_WALLPAPERS: Wallpaper[] = [
  {
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80",
    title: "Yosemite Valley",
    credit: "Anneliese Phillips",
  },
  {
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1920&q=80",
    title: "Sunlit Forest",
    credit: "John Towner",
  },
  {
    url: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=1920&q=80",
    title: "Galaxy Night Sky",
    credit: "Vincentiu Solomon",
  },
  {
    url: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=1920&q=80",
    title: "Minimalist Workspace",
    credit: "Domenico Loia",
  },
  {
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80",
    title: "Tropical Shoreline",
    credit: "Sean Oulashin",
  },
  {
    url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1920&q=80",
    title: "Technological Grid",
    credit: "Alexandre Debiève",
  },
  {
    url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1920&q=80",
    title: "Cyberpunk Setup",
    credit: "Ella Don",
  },
  {
    url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80",
    title: "Team Collaborative Desk",
    credit: "Annie Spratt",
  },
];

export function getRandomQuote(): Quote {
  const index = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
  return MOTIVATIONAL_QUOTES[index];
}

export function getRandomWallpaper(): Wallpaper {
  const index = Math.floor(Math.random() * PRESET_WALLPAPERS.length);
  return PRESET_WALLPAPERS[index];
}

export interface Combo {
  quote: Quote;
  wallpaper: Wallpaper;
}

export function getRandomCombo(): Combo {
  return {
    quote: getRandomQuote(),
    wallpaper: getRandomWallpaper(),
  };
}
