import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuiz, Question } from '@/contexts/QuizContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Trophy, 
  ArrowRight, 
  ArrowLeft,
  Home,
  RotateCcw
} from 'lucide-react';

const QuizPage: React.FC = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { categories, currentSession, startQuiz, submitAnswer, nextQuestion, finishQuiz } = useQuiz();
  
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isAnswered, setIsAnswered] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  // Start quiz when component mounts
  useEffect(() => {
    if (user && categoryId && !currentSession) {
      startQuiz(categoryId, user.id);
    }
  }, [user, categoryId, currentSession, startQuiz]);

  // Timer logic
  useEffect(() => {
    if (currentSession && !currentSession.completed) {
      const currentQuestion = currentSession.questions[currentSession.currentQuestionIndex];
      if (currentQuestion?.timeLimit && !isAnswered) {
        setTimeLeft(currentQuestion.timeLimit);
        
        const timer = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              handleTimeUp();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer);
      }
    }
  }, [currentSession?.currentQuestionIndex, isAnswered]);

  const handleTimeUp = () => {
    if (!isAnswered) {
      handleSubmitAnswer();
    }
  };

  const handleSubmitAnswer = () => {
    if (!currentSession) return;
    
    const currentQuestion = currentSession.questions[currentSession.currentQuestionIndex];
    submitAnswer(currentQuestion.id, selectedAnswer);
    setIsAnswered(true);
    setShowExplanation(true);
    
    // Show feedback
    const isCorrect = selectedAnswer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim();
    if (isCorrect) {
      toast.success(`Correct! +${currentQuestion.points} points`);
    } else {
      toast.error('Incorrect answer');
    }
  };

  const handleNextQuestion = () => {
    if (!currentSession) return;
    
    if (currentSession.currentQuestionIndex < currentSession.questions.length - 1) {
      nextQuestion();
      setSelectedAnswer('');
      setShowExplanation(false);
      setIsAnswered(false);
    } else {
      finishQuiz();
    }
  };

  const handleRestartQuiz = () => {
    if (user && categoryId) {
      startQuiz(categoryId, user.id);
      setSelectedAnswer('');
      setShowExplanation(false);
      setIsAnswered(false);
    }
  };

  if (!user) {
    return null;
  }

  if (!currentSession) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="glass-card max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading quiz...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentSession.completed) {
    const category = categories.find(c => c.id === currentSession.categoryId);
    const correctAnswers = currentSession.questions.reduce((count, question) => {
      const userAnswer = currentSession.answers[question.id];
      return userAnswer && userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim() 
        ? count + 1 
        : count;
    }, 0);
    
    const percentage = Math.round((correctAnswers / currentSession.questions.length) * 100);

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="glass-card text-center">
          <CardHeader>
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Quiz Completed!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="glass p-4 rounded-lg">
                <div className="text-2xl font-bold text-primary">{currentSession.score}</div>
                <div className="text-sm text-muted-foreground">Total Score</div>
              </div>
              <div className="glass p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-500">{correctAnswers}/{currentSession.questions.length}</div>
                <div className="text-sm text-muted-foreground">Correct Answers</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Accuracy</span>
                <span>{percentage}%</span>
              </div>
              <Progress value={percentage} className="progress-glow" />
            </div>

            <div className="text-lg">
              <span className="text-muted-foreground">Category: </span>
              <span className="font-semibold">{category?.name}</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={handleRestartQuiz} className="btn-primary">
                <RotateCcw className="mr-2 h-4 w-4" />
                Retake Quiz
              </Button>
              <Button variant="outline" onClick={() => navigate('/')} className="glass-button">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
              <Button variant="outline" onClick={() => navigate('/leaderboard')} className="glass-button">
                <Trophy className="mr-2 h-4 w-4" />
                Leaderboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = currentSession.questions[currentSession.currentQuestionIndex];
  const progress = ((currentSession.currentQuestionIndex + 1) / currentSession.questions.length) * 100;
  const isCorrect = selectedAnswer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim();

  const renderQuestionInput = (question: Question) => {
    switch (question.type) {
      case 'mcq':
        return (
          <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer} disabled={isAnswered}>
            <div className="space-y-3">
              {question.options?.map((option, index) => (
                <div key={index} className={`answer-option ${
                  isAnswered 
                    ? option === question.correctAnswer 
                      ? 'correct' 
                      : selectedAnswer === option 
                        ? 'incorrect' 
                        : ''
                    : selectedAnswer === option 
                      ? 'selected' 
                      : ''
                }`}>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                    {isAnswered && option === question.correctAnswer && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {isAnswered && selectedAnswer === option && option !== question.correctAnswer && (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </RadioGroup>
        );

      case 'true_false':
        return (
          <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer} disabled={isAnswered}>
            <div className="space-y-3">
              {['true', 'false'].map((option) => (
                <div key={option} className={`answer-option ${
                  isAnswered 
                    ? option === question.correctAnswer.toLowerCase() 
                      ? 'correct' 
                      : selectedAnswer === option 
                        ? 'incorrect' 
                        : ''
                    : selectedAnswer === option 
                      ? 'selected' 
                      : ''
                }`}>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value={option} id={option} />
                    <Label htmlFor={option} className="flex-1 cursor-pointer capitalize">
                      {option}
                    </Label>
                    {isAnswered && option === question.correctAnswer.toLowerCase() && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {isAnswered && selectedAnswer === option && option !== question.correctAnswer.toLowerCase() && (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </RadioGroup>
        );

      case 'short_answer':
        return (
          <div className="space-y-3">
            <Textarea
              value={selectedAnswer}
              onChange={(e) => setSelectedAnswer(e.target.value)}
              placeholder="Type your answer here..."
              disabled={isAnswered}
              className="glass min-h-[100px]"
            />
            {isAnswered && (
              <div className={`p-3 rounded-lg glass ${isCorrect ? 'border-green-500' : 'border-red-500'}`}>
                <div className="flex items-center space-x-2 mb-2">
                  {isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className="font-medium">
                    {isCorrect ? 'Correct!' : 'Incorrect'}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Correct answer: {question.correctAnswer}
                </div>
              </div>
            )}
          </div>
        );

      case 'fill_blank':
        return (
          <div className="space-y-3">
            <Input
              value={selectedAnswer}
              onChange={(e) => setSelectedAnswer(e.target.value)}
              placeholder="Fill in the blank..."
              disabled={isAnswered}
              className="glass"
            />
            {isAnswered && (
              <div className={`p-3 rounded-lg glass ${isCorrect ? 'border-green-500' : 'border-red-500'}`}>
                <div className="flex items-center space-x-2 mb-2">
                  {isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className="font-medium">
                    {isCorrect ? 'Correct!' : 'Incorrect'}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Correct answer: {question.correctAnswer}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="glass">
                Question {currentSession.currentQuestionIndex + 1} of {currentSession.questions.length}
              </Badge>
              <Badge variant="outline" className={`glass ${
                currentQuestion.difficulty === 'easy' ? 'border-green-500 text-green-500' :
                currentQuestion.difficulty === 'medium' ? 'border-yellow-500 text-yellow-500' :
                'border-red-500 text-red-500'
              }`}>
                {currentQuestion.difficulty}
              </Badge>
              <Badge variant="outline" className="glass border-primary text-primary">
                {currentQuestion.points} pts
              </Badge>
            </div>
            
            {currentQuestion.timeLimit && !isAnswered && (
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span className={`font-mono ${timeLeft <= 10 ? 'text-red-500' : ''}`}>
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="progress-glow" />
          </div>
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card className="question-card">
        <CardHeader>
          <CardTitle className="text-xl leading-relaxed">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderQuestionInput(currentQuestion)}
          
          {/* Explanation */}
          {showExplanation && currentQuestion.explanation && (
            <div className="glass p-4 rounded-lg border-l-4 border-primary">
              <h4 className="font-semibold mb-2">Explanation:</h4>
              <p className="text-muted-foreground">{currentQuestion.explanation}</p>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="glass-button"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Exit Quiz
            </Button>
            
            <div className="space-x-2">
              {!isAnswered ? (
                <Button 
                  onClick={handleSubmitAnswer}
                  disabled={!selectedAnswer.trim()}
                  className="btn-primary"
                >
                  Submit Answer
                </Button>
              ) : (
                <Button 
                  onClick={handleNextQuestion}
                  className="btn-primary"
                >
                  {currentSession.currentQuestionIndex < currentSession.questions.length - 1 ? (
                    <>
                      Next Question
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Finish Quiz
                      <Trophy className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score Display */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="font-medium">Current Score:</span>
            </div>
            <span className="text-xl font-bold text-primary">{currentSession.score}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizPage;