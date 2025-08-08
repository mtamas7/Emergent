import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import apiService from '../services/api';
import { Scroll, CheckCircle, Clock, Gift, Loader2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const Quests = () => {
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    loadQuests();
  }, []);

  const loadQuests = async () => {
    try {
      setLoading(true);
      setError(null);
      const questsData = await apiService.getQuests();
      setQuests(questsData);
    } catch (err) {
      setError('Hiba a küldetések betöltésekor');
      toast({
        title: "Hiba",
        description: "Nem sikerült betölteni a küldetéseket",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const completeQuest = async (questId) => {
    if (actionLoading) return;
    
    try {
      setActionLoading(questId);
      
      const result = await apiService.completeQuest('player1', questId);
      
      toast({
        title: "Küldetés Teljesítve!",
        description: result.message,
      });
      
      // Show rewards
      if (result.rewards) {
        const rewardText = [];
        if (result.rewards.experience > 0) rewardText.push(`${result.rewards.experience} XP`);
        if (result.rewards.gold > 0) rewardText.push(`${result.rewards.gold} arany`);
        if (result.rewards.item) rewardText.push(`Tárgy jutalom`);
        
        if (rewardText.length > 0) {
          toast({
            title: "Jutalmak",
            description: rewardText.join(', '),
          });
        }
      }
      
      // Reload quests
      await loadQuests();
      
    } catch (error) {
      toast({
        title: "Hiba",
        description: error.response?.data?.detail || "Nem sikerült teljesíteni a küldetést",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const abandonQuest = async (questId) => {
    // For now, just show a message since we don't have abandon endpoint
    toast({
      title: "Küldetés Elhagyva",
      description: "A küldetés elhagyva. (Mock funkcionalitás)",
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

  const canComplete = (quest) => {
    return quest.progress >= quest.required && quest.active && !quest.completed;
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
          onClick={loadQuests}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Újrapróbálás
        </button>
      </div>
    );
  }

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
                <Card key={quest.id || quest._id} className="bg-slate-700/50 border border-purple-400/30">
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
                        {canComplete(quest) && (
                          <Button 
                            size="sm"
                            onClick={() => completeQuest(quest.questId || quest._id)}
                            className="bg-green-600 hover:bg-green-700"
                            disabled={actionLoading === (quest.questId || quest._id)}
                          >
                            {actionLoading === (quest.questId || quest._id) ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-1" />
                            )}
                            Teljesít
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => abandonQuest(quest.questId || quest._id)}
                          disabled={actionLoading}
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
                      {quest.reward.experience > 0 && (
                        <div className="flex items-center gap-2 text-blue-400">
                          <span>⭐</span>
                          <span>{quest.reward.experience} XP</span>
                        </div>
                      )}
                      {quest.reward.gold > 0 && (
                        <div className="flex items-center gap-2 text-yellow-400">
                          <span>💰</span>
                          <span>{quest.reward.gold} Arany</span>
                        </div>
                      )}
                      {quest.reward.item && (
                        <div className="flex items-center gap-2 text-purple-400">
                          <Gift className="h-4 w-4" />
                          <span>Tárgy jutalom</span>
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
                <div key={quest.id || quest._id} className="flex items-center gap-3 p-3 bg-green-900/20 rounded-lg border border-green-500/30">
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