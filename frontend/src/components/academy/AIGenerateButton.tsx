import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import axios from 'axios';

interface AIGenerateButtonProps {
  type: 'content' | 'quiz' | 'simulation' | 'exam' | 'assignment' | 'module' | 'course';
  context: {
    courseTitle: string;
    moduleTitle?: string;
    lessonTitle?: string;
    existingContent?: string;
    duration?: number;
  };
  onGenerated: (data: any) => void;
  variant?: 'primary' | 'secondary' | 'inline';
  size?: 'sm' | 'md' | 'lg';
}

export const AIGenerateButton: React.FC<AIGenerateButtonProps> = ({
  type,
  context,
  onGenerated,
  variant = 'primary',
  size = 'md'
}) => {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getButtonText = () => {
    if (generating) return 'Genereren...';
    
    switch (type) {
      case 'content':
        return '🤖 Genereer Inhoud';
      case 'quiz':
        return '🤖 Genereer Quiz';
      case 'simulation':
        return '🤖 Genereer Simulatie';
      case 'exam':
        return '🤖 Genereer Examen';
      case 'assignment':
        return '🤖 Genereer Opdracht';
      case 'module':
        return '🤖 Genereer Module';
      case 'course':
        return '🤖 Genereer Training';
      default:
        return '🤖 Genereer met AI';
    }
  };

  const getEndpoint = () => {
  switch (type) {
    case 'content':
      return '/api/v1/academy/ai/generate-content/';
    case 'quiz':
      return '/api/v1/academy/ai/generate-quiz/';
    case 'simulation':
      return '/api/v1/academy/ai/generate-simulation/';
    case 'exam':
      return '/api/v1/academy/ai/generate-exam/';
    case 'assignment':
      return '/api/v1/academy/ai/generate-assignment/';
    default:
      return '/api/v1/academy/ai/generate-content/';
  }
};

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      
      const response = await axios.post(
        getEndpoint(),
        {
          context: {
            ...context,
            lessonType: type === 'quiz' ? 'quiz' : type === 'simulation' ? 'simulation' : 'video',
            duration: context.duration || 15
          },
          num_questions: type === 'quiz' ? 5 : type === 'exam' ? 20 : undefined
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      onGenerated(response.data);
    } catch (err) {
      console.error('AI generation failed:', err);
      setError(err.response?.data?.detail || 'Generatie mislukt. Probeer opnieuw.');
    } finally {
      setGenerating(false);
    }
  };

  // Style variants
  const getButtonStyles = () => {
    const baseStyles = 'flex items-center gap-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
    
    const sizeStyles = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-2.5 text-base'
    };

    const variantStyles = {
      primary: 'bg-purple-600 hover:bg-purple-700 text-white font-medium',
      secondary: 'bg-white hover:bg-purple-50 border border-purple-200 text-purple-700 font-medium',
      inline: 'bg-purple-100 hover:bg-purple-200 text-purple-700'
    };

    return `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]}`;
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleGenerate}
        disabled={generating}
        className={getButtonStyles()}
      >
        {generating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
        <span>{getButtonText()}</span>
      </button>

      {error && (
        <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
          {error}
        </div>
      )}
    </div>
  );
};
