import axios from "axios";
import React, { useState, useMemo, useRef, useCallback, forwardRef, useEffect } from "react";
import { _useFetchPostFormData } from "../../utils/fetchHelper";


export default function ToDoComponent() {
    const [title, setTitle] = useState("添加个标题吧");
    const [content, setContent] = useState("添加点内容");
    const [tags, setTags] = useState([]);
    const [tagInputValue, setTagInputValue] = useState("");

    const deleteTag = (e, index) => {
        // console.log("要删除这个tag了");
        // console.log(index);
        var _temp = [...tags];
        _temp.splice(index, 1);
        setTags([..._temp]);
    };

    const ref = useRef("form");

    const onSubmit = (e) => {
        e.preventDefault();

        fetch("http://127.0.0.1:3100/todo", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ title: title, content: content, tags: tags.toString() }),
        })
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                console.log(data);
            });

        e.preventDefault();
        e.stopPropagation();
    };

    return (
        <div>
            <div class="container">
                <form style={{ display: "flex", flexDirection: "column" }} ref={ref} onSubmit={onSubmit}>
                    <label>
                        标题
                        <input
                            type="text"
                            name="title"
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                            }}
                        />
                    </label>
                    <label>
                        内容
                        <textarea
                            name="content"
                            value={content}
                            onChange={(e) => {
                                setContent(e.target.value);
                            }}
                        ></textarea>
                    </label>
                    <div>
                        <label>标签</label>
                        <ul>
                            {tags.map((t, index) => {
                                return (
                                    <li>
                                        <span>{t}</span>
                                        <button
                                            onClick={(e) => {
                                                deleteTag(e, index);
                                            }}
                                        >
                                            delete
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                        <input
                            autoFocus={true}
                            value={tagInputValue}
                            onChange={(e) => {
                                setTagInputValue(e.target.value);
                            }}
                            onKeyDown={(e) => {
                                if (e.key == "Enter") {
                                    e.preventDefault();
                                    tags.push(e.target.value);
                                    var _temp = [...tags];
                                    setTags([...tags]);
                                    setTagInputValue("");
                                }
                            }}
                        />
                    </div>
                    <button type="submit">确认</button>
                </form>
            </div>
        </div>
    );
}
