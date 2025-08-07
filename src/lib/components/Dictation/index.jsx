import { useState } from 'react';
import EvaluationBullet from '../EvaluationBullet';
import FeedbackSection from '../FeedbackSection';
import './styles.scss'
import ProgressBar from '../ProgressBar';
import AudioPlayer from "../AudioPlayer";
import useEvaluation from "../../hooks/useEvaluation";

export default function Dictation({
  onCompleted,
  isEntryTestOrExam,
  retryEnabled,
  questionNumber,
  questionHtml,
  inputPlaceholder,
  buttonText,
  tryAgainText,
  audio,
  audioTranscription,
  feedback,
  feedbackList,
}) {

  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [shouldResetPlayback, setShouldResetPlayback] = useState(false)
  const { progress, countExpectedWord, evaluationList, evaluate, reset } = useEvaluation(audioTranscription);
  
  const hasAnswered = evaluationList.length > 0;
  const isEmpty = answer.length == 0;

  async function handleSubmit(e) {
    e.preventDefault();
  
    if (hasAnswered) {
      setAnswer("");
      reset();
      setShouldResetPlayback(true)
    } else {
      setIsLoading(true);
      const payload = evaluate(answer);
      await onCompleted(payload);
      setIsLoading(false);
    }
  }

  function handleOnChange(e){
    setAnswer(e.target.value);
  }

  return (
    <main>
      <h2>{questionNumber}</h2>
      <section className='sentence-description'>
        <div dangerouslySetInnerHTML={{__html: questionHtml}}></div>
      </section>

      <AudioPlayer src={audio} shouldResetPlayback={shouldResetPlayback}  onResetHandled={() => setShouldResetPlayback(false)}/>

      <form onSubmit={handleSubmit}>
        <div className='sound-section'>
          <div className='input-wrapper'>
            <input autoFocus disabled={hasAnswered} onChange={handleOnChange} placeholder={inputPlaceholder} value={answer} type="text" name="" id="" />
            {hasAnswered && (
              <section className={`${(isEntryTestOrExam) ? "hide" : "evaluation-wrapper"}`}>
                {evaluationList.map( (evaluation, index) => {
                  return (
                    <EvaluationBullet key={`${index}-${evaluation.expectedWord}`} {...evaluation} isEntryTestOrExam={isEntryTestOrExam} />
                  )
                })}
              </section>
            )
            }
          </div>
        </div>
        {
          hasAnswered
          ? (<button disabled={isEmpty || isLoading} className={`${retryEnabled ? "retry-btn" : "retry-btn hide"}`} type="submit">
              {isLoading ? 
              (
                  <span className="dots">
                      <span className="dot"></span>
                      <span className="dot"></span>
                      <span className="dot"></span>
                  </span>
              ) : tryAgainText
              }</button>
            )
          : (
            <button disabled={isEmpty || isLoading} type="submit">
              {isLoading ? 
                (
                  <span className="dots">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </span>
                ) : buttonText
              }
            </button>
          )
        }
      </form>
      {
        hasAnswered
        && (
          <div className={`${isEntryTestOrExam ? "hide" : ""}`}>
            <ProgressBar progress={progress} maxEvaluation={countExpectedWord}/>
            <FeedbackSection feedback={feedback} evaluationList={evaluationList} feedbackList={feedbackList} />
          </div>
        )
      }
  </main>
  )
}