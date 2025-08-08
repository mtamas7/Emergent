import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import apiService, { getRarityColor } from '../services/api';
import { Sword, Shield, Zap, Heart, Star, Crown, Loader2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const CharacterSheet = () => {
  const [character, setCharacter] = useState(null);
  const [equippedItems, setEquippedItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    loadCharacterData();
  }, []);

  const loadCharacterData = async () => {
    try {
      setLoading(true);
      setError(null);
      const characterData = await apiService.getCharacter();
      setCharacter(characterData);
      
      // Load equipped items details
      await loadEquippedItems(characterData.equipment);
    } catch (err) {
      setError('Hiba a karakter betöltésekor');
      toast({
        title: "Hiba",
        description: "Nem sikerült betölteni a karakter adatait",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadEquippedItems = async (equipment) => {
    try {
      const inventory = await apiService.getInventory();
      const itemsById = {};
      
      inventory.forEach(item => {
        itemsById[item._id] = item;
      });

      const equipped = {};
      Object.entries(equipment).forEach(([slot, itemId]) => {
        if (itemId && itemsById[itemId]) {
          equipped[slot] = itemsById[itemId];
        }
      });
      
      setEquippedItems(equipped);
    } catch (err) {
      console.error('Error loading equipped items:', err);
    }
  };

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
          onClick={loadCharacterData}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Újrapróbálás
        </button>
      </div>
    );
  }

  if (!character) return null;

  const xpPercentage = (character.experience / character.experienceToNext) * 100;
  const hpPercentage = (character.health / character.maxHealth) * 100;
  const mpPercentage = (character.mana / character.maxMana) * 100;

  const StatIcon = ({ stat }) => {
    const icons = {
      strength: <Sword className="h-4 w-4" />,
      dexterity: <Zap className="h-4 w-4" />,
      intelligence: <Star className="h-4 w-4" />,
      constitution: <Heart className="h-4 w-4" />,
      wisdom: <Crown className="h-4 w-4" />,
      charisma: <Shield className="h-4 w-4" />
    };
    return icons[stat] || <Star className="h-4 w-4" />;
  };

  const getStatName = (stat) => {
    const names = {
      strength: "Erő",
      dexterity: "Ügyesség", 
      intelligence: "Intelligencia",
      constitution: "Állóképesség",
      wisdom: "Bölcsesség",
      charisma: "Karizma"
    };
    return names[stat] || stat;
  };

  const getSlotName = (slot) => {
    const names = {
      weapon: "Fegyver",
      armor: "Páncél",
      helmet: "Sisak",
      boots: "Csizma",
      accessory: "Kiegészítő"
    };
    return names[slot] || slot;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Character Info */}
      <Card className="lg:col-span-2 bg-slate-800/50 backdrop-blur border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl">
              🧙‍♂️
            </div>
            <div>
              <div className="text-white">{character.name}</div>
              <Badge variant="secondary" className="mt-1">Szint {character.level}</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* XP Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-purple-300">Tapasztalat</span>
              <span className="text-white">{character.experience} / {character.experienceToNext} XP</span>
            </div>
            <Progress value={xpPercentage} className="h-3 bg-slate-700" />
          </div>

          {/* HP & MP */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-red-300 flex items-center gap-1">
                  <Heart className="h-4 w-4" /> Élet
                </span>
                <span className="text-white">{character.health} / {character.maxHealth}</span>
              </div>
              <Progress value={hpPercentage} className="h-3 bg-slate-700 [&>div]:bg-red-500" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-blue-300 flex items-center gap-1">
                  <Zap className="h-4 w-4" /> Mana
                </span>
                <span className="text-white">{character.mana} / {character.maxMana}</span>
              </div>
              <Progress value={mpPercentage} className="h-3 bg-slate-700 [&>div]:bg-blue-500" />
            </div>
          </div>

          {/* Gold */}
          <div className="flex items-center justify-center gap-2 p-4 bg-yellow-600/20 rounded-lg border border-yellow-500/30">
            <span className="text-2xl">💰</span>
            <span className="text-xl font-bold text-yellow-400">{character.gold} Arany</span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(character.stats).map(([stat, value]) => (
              <div key={stat} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <StatIcon stat={stat} />
                  <span className="text-purple-300">{getStatName(stat)}</span>
                </div>
                <Badge variant="outline" className="text-white border-purple-400">
                  {value}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Equipment */}
      <Card className="bg-slate-800/50 backdrop-blur border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Felszerelés
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(character.equipment).map(([slot, itemId]) => {
            const item = equippedItems[slot];
            
            return (
              <div key={slot} className={`p-3 rounded-lg border ${item ? getRarityColor(item.rarity) + ' bg-slate-700/50' : 'bg-slate-700/30 border-slate-600'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-purple-300 uppercase">{getSlotName(slot)}</span>
                  {item && (
                    <Badge variant="outline" className={getRarityColor(item.rarity)}>
                      {item.rarity}
                    </Badge>
                  )}
                </div>
                <div className="font-medium text-white">
                  {item ? item.name : 'Nincs felszerelve'}
                </div>
                {item && (
                  <div className="text-sm text-gray-400 mt-1">
                    {item.damage && `Sebzés: ${item.damage}`}
                    {item.defense && `Védelem: ${item.defense}`}
                    {item.speed && `Sebesség: ${item.speed}`}
                    {item.strength && `Erő: +${item.strength}`}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default CharacterSheet;