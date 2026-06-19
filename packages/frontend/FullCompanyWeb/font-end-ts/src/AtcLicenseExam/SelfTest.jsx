import React, { useState } from "react";
import useSWR from "swr";
import SideNav from "./SideNav";
import { useLocalStorageState } from "ahooks";
import { Pagination } from "components";
import SingleSelectionQuestion from "./QTypes/SingleSelectionQuestion";
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
function SelfTest() {
    const [section, setSection] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    
    const { data, error, isLoading } = useSWR(
        `${server}/atcLicense/license/exam?selftest=true`,
        fetcher,
        {
            revalidateIfStale: false,
            revalidateOnFocus: true,
            revalidateOnReconnect: false,
        }
    );

    let ele = <div>failed to load</div>;
    if (error || section === null) {
        ele = <div>failed to load</div>;
    }
    if (isLoading) {
        ele = <div> loading</div>;
    }
    if (data) {
        ele = (
            <div className="flex-1 flex flex-col gap-4 ">
                {data.rows.map((x, i) => {
                    return <SingleSelectionQuestion {...x} key={i}  section={section} />;
                })}
            </div>
        );
    }

    return (
            <div>
                <header className="sticky top-0 z-50 w-full border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="container flex h-14 max-w-screen-2xl items-center bg-blue-600 ">
                        <h1 className=" text-white font-black">管制员执照题库</h1>
                    </div>
                </header>
                <main className="flex-1">
                    <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
                        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
                            <SideNav setSection={setSection} />
                        </aside>
                        <main className="relative py-6 lg:gap-10 lg:py-8 xl:grid xl:grid-cols-[1fr_300px] ">
                            <div className="flex flex-col  items-stretch ">
                                {ele}
                                {!error && (
                                    <div className="mx-auto py-2 shadow shadow-blue-400 rounded-t-lg  sticky flex justify-center w-full text-center bottom-0 bg-white z-50 ">
                                        <Pagination
                                            totalCount={data?.count}
                                            pageSize={pageSize}
                                            currentPage={currentPage}
                                            onPageChange={setCurrentPage}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* <div className="sticky top-16 -mt-10 h-[calc(100vh-3.5rem)] pt-4 flex flex-row gap-2 flex-wrap">
                                <div className="flex flex-row items-start content-start gap-2 flex-wrap">
                                    {Array(20)
                                        .fill(0)
                                        .map((x, i) => {
                                            return (
                                                <div key={i} className="flex-grow-0">
                                                    {i + 1}
                                                </div>
                                            );
                                        })}
                                </div>
                            </div> */}
                        </main>
                    </div>
                </main>
                <footer></footer>
            </div>
       
    );
}

export default SelfTest;
