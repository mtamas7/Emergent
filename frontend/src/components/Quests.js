import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { mockQuests } from '../data/mock';
import { Scroll, CheckCircle, Clock, Gift } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const Quests = () => {
  const [quests, setQuests] = useState(mockQuests);
  const { toast } = useToast();

  const completeQuest = (questId) => {
    setQuests(prev => 
      prev.map(quest => 
        quest.id === questId 
          ? { ...quest, completed: true, active: false }
          : quest
      )
    );
    
    const quest = quests.find(q => q.id === questId);
    toast({
      title: "Küldetés Teljesítve!",
      description: `${quest.title} - ${quest.reward.experience} XP és ${quest.reward.gold} arany!`,
    });
  };

  const abandonQuest = (questId) => {
    setQuests(prev => 
      prev.map(quest => 
        quest.id === questId 
          ? { ...quest, active: false }
          : quest
      )
    );
    
    toast({
      title: "Küldetés Elhagyva",
      description: "A küldetés elhagyva.",
      variant: "destructive"
    });
  };

  const getQuestIcon = (type) => {
    const icons = {
      kill: "⚔️",
      collect: "📦", 
      level: "⭐",
      explore: "🗺️"
    };
    return icons[type] || "📋";
  };

  const getProgressPercentage = (progress, required) => {
    return Math.min((progress / required) * 100, 100);
  };

  const activeQuests = quests.filter(q => q.active && !q.completed);
  const completedQuests = quests.filter(q => q.completed);

  return (
    <div className="space-y-6">
      {/* Active Quests */}
      <Card className="bg-slate-800/50 backdrop-blur border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scroll className="h-5 w-5" />
            Aktív Küldetések ({activeQuests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeQuests.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nincs aktív küldetés</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeQuests.map(quest => (
                <Card key={quest.id} className="bg-slate-700/50 border border-purple-400/30">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getQuestIcon(quest.type)}</span>
                        <div>
                          <h3 className="font-bold text-white text-lg">{quest.title}</h3>
                          <Badge variant="outline" className="mt-1">
                            {quest.type}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {quest.progress >= quest.required && (
                          <Button 
                            size="sm"
                            onClick={() => completeQuest(quest.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Teljesít
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => abandonQuest(quest.id)}
                        >
                          Elhagy
                        </Button>
                      </div>
                    </div>

                    <p className="text-gray-300 mb-4">{quest.description}</p>

                    {/* Progress */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-purple-300">Haladás</span>
                        <span className="text-white">
                          {quest.progress} / {quest.required}
                          {quest.target && ` ${quest.target}`}
                        </span>
                      </div>
                      <Progress 
                        value={getProgressPercentage(quest.progress, quest.required)} 
                        className="h-3 bg-slate-600"
                      />
                    </div>

                    {/* Rewards */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2 text-blue-400">
                        <span>⭐</span>
                        <span>{quest.reward.experience} XP</span>
                      </div>
                      <div className="flex items-center gap-2 text-yellow-400">
                        <span>💰</span>
                        <span>{quest.reward.gold} Arany</span>
                      </div>
                      {quest.reward.item && (
                        <div className="flex items-center gap-2 text-purple-400">
                          <Gift className="h-4 w-4" />
                          <span>{quest.reward.item}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Quests */}
      {completedQuests.length > 0 && (
        <Card className="bg-slate-800/50 backdrop-blur border-green-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-400">
              <CheckCircle className="h-5 w-5" />
              Teljesített Küldetések ({completedQuests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedQuests.map(quest => (
                <div key={quest.id} className="flex items-center gap-3 p-3 bg-green-900/20 rounded-lg border border-green-500/30">
                  <span className="text-xl">{getQuestIcon(quest.type)}</span>
                  <div className="flex-1">
                    <h4 className="font-medium text-green-400">{quest.title}</h4>
                    <p className="text-sm text-green-200">{quest.description}</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quest Board - New Quests */}
      <Card className="bg-slate-800/50 backdrop-blur border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scroll className="h-5 w-5" />
            Küldetés Tábla
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-400 py-8">
            <Scroll className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Hamarosan</p>
            <p className="text-sm">Új küldetések lesznek elérhető itt!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Quests;