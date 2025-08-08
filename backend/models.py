from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime
from enum import Enum


class ItemType(str, Enum):
    weapon = "weapon"
    armor = "armor" 
    helmet = "helmet"
    boots = "boots"
    shield = "shield"
    accessory = "accessory"
    consumable = "consumable"
    misc = "misc"


class ItemRarity(str, Enum):
    common = "common"
    uncommon = "uncommon"
    rare = "rare"
    epic = "epic"
    legendary = "legendary"


class QuestType(str, Enum):
    kill = "kill"
    collect = "collect"
    level = "level"
    explore = "explore"


# Character Models
class CharacterStats(BaseModel):
    strength: int = 10
    dexterity: int = 10
    intelligence: int = 10
    constitution: int = 10
    wisdom: int = 10
    charisma: int = 10


class Equipment(BaseModel):
    weapon: Optional[str] = None
    armor: Optional[str] = None
    helmet: Optional[str] = None
    boots: Optional[str] = None
    accessory: Optional[str] = None


class Character(BaseModel):
    id: str = Field(default_factory=lambda: "player1", alias="_id")
    name: str
    level: int = 1
    experience: int = 0
    experienceToNext: int = 100
    gold: int = 100
    health: int = 100
    maxHealth: int = 100
    mana: int = 50
    maxMana: int = 50
    stats: CharacterStats = Field(default_factory=CharacterStats)
    equipment: Equipment = Field(default_factory=Equipment)
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True


class CharacterUpdate(BaseModel):
    name: Optional[str] = None
    level: Optional[int] = None
    experience: Optional[int] = None
    gold: Optional[int] = None
    health: Optional[int] = None
    mana: Optional[int] = None
    stats: Optional[CharacterStats] = None
    equipment: Optional[Equipment] = None


# Item Models
class QuestReward(BaseModel):
    experience: int = 0
    gold: int = 0
    item: Optional[str] = None


class Item(BaseModel):
    id: str = Field(alias="_id")
    name: str
    type: ItemType
    rarity: ItemRarity = ItemRarity.common
    damage: Optional[int] = None
    defense: Optional[int] = None
    speed: Optional[int] = None
    strength: Optional[int] = None
    effect: Optional[str] = None
    value: Optional[int] = None
    price: int = 10
    description: Optional[str] = None

    class Config:
        populate_by_name = True


class InventoryItem(BaseModel):
    itemId: str
    quantity: int = 1
    equipped: bool = False


class Inventory(BaseModel):
    id: str = Field(alias="_id")
    userId: str
    items: List[InventoryItem] = []

    class Config:
        populate_by_name = True


# Enemy Models  
class Enemy(BaseModel):
    id: str = Field(alias="_id")
    name: str
    level: int
    health: int
    maxHealth: int
    attack: int
    defense: int
    experience: int
    goldReward: int
    image: str = "🧌"

    class Config:
        populate_by_name = True


# Quest Models
class Quest(BaseModel):
    id: str = Field(alias="_id")
    title: str
    description: str
    type: QuestType
    target: Optional[str] = None
    required: int = 1
    reward: QuestReward
    isActive: bool = True

    class Config:
        populate_by_name = True


class PlayerQuest(BaseModel):
    id: str = Field(alias="_id")
    userId: str
    questId: str
    progress: int = 0
    completed: bool = False
    active: bool = True
    startedAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True


# Battle Models
class Battle(BaseModel):
    id: str = Field(alias="_id")
    userId: str
    enemyId: str
    playerHealth: int
    enemyHealth: int
    isPlayerTurn: bool = True
    battleEnded: bool = False
    victory: bool = False
    battleLog: List[str] = []
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True


# Request/Response Models
class BattleStartRequest(BaseModel):
    userId: str
    enemyId: str


class BattleActionRequest(BaseModel):
    battleId: str
    action: str  # "attack", "defend", "magic"


class BattleActionResponse(BaseModel):
    battleId: str
    playerHealth: int
    enemyHealth: int
    isPlayerTurn: bool
    battleEnded: bool
    victory: bool
    message: str
    rewards: Optional[Dict[str, int]] = None


class ShopPurchaseRequest(BaseModel):
    userId: str
    itemId: str
    quantity: int = 1


class UseItemRequest(BaseModel):
    userId: str
    itemId: str
    quantity: int = 1


class EquipItemRequest(BaseModel):
    userId: str
    itemId: str