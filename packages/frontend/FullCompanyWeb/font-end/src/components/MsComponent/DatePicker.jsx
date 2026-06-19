// import MiniMonth from "components/MSCalendar/MiniMonth";
import './BasicControlStyle.scss'
import {Input} from './index.js';

export default function DatePicker() {
    return (
        <div className="ms-date-picker">
            <Input />
            <span class="material-symbols-outlined">calendar_month</span>
            {/* <MiniMonth /> */}
        </div>
    );
}

