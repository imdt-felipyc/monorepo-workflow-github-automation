import { useRef, useEffect, useState } from 'react';
import compareAnswers from "../utils/compareAnswers.js"
import countMainWords from '../utils/countWords.js';

export default function useEvaluation(expectedAnswer) {
  const [evaluationList, setEvaluation] = useState([]);
  const startTimeRef = useRef(performance.now());

  const countExpectedWord = countMainWords(expectedAnswer);

  const progress = Math.max(0, countExpectedWord - evaluationList.filter(item => item.correct === false).length
  );

  useEffect(() => {
    startTimeRef.current = performance.now();
  }, [expectedAnswer]);

  function evaluate(userAnswer) {
    const result = compareAnswers(userAnswer, expectedAnswer);
    setEvaluation(result);

    const response = result.map(r => r.userWord || '').join('[,]');
    const correctAnswer = `{case_matters=true}` + result.map(r => r.expectedWord || '').join('[,]');
    const correctCount = result.filter(r => r.correct).length;
    const duration = `PT${((performance.now() - startTimeRef.current) / 1000).toFixed(2)}S`;

    return {
      score: {
        min: 0,
        max: result.length,
        raw: correctCount,
        scaled: correctCount / result.length
      },
      completion: true,
      correct_answer: correctAnswer,
      duration,
      response
    };
  }

  function reset() {
    setEvaluation([]);
  }

  return { progress, countExpectedWord, evaluationList, evaluate, reset };
}
