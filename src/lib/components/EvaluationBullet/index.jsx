import React from "react";
import './index.scss'
import { FaCheck } from "react-icons/fa";
import { GrFormClose } from "react-icons/gr";
import { IoCloseSharp } from "react-icons/io5";

export default function EvaluationBullet({userWord, expectedWord, correct, isEntryTest, isExam}){
    return (
        ( (isEntryTest || isExam)
            ?
                <div className="evaluation-bullet">
                    <div className="bullet">
                        {userWord} {expectedWord}
                    </div>
                </div>
            :
                <div className={`evaluation-bullet ${correct ? "hit" : "miss"}`}>
                    {
                        correct ? 
                        <div className="bullet">
                            {userWord}
                            <FaCheck />
                        </div> 
                        :   
                        <div className="bullet">
                            <span>
                                <s>{userWord}</s> {expectedWord}
                            </span>
                            <IoCloseSharp />
                            <span className="minus-point">-1</span>
                        </div>
                    }
                </div>
        )
    );
}