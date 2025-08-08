import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import CharacterSheet from './CharacterSheet';
import Inventory from './Inventory';
import Combat from './Combat';
import Quests from './Quests';
import Shop from './Shop';
import { Sword, Shield, Scroll, ShoppingBag, User } from 'lucide-react';

const GameLayout = () => {
  const [activeTab, setActiveTab] = useState('character');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto p-4">
        <Card className="mb-6 bg-slate-800/50 backdrop-blur border-purple-500/20">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              ⚔️ Fantasy RPG Kaland ⚔️
            </CardTitle>
          </CardHeader>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6 bg-slate-800/50 backdrop-blur">
            <TabsTrigger value="character" className="flex items-center gap-2 data-[state=active]:bg-purple-600">
              <User className="h-4 w-4" />
              Karakter
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2 data-[state=active]:bg-purple-600">
              <Shield className="h-4 w-4" />
              Inventár
            </TabsTrigger>
            <TabsTrigger value="combat" className="flex items-center gap-2 data-[state=active]:bg-purple-600">
              <Sword className="h-4 w-4" />
              Harc
            </TabsTrigger>
            <TabsTrigger value="quests" className="flex items-center gap-2 data-[state=active]:bg-purple-600">
              <Scroll className="h-4 w-4" />
              Küldetések
            </TabsTrigger>
            <TabsTrigger value="shop" className="flex items-center gap-2 data-[state=active]:bg-purple-600">
              <ShoppingBag className="h-4 w-4" />
              Bolt
            </TabsTrigger>
          </TabsList>

          <TabsContent value="character">
            <CharacterSheet />
          </TabsContent>

          <TabsContent value="inventory">
            <Inventory />
          </TabsContent>

          <TabsContent value="combat">
            <Combat />
          </TabsContent>

          <TabsContent value="quests">
            <Quests />
          </TabsContent>

          <TabsContent value="shop">
            <Shop />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GameLayout;