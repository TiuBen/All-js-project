import {useState} from 'react'
import "./layouts.scss";

function CardListSwitchContainer({ children }) {
    const [rowOrCol, setRowOrCol] = useState({ flexDirection: "row" })

    return (
        <div className="card-list-switch-container">
            <div className="controllers-container" >
                <label>
                    搜索
                    <input type="text"></input>
                </label>
                <span className="space"></span>
                <button
                    className="card-button"
                    onClick={(e) => {
                        setRowOrCol({ flexDirection: "row" });
                    }}
                >
                    <i className="material-icons">dashboard</i>
                </button>
                <button
                    className="list-button"
                    onClick={(e) => {
                        setRowOrCol({ flexDirection: "column" });
                    }}
                >
                    <span class="material-icons-outlined">format_list_bulleted</span>
                </button>
            </div>
            <div className="content-container test-border" style={rowOrCol}>{children}</div>
        </div>
    );
}
export  {CardListSwitchContainer};
