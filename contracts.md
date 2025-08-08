# RPG Game API Contracts

## 1. API Endpoints

### 1.1 Character Management
- `GET /api/character/{user_id}` - Get character data
- `PUT /api/character/{user_id}` - Update character stats/level/gold
- `POST /api/character/level-up/{user_id}` - Level up character

### 1.2 Inventory System  
- `GET /api/inventory/{user_id}` - Get player inventory
- `POST /api/inventory/{user_id}/add` - Add item to inventory
- `DELETE /api/inventory/{user_id}/item/{item_id}` - Remove/use item
- `PUT /api/inventory/{user_id}/equip/{item_id}` - Equip item

### 1.3 Combat System
- `GET /api/enemies` - Get all available enemies  
- `POST /api/battle/start` - Start battle with enemy
- `POST /api/battle/action` - Perform battle action (attack, defend, etc.)
- `GET /api/battle/status/{battle_id}` - Get current battle status

### 1.4 Quest System
- `GET /api/quests/{user_id}` - Get player quests
- `POST /api/quests/{user_id}/accept/{quest_id}` - Accept new quest
- `PUT /api/quests/{user_id}/progress/{quest_id}` - Update quest progress
- `POST /api/quests/{user_id}/complete/{quest_id}` - Complete quest

### 1.5 Shop System
- `GET /api/shop/items` - Get shop items
- `POST /api/shop/buy` - Buy item from shop
- `POST /api/shop/sell` - Sell item to shop

## 2. MongoDB Schema Design

### 2.1 Character Collection
```json
{
  "_id": "user_id",
  "name": "Kalandor", 
  "level": 12,
  "experience": 2400,
  "experienceToNext": 3000,
  "gold": 850,
  "health": 100,
  "maxHealth": 100,
  "mana": 75,
  "maxMana": 75,
  "stats": {
    "strength": 18,
    "dexterity": 14,
    "intelligence": 16,
    "constitution": 15,
    "wisdom": 12,
    "charisma": 10
  },
  "equipment": {
    "weapon": "item_id",
    "armor": "item_id", 
    "helmet": "item_id",
    "boots": "item_id",
    "accessory": "item_id"
  },
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### 2.2 Inventory Collection
```json
{
  "_id": "inventory_id",
  "userId": "user_id",
  "items": [
    {
      "itemId": "item_id",
      "quantity": 5,
      "equipped": false
    }
  ]
}
```

### 2.3 Items Collection  
```json
{
  "_id": "item_id",
  "name": "Lángoló Kard",
  "type": "weapon", // weapon, armor, consumable, misc
  "rarity": "rare", // common, uncommon, rare, epic, legendary
  "damage": 15,
  "defense": 0,
  "effect": "heal",
  "value": 50,
  "price": 200,
  "description": "Powerful flaming sword"
}
```

### 2.4 Enemies Collection
```json
{
  "_id": "enemy_id",
  "name": "Goblin Harcos",
  "level": 8,
  "health": 60,
  "maxHealth": 60,
  "attack": 12,
  "defense": 5,
  "experience": 120,
  "goldReward": 25,
  "image": "🧌"
}
```

### 2.5 Quests Collection
```json
{
  "_id": "quest_id", 
  "title": "Goblin Fenyegetés",
  "description": "Győzz le 5 goblin harcost",
  "type": "kill", // kill, collect, level
  "target": "Goblin Harcos",
  "required": 5,
  "reward": {
    "experience": 500,
    "gold": 100,
    "item": "item_id"
  },
  "isActive": true
}
```

### 2.6 Player Quests Collection
```json
{
  "_id": "player_quest_id",
  "userId": "user_id", 
  "questId": "quest_id",
  "progress": 3,
  "completed": false,
  "active": true,
  "startedAt": "timestamp"
}
```

### 2.7 Battles Collection
```json
{
  "_id": "battle_id",
  "userId": "user_id",
  "enemyId": "enemy_id", 
  "playerHealth": 100,
  "enemyHealth": 60,
  "isPlayerTurn": true,
  "battleEnded": false,
  "victory": false,
  "battleLog": [],
  "createdAt": "timestamp"
}
```

## 3. Mock Data Replacement Plan

### 3.1 Frontend Mock Files to Replace:
- `mockCharacter` → API call to `/api/character/{user_id}`
- `mockInventory` → API call to `/api/inventory/{user_id}` 
- `mockEnemies` → API call to `/api/enemies`
- `mockQuests` → API call to `/api/quests/{user_id}`
- `mockShopItems` → API call to `/api/shop/items`

### 3.2 State Management Updates:
- Replace useState with actual API calls
- Add loading states for API requests
- Implement error handling for failed requests
- Add optimistic updates for better UX

## 4. Frontend-Backend Integration

### 4.1 Character Sheet Component:
- Load character data on component mount
- Update character stats after battle/level up
- Sync equipment changes with backend

### 4.2 Inventory Component:
- Load inventory on tab switch
- Sync item usage/selling with backend
- Update equipment when items are equipped

### 4.3 Combat Component:
- Start battle creates battle session
- Each action updates battle state
- End battle updates character XP/gold

### 4.4 Quest Component:
- Load user quests with progress
- Update progress after actions
- Complete quests and claim rewards

### 4.5 Shop Component:
- Load shop items
- Handle purchases with gold validation
- Update character gold after transactions

## 5. Implementation Priority

1. **Database setup** - Create collections and sample data
2. **Character API** - Basic character CRUD
3. **Inventory API** - Item management  
4. **Shop API** - Buy/sell functionality
5. **Quest API** - Quest progression
6. **Battle API** - Combat system
7. **Frontend integration** - Replace mock data
8. **Error handling** - Add proper error responses
9. **Validation** - Input validation and sanitization

## 6. User Session Management

- For now, use hardcoded user_id = "player1"
- Later can be extended with proper authentication
- All API calls will use this user_id for data isolation