import { Question } from '../types';

interface GameQuestionProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
}

export const GameQuestion = ({ question, questionNumber, totalQuestions }: GameQuestionProps) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg mb-6">
      <div className="text-center mb-4">
        <span className="inline-block px-4 py-2 bg-sunny-yellow text-white rounded-full text-lg font-bold">
          {questionNumber} / {totalQuestions}
        </span>
      </div>
      
      <div className="text-center">
        <p className="text-3xl font-bold text-gray-800 leading-relaxed">
          {question.question}
        </p>
      </div>
    </div>
  );
};
