import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Question {
  id: string;
  type: 'mcq' | 'short_answer' | 'true_false' | 'fill_blank';
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  points: number;
  timeLimit?: number;
}

export interface QuizSession {
  id: string;
  userId: string;
  categoryId: string;
  questions: Question[];
  currentQuestionIndex: number;
  answers: { [questionId: string]: string };
  score: number;
  startTime: string;
  endTime?: string;
  completed: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  questionCount: number;
  color: string;
}

export interface QuizHistory {
  id: string;
  userId: string;
  categoryId: string;
  categoryName: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  completedAt: string;
  timeSpent: number;
}

interface QuizContextType {
  categories: Category[];
  currentSession: QuizSession | null;
  quizHistory: QuizHistory[];
  startQuiz: (categoryId: string, userId: string) => void;
  submitAnswer: (questionId: string, answer: string) => void;
  nextQuestion: () => void;
  finishQuiz: () => void;
  getQuestionsByCategory: (categoryId: string) => Question[];
  addQuestion: (question: Omit<Question, 'id'>) => void;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  deleteQuestion: (id: string) => void;
  getUserStats: (userId: string) => {
    totalQuizzes: number;
    totalScore: number;
    averageScore: number;
    bestCategory: string;
  };
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};

// Mock data
const mockCategories: Category[] = [
  {
    id: 'general',
    name: 'General Knowledge',
    description: 'Test your general knowledge across various topics',
    icon: '🧠',
    questionCount: 15,
    color: 'from-blue-500 to-purple-600'
  },
  {
    id: 'science',
    name: 'Science',
    description: 'Physics, Chemistry, Biology and more',
    icon: '🔬',
    questionCount: 12,
    color: 'from-green-500 to-teal-600'
  },
  {
    id: 'history',
    name: 'History',
    description: 'World history and historical events',
    icon: '📚',
    questionCount: 10,
    color: 'from-orange-500 to-red-600'
  },
  {
    id: 'technology',
    name: 'Technology',
    description: 'Programming, AI, and modern technology',
    icon: '💻',
    questionCount: 8,
    color: 'from-purple-500 to-pink-600'
  },
  {
    id: 'sports',
    name: 'Sports',
    description: 'Sports trivia and athletic knowledge',
    icon: '⚽',
    questionCount: 6,
    color: 'from-yellow-500 to-orange-600'
  }
];

const mockQuestions: Question[] = [
  // General Knowledge
  {
    id: 'q1',
    type: 'mcq',
    category: 'general',
    difficulty: 'easy',
    question: 'What is the capital of France?',
    options: ['London', 'Berlin', 'Paris', 'Madrid'],
    correctAnswer: 'Paris',
    explanation: 'Paris has been the capital of France since the 12th century.',
    points: 10,
    timeLimit: 30
  },
  {
    id: 'q2',
    type: 'true_false',
    category: 'general',
    difficulty: 'easy',
    question: 'The Great Wall of China is visible from space.',
    correctAnswer: 'false',
    explanation: 'This is a common myth. The Great Wall is not visible from space with the naked eye.',
    points: 10,
    timeLimit: 20
  },
  {
    id: 'q3',
    type: 'short_answer',
    category: 'general',
    difficulty: 'medium',
    question: 'What is the largest ocean on Earth?',
    correctAnswer: 'Pacific Ocean',
    explanation: 'The Pacific Ocean covers about 46% of the water surface and about 32% of the total surface area of Earth.',
    points: 15,
    timeLimit: 45
  },
  
  // Science
  {
    id: 'q4',
    type: 'mcq',
    category: 'science',
    difficulty: 'medium',
    question: 'What is the chemical symbol for gold?',
    options: ['Go', 'Gd', 'Au', 'Ag'],
    correctAnswer: 'Au',
    explanation: 'Au comes from the Latin word "aurum" meaning gold.',
    points: 15,
    timeLimit: 30
  },
  {
    id: 'q5',
    type: 'fill_blank',
    category: 'science',
    difficulty: 'hard',
    question: 'The speed of light in vacuum is approximately _____ meters per second.',
    correctAnswer: '299792458',
    explanation: 'The speed of light in vacuum is exactly 299,792,458 meters per second.',
    points: 20,
    timeLimit: 60
  },
  
  // History
  {
    id: 'q6',
    type: 'mcq',
    category: 'history',
    difficulty: 'medium',
    question: 'In which year did World War II end?',
    options: ['1944', '1945', '1946', '1947'],
    correctAnswer: '1945',
    explanation: 'World War II ended in 1945 with the surrender of Japan in September.',
    points: 15,
    timeLimit: 30
  },
  
  // Technology
  {
    id: 'q7',
    type: 'mcq',
    category: 'technology',
    difficulty: 'easy',
    question: 'What does "HTML" stand for?',
    options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlink and Text Markup Language'],
    correctAnswer: 'Hyper Text Markup Language',
    explanation: 'HTML stands for Hyper Text Markup Language, the standard markup language for web pages.',
    points: 10,
    timeLimit: 30
  },
  
  // Sports
  {
    id: 'q8',
    type: 'true_false',
    category: 'sports',
    difficulty: 'easy',
    question: 'A basketball team consists of 5 players on the court at one time.',
    correctAnswer: 'true',
    explanation: 'Yes, each basketball team has 5 players on the court during play.',
    points: 10,
    timeLimit: 20
  }
];

export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories] = useState<Category[]>(mockCategories);
  const [questions, setQuestions] = useState<Question[]>(mockQuestions);
  const [currentSession, setCurrentSession] = useState<QuizSession | null>(null);
  const [quizHistory, setQuizHistory] = useState<QuizHistory[]>([]);

  useEffect(() => {
    // Load quiz history from localStorage
    const storedHistory = localStorage.getItem('quiz_history');
    if (storedHistory) {
      setQuizHistory(JSON.parse(storedHistory));
    }

    // Load questions from localStorage
    const storedQuestions = localStorage.getItem('quiz_questions');
    if (storedQuestions) {
      setQuestions(JSON.parse(storedQuestions));
    }
  }, []);

  const startQuiz = (categoryId: string, userId: string) => {
    const categoryQuestions = questions.filter(q => q.category === categoryId);
    const shuffledQuestions = [...categoryQuestions].sort(() => Math.random() - 0.5);
    
    const session: QuizSession = {
      id: `session-${Date.now()}`,
      userId,
      categoryId,
      questions: shuffledQuestions,
      currentQuestionIndex: 0,
      answers: {},
      score: 0,
      startTime: new Date().toISOString(),
      completed: false
    };
    
    setCurrentSession(session);
  };

  const submitAnswer = (questionId: string, answer: string) => {
    if (!currentSession) return;
    
    setCurrentSession(prev => ({
      ...prev!,
      answers: { ...prev!.answers, [questionId]: answer }
    }));
  };

  const nextQuestion = () => {
    if (!currentSession) return;
    
    const currentQuestion = currentSession.questions[currentSession.currentQuestionIndex];
    const userAnswer = currentSession.answers[currentQuestion.id];
    let newScore = currentSession.score;
    
    // Check if answer is correct
    if (userAnswer && userAnswer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim()) {
      newScore += currentQuestion.points;
    }
    
    setCurrentSession(prev => ({
      ...prev!,
      currentQuestionIndex: prev!.currentQuestionIndex + 1,
      score: newScore
    }));
  };

  const finishQuiz = () => {
    if (!currentSession) return;
    
    const endTime = new Date().toISOString();
    const startTime = new Date(currentSession.startTime);
    const timeSpent = Math.floor((new Date(endTime).getTime() - startTime.getTime()) / 1000);
    
    const correctAnswers = currentSession.questions.reduce((count, question) => {
      const userAnswer = currentSession.answers[question.id];
      return userAnswer && userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim() 
        ? count + 1 
        : count;
    }, 0);
    
    const category = categories.find(c => c.id === currentSession.categoryId);
    
    const historyEntry: QuizHistory = {
      id: `history-${Date.now()}`,
      userId: currentSession.userId,
      categoryId: currentSession.categoryId,
      categoryName: category?.name || 'Unknown',
      score: currentSession.score,
      totalQuestions: currentSession.questions.length,
      correctAnswers,
      completedAt: endTime,
      timeSpent
    };
    
    const updatedHistory = [...quizHistory, historyEntry];
    setQuizHistory(updatedHistory);
    localStorage.setItem('quiz_history', JSON.stringify(updatedHistory));
    
    setCurrentSession(prev => ({
      ...prev!,
      endTime,
      completed: true
    }));
  };

  const getQuestionsByCategory = (categoryId: string): Question[] => {
    return questions.filter(q => q.category === categoryId);
  };

  const addQuestion = (question: Omit<Question, 'id'>) => {
    const newQuestion: Question = {
      ...question,
      id: `q-${Date.now()}`
    };
    
    const updatedQuestions = [...questions, newQuestion];
    setQuestions(updatedQuestions);
    localStorage.setItem('quiz_questions', JSON.stringify(updatedQuestions));
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    const updatedQuestions = questions.map(q => 
      q.id === id ? { ...q, ...updates } : q
    );
    setQuestions(updatedQuestions);
    localStorage.setItem('quiz_questions', JSON.stringify(updatedQuestions));
  };

  const deleteQuestion = (id: string) => {
    const updatedQuestions = questions.filter(q => q.id !== id);
    setQuestions(updatedQuestions);
    localStorage.setItem('quiz_questions', JSON.stringify(updatedQuestions));
  };

  const getUserStats = (userId: string) => {
    const userHistory = quizHistory.filter(h => h.userId === userId);
    const totalQuizzes = userHistory.length;
    const totalScore = userHistory.reduce((sum, h) => sum + h.score, 0);
    const averageScore = totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0;
    
    // Find best category
    const categoryStats: { [key: string]: { score: number; count: number } } = {};
    userHistory.forEach(h => {
      if (!categoryStats[h.categoryId]) {
        categoryStats[h.categoryId] = { score: 0, count: 0 };
      }
      categoryStats[h.categoryId].score += h.score;
      categoryStats[h.categoryId].count += 1;
    });
    
    let bestCategory = 'None';
    let bestAverage = 0;
    Object.entries(categoryStats).forEach(([categoryId, stats]) => {
      const average = stats.score / stats.count;
      if (average > bestAverage) {
        bestAverage = average;
        const category = categories.find(c => c.id === categoryId);
        bestCategory = category?.name || categoryId;
      }
    });
    
    return {
      totalQuizzes,
      totalScore,
      averageScore,
      bestCategory
    };
  };

  return (
    <QuizContext.Provider value={{
      categories,
      currentSession,
      quizHistory,
      startQuiz,
      submitAnswer,
      nextQuestion,
      finishQuiz,
      getQuestionsByCategory,
      addQuestion,
      updateQuestion,
      deleteQuestion,
      getUserStats
    }}>
      {children}
    </QuizContext.Provider>
  );
};