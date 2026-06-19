import React,{useState} from "react";
import "./DropdownMenu.css";

function DropdownMenu({title,items,onClick }) {
 
    return (
        <div className="dropdown-menu-container">
            <input type="checkbox" id="dropdown-menu-button" class="dropdown-menu-button" />
            <label htmlFor="dropdown-menu-button" className="dropdown-menu-title-label">
                {title}
                <span class="material-symbols-outlined mx-1 more-arrow">navigate_next</span>
            </label>

            <ul className="dropdown-menu-items-container">
                {items.map((x, index) => {
                    return (
                        <li
                            key={index}
                            className="flex flex-row  items-center dropdown-menu-item"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log(index);
                                onClick(index);
                            }}
                        >
                            {title === items[index] ? (
                                <span class=" material-symbols-outlined mx-1">done</span>
                            ) : (
                                <span className="min-w-[1.5rem] max-w-[1.5rem] mx-1"></span>
                            )}
                            <span> {x}</span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export { DropdownMenu};
