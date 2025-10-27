import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuiz } from '@/contexts/QuizContext';
import { Trophy, Medal, Crown, Star, TrendingUp, Users, Calendar } from 'lucide-react';

interface LeaderboardUser {
  id: string;
  username: string;
  fullName: string;
  avatar?: string;
  totalScore: number;
  totalQuizzes: number;
  averageScore: number;
  level: number;
  achievements: string[];
  joinedAt: string;
}

const LeaderboardPage: React.FC = () => {
  const { quizHistory, categories } = useQuiz();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'weekly' | 'monthly'>('all');

  useEffect(() => {
    // Generate leaderboard data from quiz history and stored users
    const users = JSON.parse(localStorage.getItem('quiz_users') || '[]');
    const currentUser = JSON.parse(localStorage.getItem('quiz_user') || 'null');
    
    // Add current user if not in users array
    if (currentUser && !users.find((u: any) => u.id === currentUser.id)) {
      users.push({ ...currentUser, password: 'hidden' });
    }

    const leaderboard = users.map((user: any) => {
      const userHistory = quizHistory.filter(h => h.userId === user.id);
      const totalScore = userHistory.reduce((sum, h) => sum + h.score, 0);
      const totalQuizzes = userHistory.length;
      const averageScore = totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0;
      
      // Calculate level based on total score
      const level = Math.floor(totalScore / 100) + 1;
      
      // Generate some achievements based on performance
      const achievements = [];
      if (totalQuizzes >= 5) achievements.push('Quiz Enthusiast');
      if (totalQuizzes >= 10) achievements.push('Quiz Master');
      if (averageScore >= 80) achievements.push('High Scorer');
      if (totalScore >= 500) achievements.push('Point Collector');
      
      return {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        avatar: user.avatar,
        totalScore,
        totalQuizzes,
        averageScore,
        level,
        achievements,
        joinedAt: user.joinedAt || new Date().toISOString()
      };
    });

    // Sort by total score
    leaderboard.sort((a, b) => b.totalScore - a.totalScore);
    setLeaderboardData(leaderboard);
  }, [quizHistory]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-orange-500" />;
      default:
        return <Trophy className="w-6 h-6 text-muted-foreground" />;
    }
  };

  const getRankBadgeClass = (rank: number) => {
    switch (rank) {
      case 1:
        return 'rank-1';
      case 2:
        return 'rank-2';
      case 3:
        return 'rank-3';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const topThree = leaderboardData.slice(0, 3);
  const restOfLeaderboard = leaderboardData.slice(3);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
          Leaderboard
        </h1>
        <p className="text-lg text-muted-foreground">
          See how you rank against other quiz masters
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card text-center">
          <CardContent className="p-6">
            <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{leaderboardData.length}</div>
            <div className="text-sm text-muted-foreground">Total Players</div>
          </CardContent>
        </Card>
        <Card className="glass-card text-center">
          <CardContent className="p-6">
            <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{quizHistory.length}</div>
            <div className="text-sm text-muted-foreground">Quizzes Completed</div>
          </CardContent>
        </Card>
        <Card className="glass-card text-center">
          <CardContent className="p-6">
            <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {leaderboardData.length > 0 ? Math.round(leaderboardData.reduce((sum, user) => sum + user.averageScore, 0) / leaderboardData.length) : 0}
            </div>
            <div className="text-sm text-muted-foreground">Average Score</div>
          </CardContent>
        </Card>
      </div>

      {/* Top 3 Podium */}
      {topThree.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center space-x-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <span>Top Performers</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topThree.map((user, index) => (
                <div key={user.id} className="text-center space-y-4">
                  <div className="relative">
                    <Avatar className="w-20 h-20 mx-auto border-4 border-primary/20">
                      <AvatarImage src={user.avatar} alt={user.username} />
                      <AvatarFallback className="text-2xl font-bold bg-primary/20">
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -top-2 -right-2 rank-badge ${getRankBadgeClass(index + 1)}`}>
                      {index + 1}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-lg">{user.fullName}</h3>
                    <p className="text-muted-foreground">@{user.username}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-center space-x-2">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <span className="font-bold text-xl">{user.totalScore}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {user.totalQuizzes} quizzes • Level {user.level}
                    </div>
                  </div>
                  
                  {user.achievements.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-1">
                      {user.achievements.slice(0, 2).map((achievement, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs glass">
                          {achievement}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Leaderboard */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Full Rankings</CardTitle>
            <Tabs value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as any)}>
              <TabsList className="glass">
                <TabsTrigger value="all">All Time</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaderboardData.map((user, index) => (
              <div key={user.id} className="leaderboard-item">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                      <div className={`rank-badge ${getRankBadgeClass(index + 1)}`}>
                        {index + 1}
                      </div>
                      {getRankIcon(index + 1)}
                    </div>
                    
                    <Avatar className="w-12 h-12 border-2 border-primary/20">
                      <AvatarImage src={user.avatar} alt={user.username} />
                      <AvatarFallback className="font-semibold bg-primary/20">
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h3 className="font-semibold">{user.fullName}</h3>
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-right">
                    <div>
                      <div className="font-bold text-lg">{user.totalScore}</div>
                      <div className="text-xs text-muted-foreground">Total Score</div>
                    </div>
                    <div>
                      <div className="font-semibold">{user.averageScore}</div>
                      <div className="text-xs text-muted-foreground">Avg Score</div>
                    </div>
                    <div>
                      <div className="font-semibold">{user.totalQuizzes}</div>
                      <div className="text-xs text-muted-foreground">Quizzes</div>
                    </div>
                    <div>
                      <Badge variant="outline" className="glass">
                        Level {user.level}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {user.achievements.length > 0 && (
                  <div className="px-4 pb-4">
                    <div className="flex flex-wrap gap-1">
                      {user.achievements.map((achievement, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs glass">
                          <Star className="w-3 h-3 mr-1" />
                          {achievement}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {leaderboardData.length === 0 && (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No rankings yet</h3>
                <p className="text-muted-foreground">Be the first to take a quiz and claim the top spot!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Category Leaders */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Category Champions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(category => {
              const categoryHistory = quizHistory.filter(h => h.categoryId === category.id);
              const categoryLeader = categoryHistory.length > 0 
                ? categoryHistory.reduce((best, current) => current.score > best.score ? current : best)
                : null;
              
              const leader = categoryLeader 
                ? leaderboardData.find(u => u.id === categoryLeader.userId)
                : null;

              return (
                <div key={category.id} className="glass p-4 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center text-sm`}>
                      {category.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold">{category.name}</h4>
                      <p className="text-xs text-muted-foreground">{categoryHistory.length} attempts</p>
                    </div>
                  </div>
                  
                  {leader ? (
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={leader.avatar} alt={leader.username} />
                        <AvatarFallback className="text-xs bg-primary/20">
                          {leader.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{leader.fullName}</p>
                        <p className="text-xs text-muted-foreground">{categoryLeader?.score} points</p>
                      </div>
                      <Crown className="w-4 h-4 text-yellow-500" />
                    </div>
                  ) : (
                    <div className="text-center py-2">
                      <p className="text-sm text-muted-foreground">No attempts yet</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaderboardPage;