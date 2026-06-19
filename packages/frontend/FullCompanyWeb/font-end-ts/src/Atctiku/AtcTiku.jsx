import { useState, useEffect, useRef, createRef } from "react";
import useSWR from "swr";
import { Pagination } from "../components/index";
import SideNav from "./SideNav";
import QElement from "./QElement";
import { useNavigate, useLocation, useParams, useSearchParams } from "react-router-dom";
import { useLocalStorage } from "../utils";
import SingleSelectionQuestion from "./QTypes/SingleSelectionQuestion";

const fetcher = (...args) => fetch(...args).then((res) => res.json());

function AtcTiku() {
    const [doingQ, setDoingQ] = useState(null);
    const [sub, setSub] = useLocalStorage("sub", null);
    const [onlyTheWrongs] = useLocalStorage("onlyTheWrongs");

    const [currentPage, setCurrentPage] = useState("currentPage", 1);
    const [pageSize, setPageSize] = useState(20);

    //! get 正在做的题目
    const {
        data = { count: "", rows: [] },
        error,
        isLoading,
    } = useSWR(`http://localhost:3103/tiku?section=${sub}&pageIndex=${currentPage - 1}&count=${pageSize}`, fetcher, {
        revalidateIfStale: false,
        revalidateOnFocus: true,
        revalidateOnReconnect: false,
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [sub]);

    let location = useLocation();
    let ddd = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    useEffect(() => {
        console.log(location);
        console.log(ddd);
        console.log(searchParams.get("section") + "  " + searchParams.get("qId"));
    }, [location, ddd, searchParams]);

    useEffect(() => {
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
            link = document.createElement("link");
            link.rel = "icon";
            document.getElementsByTagName("head")[0].appendChild(link);
        }
        link.href = "done_black_24dp.svg";
    }, [location]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            //! next last page
            if (sub) {
                switch (event.key) {
                    case "PageUp": // 上一页
                        console.log("PageUp");
                        setCurrentPage(Math.max(1, currentPage - 1));
                        break;
                    case "PageDown": // 下一页
                        console.log("PageDown");
                        setCurrentPage(Math.min(Math.floor(data.count / pageSize), currentPage + 1));
                        break;
                    default:
                        break;
                }
            }
            if (doingQ) {
                switch (event.key) {
                    case "ArrowLeft": // 上一页
                        console.log("LeftArrow");
                        console.log(doingQ);
                        console.log(data.rows);

                        const lastDoingQIndex = data.rows.findIndex((x) => x === doingQ);
                        if (lastDoingQIndex !== -1) {
                            setDoingQ(data.rows[Math.max(0, lastDoingQIndex - 1)]);
                        }

                        break;
                    case "ArrowRight": // 下一页
                        console.log("RightArrow");
                        const nextDoingQIndex = data.rows.findIndex((x) => x === doingQ);
                        if (nextDoingQIndex !== -1) {
                            setDoingQ(data.rows[Math.min(pageSize - 1, nextDoingQIndex + 1)]);
                        }

                        break;
                    default:
                        break;
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [currentPage, data, pageSize, doingQ]);

    // const navigate = useNavigate();

    // useEffect(() => {
    //     if (doingQ) {
    //         navigate("/tiku?section=" + sub + "&qId=" + doingQ.qId);
    //         const ele = document.getElementById(doingQ.qId);
    //         ele.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    //     }
    // }, [doingQ]);

    var ele;

    if (error) {
        ele = <div>failed to load</div>;
    }
    if (isLoading) {
        ele = <div>loading...</div>;
    }

    if (!sub) {
        ele = (
            <div className=" flex flex-col flex-1 items-center">
                <label className="font-bold  text-3xl ">请选择一个章节来练习吧</label>
            </div>
        );
    } else {
        ele = (
            <div className="flex-1 p-2 flex flex-col gap-2 ">
                <h2 className="flex flex-row gap-2 font-yahei font-semibold bg-green-300">
                    {sub || ""} 选择{(currentPage - 1) * pageSize + 1}:{currentPage * pageSize}/{data.count}题
                    <br />
                    正在做 {doingQ?.rawNum}
                </h2>
                <div className=" self-center">
                    <Pagination
                        totalCount={data.count}
                        pageSize={pageSize}
                        currentPage={currentPage}
                        onPageChange={(page) => {
                            setCurrentPage(page);
                        }}
                        pageSizeOption={[10, 15, 20, 25]}
                    />
                </div>
                <div className=" relative flex flex-col gap-2  overflow-y-auto ">
                    {data.rows.map((Q, index) => {
                        return (
                            <>
                                <SingleSelectionQuestion
                                    key={index}
                                    num={Q.num}
                                    qId={Q.qId}
                                    rawNum={Q.rawNum}
                                    txt={Q.txt}
                                    A={Q.A}
                                    B={Q.B}
                                    C={Q.C}
                                    D={Q.D}
                                    rightAns={Q.rightAns}
                                />
                                {/* <QElement key={index} contentQ={Q} doingQ={doingQ} onClick={setDoingQ} />; */}
                            </>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <>
            {/* <SingleSelectionQuestion
                num="1"
                qId="410000001"
                rawNum="第1题	试题编号：410000001\r"
                txt="In radiotelephony, the call sign for a controller of aerodrome control service is ______.\r"
                A="A. Tower\r"
                B="B. Ground\r"
                C="C, Approach\r"
                D="D. Control\r"
                rightAns="A"
            /> */}
            <div className="flex flex-row gap-2 min-h-0">
                <SideNav setSub={setSub} />

                {ele}
            </div>
        </>
    );
}

export default AtcTiku;
