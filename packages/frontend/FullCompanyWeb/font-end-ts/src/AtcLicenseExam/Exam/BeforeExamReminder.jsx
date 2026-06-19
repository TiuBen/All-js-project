import React from "react";

function BeforeExamReminder() {
    return (
        <div>
            <h1>考试须知</h1>

            <label htmlFor="">
                我已阅读考试须知，并同意遵守考试规则。
                <input type="checkbox" />
            </label>
            <button>进入考试</button>
        </div>
    );
}

export default BeforeExamReminder;
