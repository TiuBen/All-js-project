import React, { useState } from "react";
import useSWR from "swr";
import SideNav from "./SideNav";
import { useLocalStorageState } from "ahooks";
import { Pagination } from "components";
import SingleSelectionQuestion from "./QTypes/SingleSelectionQuestion";
import InitialPage from "./InitialPage";
const REACT_APP_SERVER_URL = process.env.REACT_APP_SERVER_URL;

const server = REACT_APP_SERVER_URL;

const fetcher = async (...args) => {
    const res = await fetch(...args);
    if (!res.ok) {
        const error = new Error("An error occurred while fetching the data.");
        throw error;
    }
    return res.json();
};
function MainPageLayout() {
    const [section, setSection] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    // const [_ss, setSection] = useLocalStorageState("章节", { defaultValue: null, listenStorageChange: true });

    const { data, error, isLoading } = useSWR(
        `${server}/atcLicense/license/exam?section=${section}&pageIndex=${currentPage - 1}&count=${pageSize}`,
        fetcher,
        {
            revalidateIfStale: false,
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
        }
    );

    let ele;
    if (error || section === null) {
        ele = <div className="flex-1 flex  self-center my-auto text-8xl "> 先选择一个章节</div>;
    }
    if (isLoading) {
        ele = <div> loading</div>;
    }
    if (data) {
        ele = (
            <div className="flex-1 flex flex-col gap-4 ">
                {data.rows.map((x, i) => {
                    return <SingleSelectionQuestion {...x} key={i} section={section} />;
                })}
            </div>
        );
    }

    return (
        <>
            <InitialPage />
            <header className="sticky top-0 z-50 w-full border-border/40 bg-blue-600">
                <div className="ml-12 flex h-14  items-center  ">
                    <h1 className=" text-white font-black">管制员执照题库</h1>
                </div>
            </header>
            <main className="grid md:grid-cols-[200px,auto] gap-2 h-[calc(100vh-3.5rem)] ">
                <aside className="top-14 z-30 overflow-y-auto ">
                    <SideNav setSection={setSection} />
                </aside>
                <div aria-roledescription="main content" className="w-[80%] mx-auto px-8 relative flex-1  place-self-stretch overflow-y-auto">
                    {error ? (
                        ele
                    ) : (
                        <div className="flex flex-col gap-4 ">
                            {ele}
                            <div className="sticky bottom-0 bg-white z-50 self-center p-4 w-auto">
                                <Pagination
                                    totalCount={data?.count}
                                    pageSize={pageSize}
                                    currentPage={currentPage}
                                    onPageChange={setCurrentPage}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <footer></footer>
        </>
    );
}

export default MainPageLayout;
