import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { mockInventory, getRarityColor, getRarityBg } from '../data/mock';
import { Package, Sword, Shield, Sparkles, Trash2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const Inventory = () => {
  const [inventory, setInventory] = useState(mockInventory);
  const { toast } = useToast();

  const filterByType = (type) => {
    if (type === 'all') return inventory;
    return inventory.filter(item => item.type === type);
  };

  const useItem = (item) => {
    if (item.type === 'consumable') {
      if (item.quantity > 1) {
        setInventory(prev => 
          prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i)
        );
      } else {
        setInventory(prev => prev.filter(i => i.id !== item.id));
      }
      
      toast({
        title: "Tárgy használva",
        description: `${item.name} használatba véve!`,
      });
    } else {
      toast({
        title: "Felszerelve",
        description: `${item.name} felszerelve!`,
      });
    }
  };

  const sellItem = (item) => {
    const sellPrice = Math.floor((item.value || 10) * 0.5);
    
    if (item.quantity > 1) {
      setInventory(prev => 
        prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i)
      );
    } else {
      setInventory(prev => prev.filter(i => i.id !== item.id));
    }
    
    toast({
      title: "Tárgy eladva",
      description: `${item.name} eladva ${sellPrice} aranyért!`,
    });
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
        </div>

        <div className="flex gap-2">
          {item.type === 'consumable' ? (
            <Button 
              size="sm" 
              onClick={() => useItem(item)}
              className="flex-1"
            >
              Használ
            </Button>
          ) : (
            <Button 
              size="sm" 
              onClick={() => useItem(item)}
              className="flex-1"
            >
              Felszerel
            </Button>
          )}
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => sellItem(item)}
            className="px-3"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card className="bg-slate-800/50 backdrop-blur border-purple-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Inventár
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
                <InventoryItem key={item.id} item={item} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="weapon" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterByType('weapon').map(item => (
                <InventoryItem key={item.id} item={item} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="armor" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterByType('armor').map(item => (
                <InventoryItem key={item.id} item={item} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="consumable" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterByType('consumable').map(item => (
                <InventoryItem key={item.id} item={item} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="misc" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterByType('misc').map(item => (
                <InventoryItem key={item.id} item={item} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default Inventory;