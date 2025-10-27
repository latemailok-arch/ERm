import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuiz, Question } from '@/contexts/QuizContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  BookOpen, 
  TrendingUp, 
  BarChart3,
  Save,
  X,
  FileText,
  Clock,
  Target
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { categories, getQuestionsByCategory, addQuestion, updateQuestion, deleteQuestion, quizHistory } = useQuiz();
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [newQuestion, setNewQuestion] = useState({
    type: 'mcq' as Question['type'],
    category: 'general',
    difficulty: 'easy' as Question['difficulty'],
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: '',
    points: 10,
    timeLimit: 30
  });

  useEffect(() => {
    if (!user?.isAdmin) {
      return;
    }
    setQuestions(getQuestionsByCategory(selectedCategory));
  }, [selectedCategory, user, getQuestionsByCategory]);

  if (!user?.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="glass-card max-w-md">
          <CardContent className="p-8 text-center">
            <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You need admin privileges to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Analytics data
  const totalUsers = JSON.parse(localStorage.getItem('quiz_users') || '[]').length + 1; // +1 for current user
  const totalQuestions = categories.reduce((sum, cat) => sum + getQuestionsByCategory(cat.id).length, 0);
  const totalQuizzes = quizHistory.length;
  const averageScore = quizHistory.length > 0 
    ? Math.round(quizHistory.reduce((sum, quiz) => sum + quiz.score, 0) / quizHistory.length)
    : 0;

  const handleAddQuestion = () => {
    if (!newQuestion.question.trim() || !newQuestion.correctAnswer.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (newQuestion.type === 'mcq' && newQuestion.options.some(opt => !opt.trim())) {
      toast.error('Please fill in all answer options');
      return;
    }

    addQuestion(newQuestion);
    setNewQuestion({
      type: 'mcq',
      category: selectedCategory,
      difficulty: 'easy',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: '',
      points: 10,
      timeLimit: 30
    });
    setIsAddingQuestion(false);
    setQuestions(getQuestionsByCategory(selectedCategory));
    toast.success('Question added successfully!');
  };

  const handleUpdateQuestion = () => {
    if (!editingQuestion) return;

    updateQuestion(editingQuestion.id, editingQuestion);
    setEditingQuestion(null);
    setQuestions(getQuestionsByCategory(selectedCategory));
    toast.success('Question updated successfully!');
  };

  const handleDeleteQuestion = (questionId: string) => {
    deleteQuestion(questionId);
    setQuestions(getQuestionsByCategory(selectedCategory));
    toast.success('Question deleted successfully!');
  };

  const resetNewQuestion = () => {
    setNewQuestion({
      type: 'mcq',
      category: selectedCategory,
      difficulty: 'easy',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: '',
      points: 10,
      timeLimit: 30
    });
    setIsAddingQuestion(false);
  };

  const QuestionForm = ({ 
    question, 
    setQuestion, 
    onSave, 
    onCancel, 
    title 
  }: {
    question: any;
    setQuestion: (q: any) => void;
    onSave: () => void;
    onCancel: () => void;
    title: string;
  }) => (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Question Type</Label>
            <Select value={question.type} onValueChange={(value) => setQuestion({...question, type: value})}>
              <SelectTrigger className="glass">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass border-white/10">
                <SelectItem value="mcq">Multiple Choice</SelectItem>
                <SelectItem value="short_answer">Short Answer</SelectItem>
                <SelectItem value="true_false">True/False</SelectItem>
                <SelectItem value="fill_blank">Fill in the Blank</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Difficulty</Label>
            <Select value={question.difficulty} onValueChange={(value) => setQuestion({...question, difficulty: value})}>
              <SelectTrigger className="glass">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass border-white/10">
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Question</Label>
          <Textarea
            value={question.question}
            onChange={(e) => setQuestion({...question, question: e.target.value})}
            placeholder="Enter your question here..."
            className="glass"
          />
        </div>

        {question.type === 'mcq' && (
          <div>
            <Label>Answer Options</Label>
            <div className="space-y-2">
              {question.options.map((option: string, index: number) => (
                <Input
                  key={index}
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...question.options];
                    newOptions[index] = e.target.value;
                    setQuestion({...question, options: newOptions});
                  }}
                  placeholder={`Option ${index + 1}`}
                  className="glass"
                />
              ))}
            </div>
          </div>
        )}

        <div>
          <Label>Correct Answer</Label>
          <Input
            value={question.correctAnswer}
            onChange={(e) => setQuestion({...question, correctAnswer: e.target.value})}
            placeholder="Enter the correct answer"
            className="glass"
          />
        </div>

        <div>
          <Label>Explanation (Optional)</Label>
          <Textarea
            value={question.explanation}
            onChange={(e) => setQuestion({...question, explanation: e.target.value})}
            placeholder="Explain why this is the correct answer..."
            className="glass"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Points</Label>
            <Input
              type="number"
              value={question.points}
              onChange={(e) => setQuestion({...question, points: parseInt(e.target.value) || 10})}
              min="1"
              max="100"
              className="glass"
            />
          </div>
          
          <div>
            <Label>Time Limit (seconds)</Label>
            <Input
              type="number"
              value={question.timeLimit}
              onChange={(e) => setQuestion({...question, timeLimit: parseInt(e.target.value) || 30})}
              min="10"
              max="300"
              className="glass"
            />
          </div>
        </div>

        <div className="flex space-x-2">
          <Button onClick={onSave} className="btn-success">
            <Save className="w-4 h-4 mr-2" />
            Save Question
          </Button>
          <Button onClick={onCancel} variant="outline" className="glass-button">
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-lg text-muted-foreground">
          Manage questions, view analytics, and oversee the quiz platform
        </p>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="stat-card">
          <CardContent className="p-6">
            <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{totalUsers}</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </CardContent>
        </Card>
        
        <Card className="stat-card">
          <CardContent className="p-6">
            <BookOpen className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{totalQuestions}</div>
            <div className="text-sm text-muted-foreground">Total Questions</div>
          </CardContent>
        </Card>
        
        <Card className="stat-card">
          <CardContent className="p-6">
            <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{totalQuizzes}</div>
            <div className="text-sm text-muted-foreground">Quizzes Taken</div>
          </CardContent>
        </Card>
        
        <Card className="stat-card">
          <CardContent className="p-6">
            <Target className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{averageScore}</div>
            <div className="text-sm text-muted-foreground">Average Score</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="questions" className="space-y-6">
        <TabsList className="glass grid w-full grid-cols-3">
          <TabsTrigger value="questions">Question Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>

        {/* Question Management */}
        <TabsContent value="questions" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Label>Category:</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="glass w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass border-white/10">
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button onClick={() => setIsAddingQuestion(true)} className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </div>

          {/* Add Question Form */}
          {isAddingQuestion && (
            <QuestionForm
              question={newQuestion}
              setQuestion={setNewQuestion}
              onSave={handleAddQuestion}
              onCancel={resetNewQuestion}
              title="Add New Question"
            />
          )}

          {/* Edit Question Form */}
          {editingQuestion && (
            <QuestionForm
              question={editingQuestion}
              setQuestion={setEditingQuestion}
              onSave={handleUpdateQuestion}
              onCancel={() => setEditingQuestion(null)}
              title="Edit Question"
            />
          )}

          {/* Questions List */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Questions in {categories.find(c => c.id === selectedCategory)?.name}</span>
                <Badge variant="secondary" className="glass">
                  {questions.length} questions
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {questions.length > 0 ? (
                <div className="space-y-4">
                  {questions.map((question) => (
                    <div key={question.id} className="admin-card">
                      <div className="flex items-start justify-between p-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className={`glass ${
                              question.difficulty === 'easy' ? 'border-green-500 text-green-500' :
                              question.difficulty === 'medium' ? 'border-yellow-500 text-yellow-500' :
                              'border-red-500 text-red-500'
                            }`}>
                              {question.difficulty}
                            </Badge>
                            <Badge variant="outline" className="glass border-primary text-primary">
                              {question.type.replace('_', ' ')}
                            </Badge>
                            <Badge variant="secondary" className="glass">
                              {question.points} pts
                            </Badge>
                            {question.timeLimit && (
                              <Badge variant="secondary" className="glass">
                                <Clock className="w-3 h-3 mr-1" />
                                {question.timeLimit}s
                              </Badge>
                            )}
                          </div>
                          
                          <h3 className="font-medium">{question.question}</h3>
                          
                          {question.type === 'mcq' && question.options && (
                            <div className="text-sm text-muted-foreground">
                              Options: {question.options.join(', ')}
                            </div>
                          )}
                          
                          <div className="text-sm">
                            <span className="text-muted-foreground">Correct Answer: </span>
                            <span className="font-medium text-green-500">{question.correctAnswer}</span>
                          </div>
                          
                          {question.explanation && (
                            <div className="text-sm text-muted-foreground">
                              <FileText className="w-4 h-4 inline mr-1" />
                              {question.explanation}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingQuestion(question)}
                            className="glass-button"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="glass-button text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No questions yet</h3>
                  <p className="text-muted-foreground">Add your first question to get started!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Performance */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories.map(category => {
                    const categoryQuizzes = quizHistory.filter(q => q.categoryId === category.id);
                    const avgScore = categoryQuizzes.length > 0 
                      ? Math.round(categoryQuizzes.reduce((sum, q) => sum + q.score, 0) / categoryQuizzes.length)
                      : 0;
                    
                    return (
                      <div key={category.id} className="flex items-center justify-between p-3 glass rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center text-sm`}>
                            {category.icon}
                          </div>
                          <div>
                            <h4 className="font-medium">{category.name}</h4>
                            <p className="text-sm text-muted-foreground">{categoryQuizzes.length} attempts</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{avgScore}</div>
                          <div className="text-xs text-muted-foreground">Avg Score</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Recent Quiz Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {quizHistory.slice(-10).reverse().map((quiz) => (
                    <div key={quiz.id} className="flex items-center justify-between p-3 glass rounded-lg">
                      <div>
                        <h4 className="font-medium">{quiz.categoryName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(quiz.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{quiz.score} pts</div>
                        <div className="text-xs text-muted-foreground">
                          {quiz.correctAnswers}/{quiz.totalQuestions}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* User Management */}
        <TabsContent value="users" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>User Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">User Management</h3>
                <p className="text-muted-foreground">
                  Advanced user management features would be implemented here in a full application.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;