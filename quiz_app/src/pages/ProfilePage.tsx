import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuiz } from '@/contexts/QuizContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Trophy, 
  Star, 
  Calendar, 
  TrendingUp, 
  Award,
  Edit,
  Save,
  X,
  Camera
} from 'lucide-react';
import { toast } from 'sonner';

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { quizHistory, getUserStats, categories } = useQuiz();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: user?.fullName || '',
    username: user?.username || '',
    email: user?.email || ''
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="glass-card max-w-md">
          <CardContent className="p-8 text-center">
            <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Please log in</h2>
            <p className="text-muted-foreground">You need to be logged in to view your profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userStats = getUserStats(user.id);
  const userHistory = quizHistory.filter(h => h.userId === user.id);
  const recentQuizzes = userHistory.slice(-5).reverse();

  // Calculate level progress
  const currentLevelScore = user.level * 100;
  const nextLevelScore = (user.level + 1) * 100;
  const progressToNextLevel = ((user.totalScore - currentLevelScore) / (nextLevelScore - currentLevelScore)) * 100;

  // Get category performance
  const categoryPerformance = categories.map(category => {
    const categoryQuizzes = userHistory.filter(h => h.categoryId === category.id);
    const totalScore = categoryQuizzes.reduce((sum, quiz) => sum + quiz.score, 0);
    const averageScore = categoryQuizzes.length > 0 ? Math.round(totalScore / categoryQuizzes.length) : 0;
    
    return {
      ...category,
      attempts: categoryQuizzes.length,
      averageScore,
      totalScore
    };
  });

  // Achievement system
  const achievements = [
    {
      id: 'first_quiz',
      name: 'First Steps',
      description: 'Complete your first quiz',
      icon: '🎯',
      earned: userStats.totalQuizzes >= 1,
      progress: Math.min(userStats.totalQuizzes, 1),
      target: 1
    },
    {
      id: 'quiz_enthusiast',
      name: 'Quiz Enthusiast',
      description: 'Complete 5 quizzes',
      icon: '📚',
      earned: userStats.totalQuizzes >= 5,
      progress: Math.min(userStats.totalQuizzes, 5),
      target: 5
    },
    {
      id: 'quiz_master',
      name: 'Quiz Master',
      description: 'Complete 10 quizzes',
      icon: '🏆',
      earned: userStats.totalQuizzes >= 10,
      progress: Math.min(userStats.totalQuizzes, 10),
      target: 10
    },
    {
      id: 'high_scorer',
      name: 'High Scorer',
      description: 'Achieve an average score of 80+',
      icon: '⭐',
      earned: userStats.averageScore >= 80,
      progress: Math.min(userStats.averageScore, 80),
      target: 80
    },
    {
      id: 'point_collector',
      name: 'Point Collector',
      description: 'Earn 500 total points',
      icon: '💎',
      earned: userStats.totalScore >= 500,
      progress: Math.min(userStats.totalScore, 500),
      target: 500
    },
    {
      id: 'perfectionist',
      name: 'Perfectionist',
      description: 'Get 100% on any quiz',
      icon: '🎖️',
      earned: userHistory.some(quiz => (quiz.correctAnswers / quiz.totalQuestions) === 1),
      progress: userHistory.some(quiz => (quiz.correctAnswers / quiz.totalQuestions) === 1) ? 1 : 0,
      target: 1
    }
  ];

  const handleSaveProfile = () => {
    updateUser({
      fullName: editForm.fullName,
      username: editForm.username,
      email: editForm.email
    });
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const handleCancelEdit = () => {
    setEditForm({
      fullName: user.fullName,
      username: user.username,
      email: user.email
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <Card className="glass-card">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-primary/20">
                <AvatarImage src={user.avatar} alt={user.username} />
                <AvatarFallback className="text-4xl font-bold bg-primary/20">
                  {user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                className="absolute bottom-0 right-0 rounded-full w-10 h-10 p-0 btn-primary"
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={editForm.fullName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                      className="glass mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={editForm.username}
                      onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                      className="glass mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                      className="glass mt-1"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleSaveProfile} className="btn-success">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button onClick={handleCancelEdit} variant="outline" className="glass-button">
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <h1 className="text-3xl font-bold">{user.fullName}</h1>
                    <p className="text-lg text-muted-foreground">@{user.username}</p>
                    <p className="text-muted-foreground">{user.email}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <Badge variant="outline" className="glass">
                      <Trophy className="w-4 h-4 mr-1" />
                      Level {user.level}
                    </Badge>
                    <Badge variant="outline" className="glass">
                      <Calendar className="w-4 h-4 mr-1" />
                      Joined {new Date(user.joinedAt).toLocaleDateString()}
                    </Badge>
                    {user.isAdmin && (
                      <Badge variant="secondary" className="glass border-primary text-primary">
                        Admin
                      </Badge>
                    )}
                  </div>
                  
                  <Button onClick={() => setIsEditing(true)} variant="outline" className="glass-button">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </>
              )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass p-4 rounded-lg text-center">
                <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
                <div className="text-xl font-bold">{userStats.totalScore}</div>
                <div className="text-xs text-muted-foreground">Total Score</div>
              </div>
              <div className="glass p-4 rounded-lg text-center">
                <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-1" />
                <div className="text-xl font-bold">{userStats.averageScore}</div>
                <div className="text-xs text-muted-foreground">Avg Score</div>
              </div>
            </div>
          </div>

          {/* Level Progress */}
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Level {user.level} Progress</span>
              <span>{Math.round(progressToNextLevel)}%</span>
            </div>
            <Progress value={progressToNextLevel} className="progress-glow" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{currentLevelScore} pts</span>
              <span>{nextLevelScore} pts</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="glass grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span>Quiz Stats</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Quizzes:</span>
                  <span className="font-semibold">{userStats.totalQuizzes}</span>
                </div>
                <div className="flex justify-between">
                  <span>Best Category:</span>
                  <span className="font-semibold">{userStats.bestCategory}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Points:</span>
                  <span className="font-semibold">{userStats.totalScore}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-purple-500" />
                  <span>Achievements</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold">{achievements.filter(a => a.earned).length}</div>
                  <div className="text-sm text-muted-foreground">of {achievements.length} earned</div>
                  <Progress 
                    value={(achievements.filter(a => a.earned).length / achievements.length) * 100} 
                    className="mt-2 progress-glow" 
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span>Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Average Score:</span>
                  <span className="font-semibold">{userStats.averageScore}</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Level:</span>
                  <span className="font-semibold">{user.level}</span>
                </div>
                <div className="flex justify-between">
                  <span>Next Level:</span>
                  <span className="font-semibold">{nextLevelScore - user.totalScore} pts</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Quizzes */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Recent Quizzes</CardTitle>
            </CardHeader>
            <CardContent>
              {recentQuizzes.length > 0 ? (
                <div className="space-y-3">
                  {recentQuizzes.map((quiz) => (
                    <div key={quiz.id} className="flex items-center justify-between p-3 glass rounded-lg">
                      <div>
                        <h4 className="font-medium">{quiz.categoryName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(quiz.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{quiz.score} pts</div>
                        <div className="text-sm text-muted-foreground">
                          {quiz.correctAnswers}/{quiz.totalQuestions}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No quizzes completed yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className={`achievement-badge ${achievement.earned ? 'achievement-earned' : ''}`}>
                <CardContent className="p-6">
                  <div className="text-4xl mb-3">{achievement.icon}</div>
                  <h3 className="font-semibold mb-2">{achievement.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{achievement.description}</p>
                  
                  {achievement.earned ? (
                    <Badge className="w-full justify-center bg-green-500/20 text-green-500 border-green-500">
                      <Award className="w-4 h-4 mr-1" />
                      Earned
                    </Badge>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span>{achievement.progress}/{achievement.target}</span>
                      </div>
                      <Progress 
                        value={(achievement.progress / achievement.target) * 100} 
                        className="h-2" 
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Quiz History</CardTitle>
            </CardHeader>
            <CardContent>
              {userHistory.length > 0 ? (
                <div className="space-y-3">
                  {userHistory.reverse().map((quiz) => (
                    <div key={quiz.id} className="flex items-center justify-between p-4 glass rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                          <Trophy className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{quiz.categoryName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(quiz.completedAt).toLocaleDateString()} • 
                            {Math.floor(quiz.timeSpent / 60)}m {quiz.timeSpent % 60}s
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-lg">{quiz.score} pts</div>
                        <div className="text-sm text-muted-foreground">
                          {quiz.correctAnswers}/{quiz.totalQuestions} correct
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {Math.round((quiz.correctAnswers / quiz.totalQuestions) * 100)}% accuracy
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No quiz history</h3>
                  <p className="text-muted-foreground">Start taking quizzes to see your history here!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categoryPerformance.map((category) => (
              <Card key={category.id} className="glass-card">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center`}>
                      {category.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{category.attempts} attempts</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-xl font-bold">{category.averageScore}</div>
                      <div className="text-xs text-muted-foreground">Avg Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold">{category.totalScore}</div>
                      <div className="text-xs text-muted-foreground">Total Points</div>
                    </div>
                  </div>
                  
                  {category.attempts > 0 ? (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Performance</span>
                        <span>{Math.round((category.averageScore / 100) * 100)}%</span>
                      </div>
                      <Progress value={(category.averageScore / 100) * 100} className="h-2" />
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">No attempts yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;