import React from "react";
import Dictation from "./components/Dictation";

export default function EssrDictation({
    onCompleted = (evaluationList) => console.log(evaluationList),
    isEntryTestOrExam = false,
    retryEnabled = true,
    questionNumber = "Phrase 1",
    questionHtml = "<p>Please type the dictated text.<p><em>This is a tip!<em>",
    inputPlaceholder = "Write here",
    buttonText = "Verify",
    tryAgainText = "Try Again",
    audio = "example",
    audioTranscription = "Lorem ipsum dolor sit amet",
    feedback = "You made @total mistake(s).",
    feedbackList = "<p>Erreur possible et correction :</p><ul><li>Lorem ipsum dolor sit amet.</li><li>Lorem ipsum dolor sit amet consectetur adipisicing elit.</li></ul>",
}) {
    
    return (
        <div className="EssrDictation">
            <Dictation
                onCompleted={onCompleted}
                isEntryTestOrExam={isEntryTestOrExam}
                retryEnabled={retryEnabled}
                questionNumber={questionNumber}
                questionHtml={questionHtml}
                inputPlaceholder={inputPlaceholder}
                buttonText={buttonText}
                tryAgainText={tryAgainText}
                audio={audio}
                audioTranscription={audioTranscription}
                feedback={feedback}
                feedbackList={feedbackList}
            />
        </div>
    );
}