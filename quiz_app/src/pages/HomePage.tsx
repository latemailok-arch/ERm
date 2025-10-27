import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuiz } from '@/contexts/QuizContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Users, Brain, Zap, Star, Play, TrendingUp } from 'lucide-react';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { categories, getUserStats } = useQuiz();

  const userStats = user ? getUserStats(user.id) : null;

  const features = [
    {
      icon: <Brain className="w-8 h-8 text-blue-500" />,
      title: "Multiple Question Types",
      description: "MCQ, Short Answer, True/False, and Fill in the Blank questions"
    },
    {
      icon: <Trophy className="w-8 h-8 text-yellow-500" />,
      title: "Leaderboard System",
      description: "Compete with other users and climb the rankings"
    },
    {
      icon: <Star className="w-8 h-8 text-purple-500" />,
      title: "Achievement Badges",
      description: "Unlock achievements as you progress through quizzes"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-green-500" />,
      title: "Progress Tracking",
      description: "Monitor your performance and improvement over time"
    }
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12">
        <div className="animate-slide-up">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent mb-6">
            QuizMaster
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Challenge yourself with interactive quizzes, earn points, and compete with others in this modern quiz platform
          </p>
        </div>
        
        {!user ? (
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-scale-in">
            <Button size="lg" asChild className="btn-primary text-lg px-8 py-4">
              <Link to="/register">
                <Play className="mr-2 h-5 w-5" />
                Get Started
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="glass-button text-lg px-8 py-4">
              <Link to="/login">Login</Link>
            </Button>
          </div>
        ) : (
          <div className="animate-scale-in">
            <Button size="lg" asChild className="btn-primary text-lg px-8 py-4">
              <Link to="/quiz">
                <Play className="mr-2 h-5 w-5" />
                Start Quiz
              </Link>
            </Button>
          </div>
        )}
      </section>

      {/* User Stats Section */}
      {user && userStats && (
        <section className="animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="glass-card">
              <CardContent className="p-6 text-center">
                <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{userStats.totalScore}</div>
                <div className="text-sm text-muted-foreground">Total Score</div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-6 text-center">
                <Brain className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{userStats.totalQuizzes}</div>
                <div className="text-sm text-muted-foreground">Quizzes Taken</div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-6 text-center">
                <Zap className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{userStats.averageScore}</div>
                <div className="text-sm text-muted-foreground">Average Score</div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-6 text-center">
                <Star className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{user.level}</div>
                <div className="text-sm text-muted-foreground">Level</div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Quiz Categories</h2>
          <p className="text-lg text-muted-foreground">Choose from various topics and test your knowledge</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <Card key={category.id} className="glass-card hover:scale-105 transition-all duration-300 group" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${category.color} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300`}>
                    {category.icon}
                  </div>
                  <Badge variant="secondary" className="glass">
                    {category.questionCount} questions
                  </Badge>
                </div>
                <CardTitle className="text-xl">{category.name}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {category.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full btn-primary">
                  <Link to={`/quiz/${category.id}`}>
                    <Play className="mr-2 h-4 w-4" />
                    Start Quiz
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose QuizMaster?</h2>
          <p className="text-lg text-muted-foreground">Discover what makes our quiz platform special</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="glass-card text-center hover:scale-105 transition-all duration-300" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardContent className="p-6">
                <div className="mb-4 flex justify-center animate-float" style={{ animationDelay: `${index * 0.5}s` }}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="text-center py-12 space-y-6">
          <div className="glass-card max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-4">Ready to Test Your Knowledge?</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Join thousands of users who are already improving their knowledge with QuizMaster
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="btn-primary">
                  <Link to="/register">
                    <Users className="mr-2 h-5 w-5" />
                    Join Now
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="glass-button">
                  <Link to="/leaderboard">
                    <Trophy className="mr-2 h-5 w-5" />
                    View Leaderboard
                  </Link>
                </Button>
              </div>
            </CardContent>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;