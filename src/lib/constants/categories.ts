import { Category } from '@/src/types';

export interface CategoryPreset {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export const DEFAULT_CATEGORY_PRESETS: CategoryPreset[] = [
  {
    id: 'cat-laptops',
    name: 'Laptops & Computers',
    icon: 'Laptop',
    color: '#3B82F6', // Blue
    description: 'Gaming rigs, ultrabooks, student laptops, keyboards & monitors',
  },
  {
    id: 'cat-tvs',
    name: 'Televisions & Displays',
    icon: 'Tv',
    color: '#8B5CF6', // Purple
    description: 'OLED, QLED, 4K Smart TVs, streaming dongles & soundbars',
  },
  {
    id: 'cat-acs',
    name: 'Air Conditioners',
    icon: 'Snowflake',
    color: '#06B6D4', // Cyan
    description: 'Split, Inverter, Window ACs and high-efficiency dual inverters',
  },
  {
    id: 'cat-refrigerators',
    name: 'Refrigerators',
    icon: 'ThermometerSnowflake',
    color: '#0D9488', // Teal
    description: 'Single door, double door, frost-free, multi-door refrigerators',
  },
  {
    id: 'cat-fans',
    name: 'Fans & Air Blowers',
    icon: 'Fan',
    color: '#10B981', // Emerald / Green
    description: 'BLDC high-speed ceiling fans, table fans, pedestal & exhaust fans',
  },
  {
    id: 'cat-smartphones',
    name: 'Smartphones & Tablets',
    icon: 'Smartphone',
    color: '#6366F1', // Indigo
    description: '5G Android flagships, iPhones, tablets, fast chargers & cases',
  },
  {
    id: 'cat-lights',
    name: 'Lamps & Smart Lighting',
    icon: 'Lightbulb',
    color: '#F59E0B', // Amber
    description: 'Smart LED bulbs, batten lights, ambient ceiling panels & strip lights',
  },
  {
    id: 'cat-coolers',
    name: 'Air Coolers',
    icon: 'Wind',
    color: '#0284C7', // Sky
    description: 'Desert coolers, personal honeycomb coolers, tower air coolers',
  },
  {
    id: 'cat-washers',
    name: 'Washing Machines',
    icon: 'WashingMachine',
    color: '#7C3AED', // Violet
    description: 'Front load, top load automatic, semi-automatic washers & dryers',
  },
  {
    id: 'cat-headphones',
    name: 'Headphones & Audio',
    icon: 'Headphones',
    color: '#F43F5E', // Rose
    description: 'Over-ear studio monitors, ANC wireless headphones & party speakers',
  },
  {
    id: 'cat-earbuds',
    name: 'TWS Earbuds & Wearables',
    icon: 'Ear',
    color: '#EC4899', // Pink
    description: 'True wireless stereo earbuds, smart fitness watches & bands',
  },
];

export const INITIAL_CATEGORIES: Category[] = DEFAULT_CATEGORY_PRESETS.map((cat, idx) => ({
  id: cat.id,
  businessId: 'biz-default',
  name: cat.name,
  icon: cat.icon,
  color: cat.color,
  isDefault: true,
  sortOrder: idx,
  description: cat.description,
}));
