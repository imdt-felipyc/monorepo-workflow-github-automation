import React from "react";
import './index.scss'

export default function FeedbackSection({ feedback, evaluationList, feedbackList  }) {
    const errorCount = evaluationList.filter(item => !item.correct).length;

    const feedbackFormatted = feedback.replace("@total", errorCount)
  
    return (
      <section className="feedback-section">
        <p>{feedbackFormatted}</p>
        <div dangerouslySetInnerHTML={{__html: feedbackList}}></div>
      </section>
    );
}