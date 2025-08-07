import React from "react";
import { useEffect, useState } from 'react';
import './styles.scss';
import { FaStar } from 'react-icons/fa';

export default function ProgressBar({ progress = 0, maxEvaluation = 1 }) {
  const [internalProgress, setInternalProgress] = useState(0);

  const percentage = (progress/maxEvaluation) * 100;

  useEffect(() => {
    const timeout = setTimeout(() => {
      setInternalProgress(percentage);
    }, 50);

    return () => clearTimeout(timeout);
  }, [percentage]);

  return (
    <>
        <p>Score: {progress} of {maxEvaluation}.</p>
        <div className='progress-container'>
            <div className="progress-bar">
                <div
                    className="progress-fill"
                    style={{
                    width: `${internalProgress}%`,
                    backgroundColor:
                    percentage === 100 ? '#4caf50' : percentage > 0 ? '#ff9800' : '#ddd'
                    }}
                ></div>
            </div>
            <div className={`icon ${percentage === 100 ? 'active' : ''}`}>
                <FaStar />
            </div>
            <div className='score'>
                {progress}/{maxEvaluation}
            </div>
        </div>
    </>
  );
}