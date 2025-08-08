import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { mockEnemies, mockCharacter } from '../data/mock';
import { Sword, Shield, Zap, Heart, Trophy, RotateCcw } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const Combat = () => {
  const [currentEnemy, setCurrentEnemy] = useState(null);
  const [playerHealth, setPlayerHealth] = useState(mockCharacter.health);
  const [enemyHealth, setEnemyHealth] = useState(0);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [combatLog, setCombatLog] = useState([]);
  const [battleEnded, setBattleEnded] = useState(false);
  const [victory, setVictory] = useState(false);
  const { toast } = useToast();

  const startBattle = (enemy) => {
    setCurrentEnemy(enemy);
    setEnemyHealth(enemy.health);
    setPlayerHealth(mockCharacter.health);
    setIsPlayerTurn(true);
    setCombatLog([`Harc kezdődik ${enemy.name} ellen!`]);
    setBattleEnded(false);
    setVictory(false);
  };

  const playerAttack = () => {
    if (!isPlayerTurn || battleEnded) return;

    const damage = Math.floor(Math.random() * mockCharacter.stats.strength) + 10;
    const actualDamage = Math.max(1, damage - currentEnemy.defense);
    
    setEnemyHealth(prev => {
      const newHealth = Math.max(0, prev - actualDamage);
      if (newHealth === 0) {
        setBattleEnded(true);
        setVictory(true);
        setCombatLog(prev => [...prev, `${actualDamage} sebzést okozol!`, `${currentEnemy.name} legyőzve!`]);
        toast({
          title: "Győzelem!",
          description: `${currentEnemy.experience} XP és ${currentEnemy.goldReward} arany szerzése!`,
        });
      } else {
        setCombatLog(prev => [...prev, `${actualDamage} sebzést okozol!`]);
      }
      return newHealth;
    });
    
    setIsPlayerTurn(false);
    
    // Enemy turn after 1 second
    setTimeout(() => {
      if (!battleEnded) {
        enemyAttack();
      }
    }, 1000);
  };

  const enemyAttack = () => {
    if (battleEnded) return;

    const damage = Math.floor(Math.random() * currentEnemy.attack) + 5;
    const actualDamage = Math.max(1, damage - 10); // Player has some defense
    
    setPlayerHealth(prev => {
      const newHealth = Math.max(0, prev - actualDamage);
      if (newHealth === 0) {
        setBattleEnded(true);
        setVictory(false);
        setCombatLog(prev => [...prev, `${currentEnemy.name} ${actualDamage} sebzést okoz!`, "Vereség!"]);
        toast({
          title: "Vereség!",
          description: "Próbáld újra!",
          variant: "destructive"
        });
      } else {
        setCombatLog(prev => [...prev, `${currentEnemy.name} ${actualDamage} sebzést okoz!`]);
      }
      return newHealth;
    });
    
    setIsPlayerTurn(true);
  };

  const resetBattle = () => {
    setCurrentEnemy(null);
    setPlayerHealth(mockCharacter.health);
    setEnemyHealth(0);
    setIsPlayerTurn(true);
    setCombatLog([]);
    setBattleEnded(false);
    setVictory(false);
  };

  if (!currentEnemy) {
    return (
      <div className="space-y-6">
        <Card className="bg-slate-800/50 backdrop-blur border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sword className="h-5 w-5" />
              Válassz Ellenfelet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockEnemies.map(enemy => (
                <Card key={enemy.id} className="bg-slate-700/50 hover:bg-slate-600/50 transition-colors cursor-pointer">
                  <CardContent className="p-4" onClick={() => startBattle(enemy)}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{enemy.image}</span>
                      <div>
                        <h3 className="font-bold text-white">{enemy.name}</h3>
                        <Badge variant="outline">Szint {enemy.level}</Badge>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm text-gray-300">
                      <div className="flex justify-between">
                        <span>Élet:</span>
                        <span>{enemy.health}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Támadás:</span>
                        <span>{enemy.attack}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Védelem:</span>
                        <span>{enemy.defense}</span>
                      </div>
                      <div className="flex justify-between text-yellow-400">
                        <span>Jutalom:</span>
                        <span>{enemy.experience} XP, {enemy.goldReward} Arany</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Battle Arena */}
      <Card className="bg-slate-800/50 backdrop-blur border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sword className="h-5 w-5" />
              Harc Arena
            </span>
            <Button variant="outline" size="sm" onClick={resetBattle}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Vissza
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Player */}
            <div className="text-center space-y-4">
              <div className="text-6xl">🧙‍♂️</div>
              <h3 className="text-xl font-bold text-white">{mockCharacter.name}</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-red-300">Élet</span>
                  <span className="text-white">{playerHealth} / {mockCharacter.maxHealth}</span>
                </div>
                <Progress 
                  value={(playerHealth / mockCharacter.maxHealth) * 100} 
                  className="h-4 bg-slate-700 [&>div]:bg-red-500" 
                />
              </div>
              {isPlayerTurn && !battleEnded && (
                <div className="space-y-2">
                  <Button onClick={playerAttack} className="w-full" size="lg">
                    <Sword className="h-4 w-4 mr-2" />
                    Támadás
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm">
                      <Shield className="h-4 w-4 mr-1" />
                      Védelem
                    </Button>
                    <Button variant="outline" size="sm">
                      <Zap className="h-4 w-4 mr-1" />
                      Varázslat
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* VS */}
            <div className="flex items-center justify-center">
              <span className="text-4xl font-bold text-purple-400">VS</span>
            </div>

            {/* Enemy */}
            <div className="text-center space-y-4">
              <div className="text-6xl">{currentEnemy.image}</div>
              <h3 className="text-xl font-bold text-white">{currentEnemy.name}</h3>
              <Badge variant="outline">Szint {currentEnemy.level}</Badge>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-red-300">Élet</span>
                  <span className="text-white">{enemyHealth} / {currentEnemy.maxHealth}</span>
                </div>
                <Progress 
                  value={(enemyHealth / currentEnemy.maxHealth) * 100} 
                  className="h-4 bg-slate-700 [&>div]:bg-red-500" 
                />
              </div>
              {!isPlayerTurn && !battleEnded && (
                <Badge variant="destructive">Ellenfél köre...</Badge>
              )}
            </div>
          </div>

          {/* Battle Result */}
          {battleEnded && (
            <div className="mt-8 text-center">
              {victory ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 text-green-400">
                    <Trophy className="h-8 w-8" />
                    <span className="text-2xl font-bold">Győzelem!</span>
                  </div>
                  <div className="space-y-2">
                    <div className="text-yellow-400">+{currentEnemy.experience} XP</div>
                    <div className="text-yellow-400">+{currentEnemy.goldReward} Arany</div>
                  </div>
                  <Button onClick={resetBattle} size="lg">
                    Új Harc
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-red-400 text-2xl font-bold">Vereség!</div>
                  <Button onClick={resetBattle} variant="outline" size="lg">
                    Próbáld Újra
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Combat Log */}
      <Card className="bg-slate-800/50 backdrop-blur border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-lg">Harc Napló</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {combatLog.map((log, index) => (
              <div key={index} className="text-sm text-gray-300 p-2 bg-slate-700/30 rounded">
                {log}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Combat;