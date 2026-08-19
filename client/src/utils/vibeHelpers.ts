import { DateCategory, DateVibe } from '../types/place';

export const DATE_VIBE_LIST: DateVibe[] = [
  'All Vibes',
  'First Date Friendly',
  'Cozy & Quiet',
  'Romantic & Dimly Lit',
  'Lively & Fun',
  'Scenic View',
  'Budget-Friendly ($)',
  'Special Occasion ($$$)'
];

export const CATEGORY_OPTIONS: { id: DateCategory | 'all'; label: string; iconName: string; description: string }[] = [
  { id: 'all', label: 'All Spots', iconName: 'Sparkles', description: 'Explore all cozy spots, dining & drinks' },
  { id: 'cafe', label: 'Cafes & Coffee', iconName: 'Coffee', description: 'Quiet coffee spots & artisan pastries' },
  { id: 'restaurant', label: 'Dining & Bistros', iconName: 'UtensilsCrossed', description: 'Atmospheric dining & evening meals' },
  { id: 'rooftop', label: 'Rooftops & Bars', iconName: 'Wine', description: 'Panoramic skyline views & craft drinks' },
  { id: 'dessert', label: 'Desserts & Sweets', iconName: 'Cake', description: 'Gelato, churros & sweet treats' },
  { id: 'mall', label: 'Mall Hubs', iconName: 'Store', description: 'Terrace dining & lifestyle hubs' },
  { id: 'scenic', label: 'Scenic Spots', iconName: 'TreePine', description: 'Promenades & garden pavilions' }
];

export function getVibeBadgeColor(vibe?: string): string {
  if (!vibe) return 'bg-[#F4E3DC] text-[#5C2619] border-[#E2CCC1]';
  const lower = vibe.toLowerCase();
  
  // Sage green: Cozy & Quiet
  if (lower.includes('cozy') || lower.includes('quiet')) {
    return 'bg-[#E5E9D8] text-[#3B4228] border-[#CAD1B8]';
  }
  // Blush / Dusty Rose: Romantic & First Date
  if (lower.includes('romantic') || lower.includes('dimly') || lower.includes('first date')) {
    return 'bg-[#F4E3DC] text-[#5C2619] border-[#E2CCC1]';
  }
  // Sand / Warm Amber: Scenic & Special Occasion
  if (lower.includes('scenic') || lower.includes('view') || lower.includes('special') || lower.includes('occasion')) {
    return 'bg-[#F7EAD7] text-[#573514] border-[#E8D4BB]';
  }
  // Dusty Blue / Slate: Lively & Fun / Budget
  if (lower.includes('lively') || lower.includes('fun') || lower.includes('budget')) {
    return 'bg-[#E2EAF2] text-[#1F3D59] border-[#C2D4E4]';
  }
  
  return 'bg-[#F4E3DC] text-[#5C2619] border-[#E2CCC1]';
}

export function getDefaultImageForCategory(category?: string): string {
  if (!category) return 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80';
  const lower = category.toLowerCase();
  if (lower.includes('cafe') || lower.includes('coffee')) {
    return 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80';
  }
  if (lower.includes('rooftop') || lower.includes('bar') || lower.includes('wine')) {
    return 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80';
  }
  if (lower.includes('dessert') || lower.includes('bakery') || lower.includes('ice_cream')) {
    return 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80';
  }
  if (lower.includes('mall')) {
    return 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80';
  }
  if (lower.includes('scenic') || lower.includes('park')) {
    return 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80';
  }
  return 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80';
}
