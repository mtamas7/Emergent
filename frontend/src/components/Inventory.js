import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import apiService, { getRarityColor, getRarityBg } from '../services/api';
import { Package, Sword, Shield, Sparkles, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const inventoryData = await apiService.getInventory();
      setInventory(inventoryData);
    } catch (err) {
      setError('Hiba az inventár betöltésekor');
      toast({
        title: "Hiba",
        description: "Nem sikerült betölteni az inventárt",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterByType = (type) => {
    if (type === 'all') return inventory;
    return inventory.filter(item => item.type === type);
  };

  const useItem = async (item) => {
    if (actionLoading) return;
    
    try {
      setActionLoading(item._id);
      
      if (item.type === 'consumable') {
        const result = await apiService.useItem('player1', item._id, 1);
        toast({
          title: "Tárgy használva",
          description: result.message,
        });
      } else {
        const result = await apiService.equipItem('player1', item._id);
        toast({
          title: "Felszerelve",
          description: result.message,
        });
      }
      
      // Reload inventory to reflect changes
      await loadInventory();
      
    } catch (error) {
      toast({
        title: "Hiba",
        description: error.response?.data?.detail || "Nem sikerült használni a tárgyat",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const sellItem = async (item) => {
    if (actionLoading) return;
    
    try {
      setActionLoading(`sell_${item._id}`);
      
      const result = await apiService.sellItem('player1', item._id, 1);
      toast({
        title: "Tárgy eladva",
        description: result.message,
      });
      
      // Reload inventory to reflect changes
      await loadInventory();
      
    } catch (error) {
      toast({
        title: "Hiba",
        description: error.response?.data?.detail || "Nem sikerült eladni a tárgyat",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const InventoryItem = ({ item }) => (
    <Card className={`${getRarityBg(item.rarity)} border-2 hover:shadow-lg transition-all`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className={`font-bold ${getRarityColor(item.rarity)}`}>{item.name}</h3>
            <Badge variant="outline" className="mt-1 text-xs">
              {item.type}
            </Badge>
          </div>
          {item.quantity > 1 && (
            <Badge variant="secondary" className="ml-2">
              {item.quantity}x
            </Badge>
          )}
        </div>

        <div className="space-y-1 text-sm text-gray-600 mb-3">
          {item.damage && <div>Sebzés: {item.damage}</div>}
          {item.defense && <div>Védelem: {item.defense}</div>}
          {item.effect && <div>Hatás: {item.effect}</div>}
          {item.value && <div>Érték: {item.value}</div>}
          {item.speed && <div>Sebesség: +{item.speed}</div>}
          {item.strength && <div>Erő: +{item.strength}</div>}
        </div>

        <div className="flex gap-2">
          <Button 
            size="sm" 
            onClick={() => useItem(item)}
            className="flex-1"
            disabled={actionLoading === item._id}
          >
            {actionLoading === item._id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                {item.type === 'consumable' ? 'Használ' : 'Felszerel'}
              </>
            )}
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => sellItem(item)}
            className="px-3"
            disabled={actionLoading === `sell_${item._id}`}
          >
            {actionLoading === `sell_${item._id}` ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
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
          onClick={loadInventory}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Újrapróbálás
        </button>
      </div>
    );
  }

  return (
    <Card className="bg-slate-800/50 backdrop-blur border-purple-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Inventár ({inventory.length} tárgy)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-slate-700/50">
            <TabsTrigger value="all">Mind</TabsTrigger>
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
            <TabsTrigger value="misc">Egyéb</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterByType('all').map(item => (
                <InventoryItem key={item._id} item={item} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="weapon" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterByType('weapon').map(item => (
                <InventoryItem key={item._id} item={item} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="armor" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterByType('armor').map(item => (
                <InventoryItem key={item._id} item={item} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="consumable" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterByType('consumable').map(item => (
                <InventoryItem key={item._id} item={item} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="misc" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterByType('misc').map(item => (
                <InventoryItem key={item._id} item={item} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default Inventory;