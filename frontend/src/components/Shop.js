import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import apiService, { getRarityColor, getRarityBg } from '../services/api';
import { ShoppingBag, Coins, Sword, Shield, Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const Shop = () => {
  const [shopItems, setShopItems] = useState([]);
  const [playerGold, setPlayerGold] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    loadShopData();
  }, []);

  const loadShopData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load shop items and player data
      const [items, character] = await Promise.all([
        apiService.getShopItems(),
        apiService.getCharacter()
      ]);
      
      setShopItems(items);
      setPlayerGold(character.gold);
      
    } catch (err) {
      setError('Hiba a bolt betöltésekor');
      toast({
        title: "Hiba",
        description: "Nem sikerült betölteni a bolt adatait",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterByType = (type) => {
    if (type === 'all') return shopItems;
    return shopItems.filter(item => item.type === type);
  };

  const buyItem = async (item) => {
    if (actionLoading) return;
    
    try {
      setActionLoading(`buy_${item._id}`);
      
      if (playerGold < item.price) {
        toast({
          title: "Nincs elég arany!",
          description: `${item.price - playerGold} arannyal több kell a vásárláshoz.`,
          variant: "destructive"
        });
        return;
      }
      
      const result = await apiService.buyItem('player1', item._id, 1);
      
      toast({
        title: "Vásárlás sikeres!",
        description: result.message,
      });
      
      // Update player gold
      setPlayerGold(prev => prev - item.price);
      
      // Optionally reload character data to ensure consistency
      setTimeout(async () => {
        try {
          const character = await apiService.getCharacter();
          setPlayerGold(character.gold);
        } catch (error) {
          console.error('Error reloading character:', error);
        }
      }, 1000);
      
    } catch (error) {
      toast({
        title: "Vásárlási hiba",
        description: error.response?.data?.detail || "Nem sikerült megvásárolni a tárgyat",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const canAfford = (price) => playerGold >= price;

  const ShopItem = ({ item }) => (
    <Card className={`${getRarityBg(item.rarity)} border-2 hover:shadow-lg transition-all`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className={`font-bold ${getRarityColor(item.rarity)}`}>{item.name}</h3>
            <Badge variant="outline" className="mt-1 text-xs">
              {item.type}
            </Badge>
          </div>
          <Badge variant="secondary" className={`${getRarityColor(item.rarity)} font-bold`}>
            {item.rarity}
          </Badge>
        </div>

        <div className="space-y-1 text-sm text-gray-600 mb-4">
          {item.damage && <div>Sebzés: {item.damage}</div>}
          {item.defense && <div>Védelem: {item.defense}</div>}
          {item.effect && <div>Hatás: {item.effect}</div>}
          {item.value && <div>Érték: {item.value}</div>}
          {item.strength && <div>Erő: +{item.strength}</div>}
          {item.description && <div className="text-xs text-gray-500 italic">{item.description}</div>}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-yellow-600 font-bold">
            <Coins className="h-4 w-4" />
            <span>{item.price}</span>
          </div>
          <Button 
            size="sm" 
            onClick={() => buyItem(item)}
            disabled={!canAfford(item.price) || actionLoading === `buy_${item._id}`}
            className={canAfford(item.price) ? "" : "opacity-50"}
          >
            {actionLoading === `buy_${item._id}` ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                {canAfford(item.price) ? "Vásárol" : "Nincs elég arany"}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400 p-8">
        <p>{error}</p>
        <button 
          onClick={loadShopData}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Újrapróbálás
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Shop Header with Gold */}
      <Card className="bg-slate-800/50 backdrop-blur border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Varázsbolt
            </div>
            <div className="flex items-center gap-2 bg-yellow-600/20 px-4 py-2 rounded-lg border border-yellow-500/30">
              <Coins className="h-5 w-5 text-yellow-400" />
              <span className="text-xl font-bold text-yellow-400">{playerGold} Arany</span>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Shop Items */}
      <Card className="bg-slate-800/50 backdrop-blur border-purple-500/20">
        <CardContent className="p-6">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-slate-700/50 mb-6">
              <TabsTrigger value="all">Minden</TabsTrigger>
              <TabsTrigger value="weapon" className="flex items-center gap-1">
                <Sword className="h-3 w-3" />
                Fegyver
              </TabsTrigger>
              <TabsTrigger value="armor" className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Páncél
              </TabsTrigger>
              <TabsTrigger value="consumable" className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Fogyóeszköz
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filterByType('all').map(item => (
                  <ShopItem key={item._id} item={item} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="weapon">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filterByType('weapon').map(item => (
                  <ShopItem key={item._id} item={item} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="armor">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filterByType('armor').map(item => (
                  <ShopItem key={item._id} item={item} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="consumable">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filterByType('consumable').map(item => (
                  <ShopItem key={item._id} item={item} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Shop Info */}
      <Card className="bg-slate-800/50 backdrop-blur border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-400">
            <Sparkles className="h-5 w-5" />
            Bolt Információk
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
              <div className="text-2xl mb-2">🛡️</div>
              <div className="font-medium text-blue-400 mb-1">Felszerelések</div>
              <div className="text-blue-200">Fegyverek és páncélok a harchoz</div>
            </div>
            <div className="text-center p-4 bg-green-900/20 rounded-lg border border-green-500/30">
              <div className="text-2xl mb-2">🧪</div>
              <div className="font-medium text-green-400 mb-1">Bájitalok</div>
              <div className="text-green-200">Gyógyító és erősítő italok</div>
            </div>
            <div className="text-center p-4 bg-purple-900/20 rounded-lg border border-purple-500/30">
              <div className="text-2xl mb-2">✨</div>
              <div className="font-medium text-purple-400 mb-1">Varázstárgyak</div>
              <div className="text-purple-200">Ritka és legendás tárgyak</div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
            <div className="flex items-center gap-2 text-yellow-400 mb-2">
              <Coins className="h-4 w-4" />
              <span className="font-medium">Tipp:</span>
            </div>
            <p className="text-sm text-yellow-200">
              A ritkaság színei: Szürke (Közönséges) → Zöld (Szokatlan) → Kék (Ritka) → Lila (Epikus) → Sárga (Legendás)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Shop;