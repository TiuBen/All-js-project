import React, { useState, useEffect } from "react";
import useSWRInfinite from "swr/infinite";
import { useInView } from "react-intersection-observer";
import { API_URL, FETCHER } from "../../../utils/const/Const";

function TimeLinePage() {
    const { ref, inView } = useInView({
        threshold: 0,
    });

    const { data, error, size, setSize, isValidating } = useSWRInfinite(
        (pageIndex, previousPageData) => {
            if (previousPageData && !previousPageData.hasMore) return null;
            return `${API_URL.duty}?page=${pageIndex + 1}&limit=10`;
        },
        FETCHER,
        {
            revalidateFirstPage: false,
        }
    );

    const items = data ? data.flatMap((page) => page.items) : [];
    const isLoadingInitial = !data && !error;
    const isLoadingMore = size > 0 && data && typeof data[size - 1] === "undefined" && isValidating;
    const hasMore = data && data[data.length - 1]?.hasMore;

    // 监听 inView 来加载下一页
    useEffect(() => {
        if (inView && hasMore && !isValidating) {
            setSize((prev) => prev + 1);
        }
    }, [inView, hasMore, isValidating, setSize]);

    if (isLoadingInitial) return <div>加载中...</div>;
    if (error) return <div className="text-red-500">加载失败：{error.message}</div>;

    return (
        <div className="space-y-4">
            <ol>
                {items.map((item, index) => (
                    <li key={index} className="p-4 border rounded">
                        {/* {item.name} */}
                        {JSON.stringify(item)}
                        {/* {}{item.username} */}
                    </li>
                ))}
            </ol>
            {/* 加载触发器 */}
            {hasMore && (
                <div ref={ref} className="text-center py-4 text-gray-500">
                    {isValidating ? "加载更多..." : "下拉加载更多"}
                </div>
            )}

            {!hasMore && items.length > 0 && <div className="text-center py-4 text-gray-400">没有更多数据了</div>}
        </div>
    );
}

export default TimeLinePage;
