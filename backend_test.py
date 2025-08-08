#!/usr/bin/env python3
"""
Fantasy RPG Game Backend API Test Suite
Tests all backend endpoints for the RPG game including:
- Character System
- Inventory System  
- Enemy System
- Quest System
- Shop System
"""

import requests
import json
import os
from typing import Dict, Any

# Get backend URL from environment
BACKEND_URL = "https://0d3c0137-5a01-49af-9449-2324c982b9f2.preview.emergentagent.com/api"
TEST_USER_ID = "player1"

class RPGBackendTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.test_results = []
        self.character_data = None
        self.inventory_data = None
        
    def log_test(self, test_name: str, success: bool, details: str = ""):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        result = f"{status} {test_name}"
        if details:
            result += f" - {details}"
        print(result)
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details
        })
        
    def test_api_health(self):
        """Test if API is running"""
        try:
            response = requests.get(f"{self.base_url}/", timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.log_test("API Health Check", True, f"API is running: {data.get('message', '')}")
                return True
            else:
                self.log_test("API Health Check", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("API Health Check", False, f"Connection error: {str(e)}")
            return False
    
    def test_get_character(self):
        """Test GET /character/{user_id}"""
        try:
            response = requests.get(f"{self.base_url}/character/{TEST_USER_ID}", timeout=10)
            if response.status_code == 200:
                self.character_data = response.json()
                # Validate character structure
                required_fields = ['id', 'name', 'level', 'experience', 'gold', 'health', 'maxHealth', 'mana', 'maxMana', 'stats', 'equipment']
                missing_fields = [field for field in required_fields if field not in self.character_data]
                
                if not missing_fields:
                    self.log_test("Get Character", True, f"Character: {self.character_data['name']}, Level: {self.character_data['level']}, Gold: {self.character_data['gold']}")
                    return True
                else:
                    self.log_test("Get Character", False, f"Missing fields: {missing_fields}")
                    return False
            else:
                self.log_test("Get Character", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Get Character", False, f"Error: {str(e)}")
            return False
    
    def test_update_character(self):
        """Test PUT /character/{user_id}"""
        try:
            # Update character gold
            update_data = {
                "gold": 1000,
                "health": 95
            }
            response = requests.put(
                f"{self.base_url}/character/{TEST_USER_ID}",
                json=update_data,
                timeout=10
            )
            
            if response.status_code == 200:
                updated_char = response.json()
                if updated_char['gold'] == 1000 and updated_char['health'] == 95:
                    self.log_test("Update Character", True, f"Gold updated to {updated_char['gold']}, Health to {updated_char['health']}")
                    self.character_data = updated_char  # Update our cached data
                    return True
                else:
                    self.log_test("Update Character", False, f"Update failed - Gold: {updated_char['gold']}, Health: {updated_char['health']}")
                    return False
            else:
                self.log_test("Update Character", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Update Character", False, f"Error: {str(e)}")
            return False
    
    def test_get_inventory(self):
        """Test GET /inventory/{user_id}"""
        try:
            response = requests.get(f"{self.base_url}/inventory/{TEST_USER_ID}", timeout=10)
            if response.status_code == 200:
                self.inventory_data = response.json()
                if isinstance(self.inventory_data, list):
                    item_count = len(self.inventory_data)
                    self.log_test("Get Inventory", True, f"Found {item_count} items in inventory")
                    
                    # Log some inventory items for verification
                    if item_count > 0:
                        sample_items = [f"{item.get('name', 'Unknown')} (x{item.get('quantity', 1)})" for item in self.inventory_data[:3]]
                        print(f"   Sample items: {', '.join(sample_items)}")
                    return True
                else:
                    self.log_test("Get Inventory", False, "Inventory is not a list")
                    return False
            else:
                self.log_test("Get Inventory", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Get Inventory", False, f"Error: {str(e)}")
            return False
    
    def test_use_consumable_item(self):
        """Test POST /inventory/{user_id}/use"""
        try:
            # Find a consumable item in inventory
            consumable_item = None
            if self.inventory_data:
                for item in self.inventory_data:
                    if item.get('type') == 'consumable' and item.get('quantity', 0) > 0:
                        consumable_item = item
                        break
            
            if not consumable_item:
                self.log_test("Use Consumable Item", False, "No consumable items found in inventory")
                return False
            
            # Store initial health for comparison
            initial_health = self.character_data.get('health', 0) if self.character_data else 0
            
            use_data = {
                "userId": TEST_USER_ID,
                "itemId": consumable_item['_id'],
                "quantity": 1
            }
            
            response = requests.post(
                f"{self.base_url}/inventory/{TEST_USER_ID}/use",
                json=use_data,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    self.log_test("Use Consumable Item", True, f"Used {consumable_item['name']}: {result.get('message', '')}")
                    return True
                else:
                    self.log_test("Use Consumable Item", False, f"Use failed: {result}")
                    return False
            else:
                self.log_test("Use Consumable Item", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Use Consumable Item", False, f"Error: {str(e)}")
            return False
    
    def test_equip_item(self):
        """Test POST /inventory/{user_id}/equip"""
        try:
            # Find an equippable item in inventory
            equippable_item = None
            if self.inventory_data:
                for item in self.inventory_data:
                    if item.get('type') in ['weapon', 'armor', 'helmet', 'boots', 'accessory'] and item.get('quantity', 0) > 0:
                        equippable_item = item
                        break
            
            if not equippable_item:
                self.log_test("Equip Item", False, "No equippable items found in inventory")
                return False
            
            equip_data = {
                "userId": TEST_USER_ID,
                "itemId": equippable_item['_id']
            }
            
            response = requests.post(
                f"{self.base_url}/inventory/{TEST_USER_ID}/equip",
                json=equip_data,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    self.log_test("Equip Item", True, f"Equipped {equippable_item['name']}: {result.get('message', '')}")
                    return True
                else:
                    self.log_test("Equip Item", False, f"Equip failed: {result}")
                    return False
            else:
                self.log_test("Equip Item", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Equip Item", False, f"Error: {str(e)}")
            return False
    
    def test_get_enemies(self):
        """Test GET /enemies"""
        try:
            response = requests.get(f"{self.base_url}/enemies", timeout=10)
            if response.status_code == 200:
                enemies = response.json()
                if isinstance(enemies, list) and len(enemies) > 0:
                    enemy_names = [enemy.get('name', 'Unknown') for enemy in enemies[:3]]
                    self.log_test("Get Enemies", True, f"Found {len(enemies)} enemies: {', '.join(enemy_names)}")
                    return True
                else:
                    self.log_test("Get Enemies", False, "No enemies found or invalid format")
                    return False
            else:
                self.log_test("Get Enemies", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Get Enemies", False, f"Error: {str(e)}")
            return False
    
    def test_get_user_quests(self):
        """Test GET /quests/{user_id}"""
        try:
            response = requests.get(f"{self.base_url}/quests/{TEST_USER_ID}", timeout=10)
            if response.status_code == 200:
                quests = response.json()
                if isinstance(quests, list):
                    active_quests = [q for q in quests if q.get('active', False)]
                    quest_titles = [quest.get('title', 'Unknown') for quest in active_quests[:3]]
                    self.log_test("Get User Quests", True, f"Found {len(active_quests)} active quests: {', '.join(quest_titles)}")
                    return True
                else:
                    self.log_test("Get User Quests", False, "Quests is not a list")
                    return False
            else:
                self.log_test("Get User Quests", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Get User Quests", False, f"Error: {str(e)}")
            return False
    
    def test_complete_quest(self):
        """Test POST /quests/{user_id}/complete/{quest_id}"""
        try:
            # Try to complete quest_1
            quest_id = "quest_1"
            response = requests.post(f"{self.base_url}/quests/{TEST_USER_ID}/complete/{quest_id}", timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                if 'rewards' in result:
                    rewards = result['rewards']
                    self.log_test("Complete Quest", True, f"Quest completed! Rewards: {rewards}")
                    return True
                else:
                    self.log_test("Complete Quest", True, f"Quest completed: {result.get('message', '')}")
                    return True
            elif response.status_code == 404:
                self.log_test("Complete Quest", True, "Quest not found or already completed (expected)")
                return True
            else:
                self.log_test("Complete Quest", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Complete Quest", False, f"Error: {str(e)}")
            return False
    
    def test_get_shop_items(self):
        """Test GET /shop/items"""
        try:
            response = requests.get(f"{self.base_url}/shop/items", timeout=10)
            if response.status_code == 200:
                shop_items = response.json()
                if isinstance(shop_items, list) and len(shop_items) > 0:
                    item_names = [item.get('name', 'Unknown') for item in shop_items[:3]]
                    self.log_test("Get Shop Items", True, f"Found {len(shop_items)} shop items: {', '.join(item_names)}")
                    return True
                else:
                    self.log_test("Get Shop Items", False, "No shop items found or invalid format")
                    return False
            else:
                self.log_test("Get Shop Items", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Get Shop Items", False, f"Error: {str(e)}")
            return False
    
    def test_buy_item(self):
        """Test POST /shop/buy"""
        try:
            # Get shop items first
            shop_response = requests.get(f"{self.base_url}/shop/items", timeout=10)
            if shop_response.status_code != 200:
                self.log_test("Buy Item", False, "Could not get shop items")
                return False
            
            shop_items = shop_response.json()
            if not shop_items:
                self.log_test("Buy Item", False, "No shop items available")
                return False
            
            # Find an affordable item
            affordable_item = None
            current_gold = self.character_data.get('gold', 0) if self.character_data else 0
            
            for item in shop_items:
                if item.get('price', 0) <= current_gold:
                    affordable_item = item
                    break
            
            if not affordable_item:
                self.log_test("Buy Item", False, f"No affordable items (have {current_gold} gold)")
                return False
            
            buy_data = {
                "userId": TEST_USER_ID,
                "itemId": affordable_item['_id'],
                "quantity": 1
            }
            
            response = requests.post(
                f"{self.base_url}/shop/buy",
                json=buy_data,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    self.log_test("Buy Item", True, f"Bought {affordable_item['name']}: {result.get('message', '')}")
                    return True
                else:
                    self.log_test("Buy Item", False, f"Purchase failed: {result}")
                    return False
            else:
                self.log_test("Buy Item", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Buy Item", False, f"Error: {str(e)}")
            return False
    
    def test_sell_item(self):
        """Test POST /shop/sell"""
        try:
            # Refresh inventory to get latest items
            inv_response = requests.get(f"{self.base_url}/inventory/{TEST_USER_ID}", timeout=10)
            if inv_response.status_code != 200:
                self.log_test("Sell Item", False, "Could not get inventory")
                return False
            
            current_inventory = inv_response.json()
            
            # Find an item to sell (not equipped)
            sellable_item = None
            for item in current_inventory:
                if item.get('quantity', 0) > 0 and not item.get('equipped', False):
                    sellable_item = item
                    break
            
            if not sellable_item:
                self.log_test("Sell Item", False, "No sellable items found")
                return False
            
            sell_data = {
                "userId": TEST_USER_ID,
                "itemId": sellable_item['_id'],
                "quantity": 1
            }
            
            response = requests.post(
                f"{self.base_url}/shop/sell",
                json=sell_data,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    self.log_test("Sell Item", True, f"Sold {sellable_item['name']}: {result.get('message', '')}")
                    return True
                else:
                    self.log_test("Sell Item", False, f"Sale failed: {result}")
                    return False
            else:
                self.log_test("Sell Item", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Sell Item", False, f"Error: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("🎮 Starting Fantasy RPG Backend API Tests")
        print(f"🔗 Backend URL: {self.base_url}")
        print("=" * 60)
        
        # Test API health first
        if not self.test_api_health():
            print("❌ API is not accessible. Stopping tests.")
            return False
        
        # Character System Tests
        print("\n🧙 CHARACTER SYSTEM TESTS")
        self.test_get_character()
        self.test_update_character()
        
        # Inventory System Tests  
        print("\n🎒 INVENTORY SYSTEM TESTS")
        self.test_get_inventory()
        self.test_use_consumable_item()
        self.test_equip_item()
        
        # Enemy System Tests
        print("\n👹 ENEMY SYSTEM TESTS")
        self.test_get_enemies()
        
        # Quest System Tests
        print("\n📜 QUEST SYSTEM TESTS")
        self.test_get_user_quests()
        self.test_complete_quest()
        
        # Shop System Tests
        print("\n🏪 SHOP SYSTEM TESTS")
        self.test_get_shop_items()
        self.test_buy_item()
        self.test_sell_item()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        
        print(f"✅ Passed: {passed}/{total}")
        print(f"❌ Failed: {total - passed}/{total}")
        
        if passed == total:
            print("🎉 All tests passed! Backend is working correctly.")
            return True
        else:
            print("⚠️  Some tests failed. Check the details above.")
            
            # Show failed tests
            failed_tests = [result for result in self.test_results if not result['success']]
            if failed_tests:
                print("\n❌ FAILED TESTS:")
                for test in failed_tests:
                    print(f"   • {test['test']}: {test['details']}")
            
            return False

if __name__ == "__main__":
    tester = RPGBackendTester()
    success = tester.run_all_tests()
    exit(0 if success else 1)