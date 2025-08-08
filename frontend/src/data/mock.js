// Mock data for the RPG game

export const mockCharacter = {
  id: 1,
  name: "Kalandor",
  level: 12,
  experience: 2400,
  experienceToNext: 3000,
  gold: 850,
  health: 100,
  maxHealth: 100,
  mana: 75,
  maxMana: 75,
  stats: {
    strength: 18,
    dexterity: 14,
    intelligence: 16,
    constitution: 15,
    wisdom: 12,
    charisma: 10
  },
  equipment: {
    weapon: { id: 1, name: "Lángoló Kard", damage: 15, rarity: "rare" },
    armor: { id: 2, name: "Acél Páncél", defense: 12, rarity: "common" },
    helmet: { id: 3, name: "Harcos Sisak", defense: 5, rarity: "common" },
    boots: { id: 4, name: "Gyors Csizmák", speed: 3, rarity: "uncommon" },
    accessory: { id: 5, name: "Erő Gyűrűje", strength: 2, rarity: "rare" }
  }
};

export const mockInventory = [
  { id: 6, name: "Gyógyító Bájital", type: "consumable", effect: "heal", value: 50, quantity: 5, rarity: "common" },
  { id: 7, name: "Mana Bájital", type: "consumable", effect: "mana", value: 30, quantity: 3, rarity: "common" },
  { id: 8, name: "Vas Kard", type: "weapon", damage: 10, quantity: 1, rarity: "common" },
  { id: 9, name: "Bőr Páncél", type: "armor", defense: 8, quantity: 1, rarity: "common" },
  { id: 10, name: "Titán Pajzs", type: "shield", defense: 15, quantity: 1, rarity: "epic" },
  { id: 11, name: "Varázslatos Kristály", type: "misc", value: 100, quantity: 2, rarity: "rare" },
  { id: 12, name: "Sárkány Pikkelye", type: "misc", value: 500, quantity: 1, rarity: "legendary" }
];

export const mockEnemies = [
  { 
    id: 1, 
    name: "Goblin Harcos", 
    level: 8, 
    health: 60, 
    maxHealth: 60, 
    attack: 12, 
    defense: 5,
    experience: 120,
    goldReward: 25,
    image: "🧌"
  },
  { 
    id: 2, 
    name: "Vad Farkas", 
    level: 10, 
    health: 80, 
    maxHealth: 80, 
    attack: 15, 
    defense: 3,
    experience: 150,
    goldReward: 30,
    image: "🐺"
  },
  { 
    id: 3, 
    name: "Koponya Mágus", 
    level: 15, 
    health: 120, 
    maxHealth: 120, 
    attack: 25, 
    defense: 8,
    experience: 300,
    goldReward: 75,
    image: "💀"
  },
  { 
    id: 4, 
    name: "Ősi Sárkány", 
    level: 25, 
    health: 300, 
    maxHealth: 300, 
    attack: 45, 
    defense: 20,
    experience: 1000,
    goldReward: 500,
    image: "🐲"
  }
];

export const mockQuests = [
  {
    id: 1,
    title: "Goblin Fenyegetés",
    description: "Győzz le 5 goblin harcost a falu védelmében",
    type: "kill",
    target: "Goblin Harcos",
    progress: 3,
    required: 5,
    reward: { experience: 500, gold: 100 },
    completed: false,
    active: true
  },
  {
    id: 2,
    title: "Ritka Tárgyak Gyűjtése",
    description: "Gyűjts össze 3 Varázslatos Kristályt",
    type: "collect",
    target: "Varázslatos Kristály",
    progress: 2,
    required: 3,
    reward: { experience: 300, gold: 200 },
    completed: false,
    active: true
  },
  {
    id: 3,
    title: "A Mágus Próbája",
    description: "Érj el 15. szintet",
    type: "level",
    progress: 12,
    required: 15,
    reward: { experience: 0, gold: 300, item: "Bölcsesség Amuletje" },
    completed: false,
    active: true
  }
];

export const mockShopItems = [
  { id: 13, name: "Acél Kard", type: "weapon", damage: 20, price: 200, rarity: "uncommon" },
  { id: 14, name: "Mithril Páncél", type: "armor", defense: 18, price: 400, rarity: "rare" },
  { id: 15, name: "Nagy Gyógyító Bájital", type: "consumable", effect: "heal", value: 100, price: 50, rarity: "uncommon" },
  { id: 16, name: "Erő Bájitala", type: "consumable", effect: "buff", value: 5, price: 75, rarity: "rare" },
  { id: 17, name: "Sárkány Kesztyű", type: "accessory", strength: 5, price: 800, rarity: "epic" },
  { id: 18, name: "Teleport Scroll", type: "consumable", effect: "teleport", price: 100, rarity: "uncommon" }
];

export const getRarityColor = (rarity) => {
  const colors = {
    common: "text-gray-600",
    uncommon: "text-green-600",
    rare: "text-blue-600",
    epic: "text-purple-600",
    legendary: "text-yellow-600"
  };
  return colors[rarity] || "text-gray-600";
};

export const getRarityBg = (rarity) => {
  const colors = {
    common: "bg-gray-100 border-gray-300",
    uncommon: "bg-green-50 border-green-300",
    rare: "bg-blue-50 border-blue-300",
    epic: "bg-purple-50 border-purple-300",
    legendary: "bg-yellow-50 border-yellow-300"
  };
  return colors[rarity] || "bg-gray-100 border-gray-300";
};