from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import os
import logging
from contextlib import asynccontextmanager

from models import *
from database import GameDatabase

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Global database instance
game_db = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global game_db
    mongo_url = os.environ['MONGO_URL']
    db_name = os.environ['DB_NAME']
    
    client = AsyncIOMotorClient(mongo_url)
    game_db = GameDatabase(client, db_name)
    
    # Initialize game data
    await game_db.initialize_game_data()
    print("✅ RPG Game Backend Started!")
    
    yield
    
    # Shutdown
    client.close()
    print("👋 RPG Game Backend Stopped!")


# Create FastAPI app with lifespan
app = FastAPI(lifespan=lifespan, title="Fantasy RPG API")

# Create API router
api_router = APIRouter(prefix="/api")


# Dependency to get database
async def get_db() -> GameDatabase:
    return game_db


# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# ============= CHARACTER ENDPOINTS =============

@api_router.get("/character/{user_id}", response_model=Character)
async def get_character(user_id: str, db: GameDatabase = Depends(get_db)):
    """Get character data"""
    try:
        character = await db.get_character(user_id)
        return character
    except Exception as e:
        logger.error(f"Error getting character: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.put("/character/{user_id}", response_model=Character)
async def update_character(user_id: str, updates: CharacterUpdate, db: GameDatabase = Depends(get_db)):
    """Update character data"""
    try:
        character = await db.update_character(user_id, updates)
        return character
    except Exception as e:
        logger.error(f"Error updating character: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============= INVENTORY ENDPOINTS =============

@api_router.get("/inventory/{user_id}")
async def get_inventory(user_id: str, db: GameDatabase = Depends(get_db)):
    """Get player inventory"""
    try:
        inventory = await db.get_inventory(user_id)
        return inventory
    except Exception as e:
        logger.error(f"Error getting inventory: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/inventory/{user_id}/use")
async def use_item(user_id: str, request: UseItemRequest, db: GameDatabase = Depends(get_db)):
    """Use item from inventory"""
    try:
        # Get item details
        item_data = await db.items.find_one({"_id": request.itemId})
        if not item_data:
            raise HTTPException(status_code=404, detail="Item not found")
        
        item = Item(**item_data)
        
        # Remove item from inventory
        success = await db.remove_item_from_inventory(user_id, request.itemId, request.quantity)
        if not success:
            raise HTTPException(status_code=400, detail="Item not in inventory")
        
        # Apply item effect
        character = await db.get_character(user_id)
        
        if item.effect == "heal":
            new_health = min(character.health + item.value, character.maxHealth)
            await db.update_character(user_id, CharacterUpdate(health=new_health))
        elif item.effect == "mana":
            new_mana = min(character.mana + item.value, character.maxMana)
            await db.update_character(user_id, CharacterUpdate(mana=new_mana))
        
        return {"message": f"{item.name} használatba véve!", "success": True}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error using item: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/inventory/{user_id}/equip")
async def equip_item(user_id: str, request: EquipItemRequest, db: GameDatabase = Depends(get_db)):
    """Equip item"""
    try:
        # Get item details
        item_data = await db.items.find_one({"_id": request.itemId})
        if not item_data:
            raise HTTPException(status_code=404, detail="Item not found")
        
        item = Item(**item_data)
        character = await db.get_character(user_id)
        
        # Update equipment based on item type
        new_equipment = character.equipment.model_copy()
        
        if item.type == "weapon":
            new_equipment.weapon = request.itemId
        elif item.type == "armor":
            new_equipment.armor = request.itemId
        elif item.type == "helmet":
            new_equipment.helmet = request.itemId
        elif item.type == "boots":
            new_equipment.boots = request.itemId
        elif item.type == "accessory":
            new_equipment.accessory = request.itemId
        else:
            raise HTTPException(status_code=400, detail="Item cannot be equipped")
        
        # Update character
        await db.update_character(user_id, CharacterUpdate(equipment=new_equipment))
        
        return {"message": f"{item.name} felszerelve!", "success": True}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error equipping item: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============= ENEMY ENDPOINTS =============

@api_router.get("/enemies", response_model=List[Enemy])
async def get_enemies(db: GameDatabase = Depends(get_db)):
    """Get all enemies"""
    try:
        enemies = await db.get_all_enemies()
        return enemies
    except Exception as e:
        logger.error(f"Error getting enemies: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============= QUEST ENDPOINTS =============

@api_router.get("/quests/{user_id}")
async def get_user_quests(user_id: str, db: GameDatabase = Depends(get_db)):
    """Get player quests"""
    try:
        quests = await db.get_user_quests(user_id)
        return quests
    except Exception as e:
        logger.error(f"Error getting quests: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/quests/{user_id}/complete/{quest_id}")
async def complete_quest(user_id: str, quest_id: str, db: GameDatabase = Depends(get_db)):
    """Complete a quest"""
    try:
        # Find player quest
        player_quest = await db.player_quests.find_one({
            "userId": user_id,
            "questId": quest_id,
            "active": True
        })
        
        if not player_quest:
            raise HTTPException(status_code=404, detail="Quest not found or not active")
        
        # Get quest details
        quest_data = await db.quests.find_one({"_id": quest_id})
        if not quest_data:
            raise HTTPException(status_code=404, detail="Quest not found")
        
        quest = Quest(**quest_data)
        
        # Mark quest as completed
        await db.player_quests.update_one(
            {"userId": user_id, "questId": quest_id},
            {"$set": {"completed": True, "active": False}}
        )
        
        # Give rewards
        character = await db.get_character(user_id)
        updates = CharacterUpdate(
            experience=character.experience + quest.reward.experience,
            gold=character.gold + quest.reward.gold
        )
        
        await db.update_character(user_id, updates)
        
        # Add item reward if any
        if quest.reward.item:
            await db.add_item_to_inventory(user_id, quest.reward.item, 1)
        
        return {
            "message": f"{quest.title} teljesítve!",
            "rewards": {
                "experience": quest.reward.experience,
                "gold": quest.reward.gold,
                "item": quest.reward.item
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error completing quest: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============= SHOP ENDPOINTS =============

@api_router.get("/shop/items", response_model=List[Item])
async def get_shop_items(db: GameDatabase = Depends(get_db)):
    """Get shop items"""
    try:
        items = await db.get_shop_items()
        return items
    except Exception as e:
        logger.error(f"Error getting shop items: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/shop/buy")
async def buy_item(request: ShopPurchaseRequest, db: GameDatabase = Depends(get_db)):
    """Buy item from shop"""
    try:
        # Get item details
        item_data = await db.items.find_one({"_id": request.itemId})
        if not item_data:
            raise HTTPException(status_code=404, detail="Item not found")
        
        item = Item(**item_data)
        total_cost = item.price * request.quantity
        
        # Check if player has enough gold
        character = await db.get_character(request.userId)
        if character.gold < total_cost:
            raise HTTPException(status_code=400, detail="Not enough gold")
        
        # Deduct gold
        await db.update_character(
            request.userId, 
            CharacterUpdate(gold=character.gold - total_cost)
        )
        
        # Add item to inventory
        await db.add_item_to_inventory(request.userId, request.itemId, request.quantity)
        
        return {
            "message": f"{item.name} megvásárolva {total_cost} aranyért!",
            "success": True
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error buying item: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/shop/sell")
async def sell_item(request: UseItemRequest, db: GameDatabase = Depends(get_db)):
    """Sell item to shop"""
    try:
        # Get item details
        item_data = await db.items.find_one({"_id": request.itemId})
        if not item_data:
            raise HTTPException(status_code=404, detail="Item not found")
        
        item = Item(**item_data)
        sell_price = int(item.price * 0.5) * request.quantity
        
        # Remove item from inventory
        success = await db.remove_item_from_inventory(request.userId, request.itemId, request.quantity)
        if not success:
            raise HTTPException(status_code=400, detail="Item not in inventory")
        
        # Add gold
        character = await db.get_character(request.userId)
        await db.update_character(
            request.userId,
            CharacterUpdate(gold=character.gold + sell_price)
        )
        
        return {
            "message": f"{item.name} eladva {sell_price} aranyért!",
            "success": True
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error selling item: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============= ROOT ENDPOINT =============

@api_router.get("/")
async def root():
    return {"message": "Fantasy RPG API is running! 🎮⚔️"}


# Include the router in the main app
app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)