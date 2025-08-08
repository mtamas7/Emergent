from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import DuplicateKeyError
from models import *
import os
from datetime import datetime
import uuid


class GameDatabase:
    def __init__(self, client: AsyncIOMotorClient, db_name: str):
        self.client = client
        self.db = client[db_name]
        
        # Collections
        self.characters = self.db.characters
        self.items = self.db.items
        self.inventories = self.db.inventories
        self.enemies = self.db.enemies
        self.quests = self.db.quests
        self.player_quests = self.db.player_quests
        self.battles = self.db.battles

    async def initialize_game_data(self):
        """Initialize the game with sample data"""
        
        # Initialize Items
        sample_items = [
            {
                "_id": "item_1",
                "name": "Lángoló Kard",
                "type": "weapon",
                "rarity": "rare",
                "damage": 15,
                "price": 200,
                "description": "Egy forró láng borítja"
            },
            {
                "_id": "item_2", 
                "name": "Acél Páncél",
                "type": "armor",
                "rarity": "common",
                "defense": 12,
                "price": 150,
                "description": "Erős acél páncélzat"
            },
            {
                "_id": "item_3",
                "name": "Harcos Sisak", 
                "type": "helmet",
                "rarity": "common",
                "defense": 5,
                "price": 75,
                "description": "Védő sisak harcosoknak"
            },
            {
                "_id": "item_4",
                "name": "Gyors Csizmák",
                "type": "boots", 
                "rarity": "uncommon",
                "speed": 3,
                "price": 100,
                "description": "Növeli a sebességet"
            },
            {
                "_id": "item_5",
                "name": "Erő Gyűrűje",
                "type": "accessory",
                "rarity": "rare", 
                "strength": 2,
                "price": 300,
                "description": "Növeli az erőt"
            },
            {
                "_id": "item_6",
                "name": "Gyógyító Bájital",
                "type": "consumable",
                "rarity": "common",
                "effect": "heal",
                "value": 50,
                "price": 25,
                "description": "Visszaad 50 HP-t"
            },
            {
                "_id": "item_7", 
                "name": "Mana Bájital",
                "type": "consumable",
                "rarity": "common",
                "effect": "mana",
                "value": 30,
                "price": 20,
                "description": "Visszaad 30 mana-t"
            },
            {
                "_id": "item_8",
                "name": "Vas Kard",
                "type": "weapon",
                "rarity": "common", 
                "damage": 10,
                "price": 100,
                "description": "Egyszerű vas kard"
            },
            {
                "_id": "item_9",
                "name": "Bőr Páncél",
                "type": "armor",
                "rarity": "common",
                "defense": 8,
                "price": 80,
                "description": "Könnyű bőr páncél"
            },
            {
                "_id": "item_10",
                "name": "Titán Pajzs", 
                "type": "shield",
                "rarity": "epic",
                "defense": 15,
                "price": 500,
                "description": "Legendás titán pajzs"
            }
        ]

        # Initialize Enemies
        sample_enemies = [
            {
                "_id": "enemy_1",
                "name": "Goblin Harcos",
                "level": 8,
                "health": 60,
                "maxHealth": 60, 
                "attack": 12,
                "defense": 5,
                "experience": 120,
                "goldReward": 25,
                "image": "🧌"
            },
            {
                "_id": "enemy_2",
                "name": "Vad Farkas",
                "level": 10,
                "health": 80,
                "maxHealth": 80,
                "attack": 15, 
                "defense": 3,
                "experience": 150,
                "goldReward": 30,
                "image": "🐺"
            },
            {
                "_id": "enemy_3",
                "name": "Koponya Mágus",
                "level": 15,
                "health": 120,
                "maxHealth": 120,
                "attack": 25,
                "defense": 8,
                "experience": 300,
                "goldReward": 75,
                "image": "💀"
            },
            {
                "_id": "enemy_4", 
                "name": "Ősi Sárkány",
                "level": 25,
                "health": 300,
                "maxHealth": 300,
                "attack": 45,
                "defense": 20,
                "experience": 1000,
                "goldReward": 500,
                "image": "🐲"
            }
        ]

        # Initialize Quests
        sample_quests = [
            {
                "_id": "quest_1",
                "title": "Goblin Fenyegetés", 
                "description": "Győzz le 5 goblin harcost a falu védelmében",
                "type": "kill",
                "target": "Goblin Harcos",
                "required": 5,
                "reward": {
                    "experience": 500,
                    "gold": 100
                },
                "isActive": True
            },
            {
                "_id": "quest_2",
                "title": "A Mágus Próbája",
                "description": "Érj el 15. szintet",
                "type": "level", 
                "required": 15,
                "reward": {
                    "experience": 0,
                    "gold": 300,
                    "item": "item_5"
                },
                "isActive": True
            },
            {
                "_id": "quest_3",
                "title": "Kincsvadászat",
                "description": "Gyűjts össze 1000 aranyat",
                "type": "collect",
                "target": "gold",
                "required": 1000,
                "reward": {
                    "experience": 800,
                    "gold": 0,
                    "item": "item_10" 
                },
                "isActive": True
            }
        ]

        # Insert data if collections are empty
        try:
            if await self.items.count_documents({}) == 0:
                await self.items.insert_many(sample_items)
                print("✅ Items initialized")
                
            if await self.enemies.count_documents({}) == 0:
                await self.enemies.insert_many(sample_enemies)
                print("✅ Enemies initialized")
                
            if await self.quests.count_documents({}) == 0:
                await self.quests.insert_many(sample_quests)
                print("✅ Quests initialized")
                
        except Exception as e:
            print(f"Error initializing game data: {e}")

    # Character methods
    async def get_character(self, user_id: str) -> Character:
        """Get character by user ID, create if doesn't exist"""
        char_data = await self.characters.find_one({"_id": user_id})
        
        if not char_data:
            # Create default character
            new_char = Character(
                id=user_id,
                name="Kalandor",
                level=12,
                experience=2400,
                experienceToNext=3000,
                gold=850,
                health=100,
                maxHealth=100,
                mana=75,
                maxMana=75,
                stats=CharacterStats(
                    strength=18,
                    dexterity=14,
                    intelligence=16,
                    constitution=15,
                    wisdom=12,
                    charisma=10
                ),
                equipment=Equipment(
                    weapon="item_1",
                    armor="item_2", 
                    helmet="item_3",
                    boots="item_4",
                    accessory="item_5"
                )
            )
            await self.characters.insert_one(new_char.model_dump(by_alias=True))
            return new_char
            
        return Character(**char_data)

    async def update_character(self, user_id: str, updates: CharacterUpdate) -> Character:
        """Update character data"""
        update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
        update_data["updatedAt"] = datetime.utcnow()
        
        await self.characters.update_one(
            {"_id": user_id},
            {"$set": update_data}
        )
        return await self.get_character(user_id)

    # Inventory methods
    async def get_inventory(self, user_id: str) -> List[Dict]:
        """Get user inventory with item details"""
        inventory = await self.inventories.find_one({"userId": user_id})
        
        if not inventory:
            # Create default inventory
            default_items = [
                {"itemId": "item_6", "quantity": 5, "equipped": False},
                {"itemId": "item_7", "quantity": 3, "equipped": False}, 
                {"itemId": "item_8", "quantity": 1, "equipped": False},
                {"itemId": "item_9", "quantity": 1, "equipped": False},
                {"itemId": "item_10", "quantity": 1, "equipped": False}
            ]
            
            new_inventory = {
                "_id": f"inv_{user_id}",
                "userId": user_id,
                "items": default_items
            }
            await self.inventories.insert_one(new_inventory)
            inventory = new_inventory

        # Get item details
        inventory_with_details = []
        for inv_item in inventory["items"]:
            item_data = await self.items.find_one({"_id": inv_item["itemId"]})
            if item_data:
                item_with_quantity = {**item_data, **inv_item}
                inventory_with_details.append(item_with_quantity)
                
        return inventory_with_details

    async def add_item_to_inventory(self, user_id: str, item_id: str, quantity: int = 1):
        """Add item to inventory"""
        # Check if inventory exists
        inventory = await self.inventories.find_one({"userId": user_id})
        
        if not inventory:
            # Create new inventory
            new_inventory = {
                "_id": f"inv_{user_id}",
                "userId": user_id,
                "items": [{"itemId": item_id, "quantity": quantity, "equipped": False}]
            }
            await self.inventories.insert_one(new_inventory)
            return
            
        # Check if item already exists in inventory
        existing_item_index = None
        for i, item in enumerate(inventory["items"]):
            if item["itemId"] == item_id:
                existing_item_index = i
                break
                
        if existing_item_index is not None:
            # Update existing item quantity
            await self.inventories.update_one(
                {"userId": user_id},
                {"$inc": {f"items.{existing_item_index}.quantity": quantity}}
            )
        else:
            # Add new item
            await self.inventories.update_one(
                {"userId": user_id},
                {"$push": {"items": {"itemId": item_id, "quantity": quantity, "equipped": False}}}
            )

    async def remove_item_from_inventory(self, user_id: str, item_id: str, quantity: int = 1):
        """Remove item from inventory"""
        inventory = await self.inventories.find_one({"userId": user_id})
        if not inventory:
            return False
            
        # Find item and update quantity
        for i, item in enumerate(inventory["items"]):
            if item["itemId"] == item_id:
                new_quantity = item["quantity"] - quantity
                if new_quantity <= 0:
                    # Remove item completely
                    await self.inventories.update_one(
                        {"userId": user_id},
                        {"$pull": {"items": {"itemId": item_id}}}
                    )
                else:
                    # Update quantity
                    await self.inventories.update_one(
                        {"userId": user_id},
                        {"$set": {f"items.{i}.quantity": new_quantity}}
                    )
                return True
        return False

    # Enemy methods
    async def get_all_enemies(self) -> List[Enemy]:
        """Get all enemies"""
        enemies = await self.enemies.find({}).to_list(None)
        return [Enemy(**enemy) for enemy in enemies]

    async def get_enemy(self, enemy_id: str) -> Enemy:
        """Get specific enemy"""
        enemy_data = await self.enemies.find_one({"_id": enemy_id})
        if enemy_data:
            return Enemy(**enemy_data)
        return None

    # Quest methods
    async def get_user_quests(self, user_id: str) -> List[Dict]:
        """Get user quests with details"""
        player_quests = await self.player_quests.find({"userId": user_id}).to_list(None)
        
        if not player_quests:
            # Create default player quests
            default_quests = [
                {
                    "_id": f"pq_{user_id}_1",
                    "userId": user_id,
                    "questId": "quest_1",
                    "progress": 3,
                    "completed": False,
                    "active": True,
                    "startedAt": datetime.utcnow()
                },
                {
                    "_id": f"pq_{user_id}_2", 
                    "userId": user_id,
                    "questId": "quest_2",
                    "progress": 12,
                    "completed": False,
                    "active": True,
                    "startedAt": datetime.utcnow()
                }
            ]
            await self.player_quests.insert_many(default_quests)
            player_quests = default_quests

        # Get quest details
        quests_with_details = []
        for pq in player_quests:
            quest_data = await self.quests.find_one({"_id": pq["questId"]})
            if quest_data:
                quest_with_progress = {**quest_data, **pq}
                quests_with_details.append(quest_with_progress)
                
        return quests_with_details

    # Shop methods  
    async def get_shop_items(self) -> List[Item]:
        """Get all shop items"""
        # For now, return some items as shop items
        shop_item_ids = ["item_8", "item_9", "item_6", "item_7", "item_5", "item_10"]
        items = await self.items.find({"_id": {"$in": shop_item_ids}}).to_list(None)
        return [Item(**item) for item in items]