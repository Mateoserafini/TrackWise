export const DAYS_OF_WEEK = [
  { id: 1, label: 'L', name: 'Lunes' },
  { id: 2, label: 'M', name: 'Martes' },
  { id: 3, label: 'M', name: 'Miércoles' },
  { id: 4, label: 'J', name: 'Jueves' },
  { id: 5, label: 'V', name: 'Viernes' },
  { id: 6, label: 'S', name: 'Sábado' },
  { id: 0, label: 'D', name: 'Domingo' },
];

export const COLOR_PALETTE = [
  { name: 'Coral Red', hex: '#FC2626' },
  { name: 'Emerald Volt', hex: '#10B981' },
  { name: 'Cobalt Neon', hex: '#3B82F6' },
  { name: 'Amber Gold', hex: '#F59E0B' },
  { name: 'Electric Violet', hex: '#8B5CF6' },
  { name: 'Hot Pink', hex: '#EC4899' },
  { name: 'Cyan Frost', hex: '#06B6D4' },
  { name: 'Timberwolf', hex: '#DAD6CF' },
  { name: 'Lime Acid', hex: '#84CC16' },
  { name: 'Indigo Deep', hex: '#6366F1' },
  { name: 'Teal Shadow', hex: '#14B8A6' },
  { name: 'Rose Red', hex: '#F43F5E' },
  { name: 'Orange Flash', hex: '#F97316' },
  { name: 'Purple Core', hex: '#A855F7' },
  { name: 'Silver Muted', hex: '#94A3B8' },
  { name: 'Raisin Charcoal', hex: '#323232' },
];

export const ICON_CATEGORIES = {
  Finanzas: [
    'Wallet', 'CreditCard', 'PiggyBank', 'DollarSign', 'Coins', 'TrendingUp', 'TrendingDown',
    'Receipt', 'Briefcase', 'Banknote', 'Building2', 'Percent'
  ],
  Alimentación: [
    'Utensils', 'Coffee', 'Pizza', 'Apple', 'Beer', 'Wine', 'CupSoda', 'ShoppingBag'
  ],
  Movilidad: [
    'Bus', 'Car', 'Bike', 'Fuel', 'Plane', 'Train', 'Ship', 'MapPin'
  ],
  Hogar: [
    'Home', 'Zap', 'Droplets', 'Wifi', 'Tv', 'Bed', 'Tool', 'Shield'
  ],
  Salud: [
    'HeartPulse', 'Dumbbell', 'Pill', 'Activity', 'Footprints', 'Flame', 'Brain', 'Smile'
  ],
  Ocio: [
    'Gamepad2', 'Film', 'Music', 'Headphones', 'Camera', 'BookOpen', 'Ticket', 'Gift'
  ],
  Productividad: [
    'CheckCircle2', 'Target', 'Clock', 'Calendar', 'Sun', 'Moon', 'Code', 'Terminal', 'Sparkles'
  ],
};

export const ALL_ICONS = Object.values(ICON_CATEGORIES).flat();
