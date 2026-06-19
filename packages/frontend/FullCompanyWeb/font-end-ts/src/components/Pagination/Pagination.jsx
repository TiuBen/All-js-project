import { ArrowLeft, ArrowRight, ArrowRightOutlined, ArrowRightRounded } from "@mui/icons-material";
import React, { useState, useEffect, useMemo } from "react";

const range = (start, end) => {
    console.log("range", start, end);
    let length = end - start + 1;
    /*
            Create an array of certain length and set the elements within it from
        start value to end value.
      */
    console.log(
        "range",
        Array.from({ length }, (_, idx) => idx + start)
    );

    return Array.from({ length }, (_, idx) => idx + start);
};
const LeftDOTS = "左";
const RightDOTS = "右";

const usePagination = ({ totalCount, pageSize, siblingCount = 1, currentPage }) => {
    const paginationRange = useMemo(() => {
        console.log("usePagination:"+ totalCount+"=" +pageSize+"=" +siblingCount+"=" +currentPage);
        const totalPageCount = Math.ceil(totalCount / pageSize);
        const totalPageNumbers = siblingCount + 5;

        if (totalPageNumbers >= totalPageCount) {
            return range(1, totalPageCount);
        }

        const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
        const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPageCount);

        const shouldShowLeftDots = leftSiblingIndex > 2;
        const shouldShowRightDots = rightSiblingIndex < totalPageCount - 2;

        const firstPageIndex = 1;
        const lastPageIndex = totalPageCount;

        if (!shouldShowLeftDots && shouldShowRightDots) {
            let leftItemCount = 3 + 2 * siblingCount;
            let leftRange = range(1, leftItemCount);

            return [...leftRange, RightDOTS, totalPageCount];
        }

        if (shouldShowLeftDots && !shouldShowRightDots) {
            let rightItemCount = 3 + 2 * siblingCount;
            let rightRange = range(totalPageCount - rightItemCount + 1, totalPageCount);
            return [firstPageIndex, LeftDOTS, ...rightRange];
        }

        if (shouldShowLeftDots && shouldShowRightDots) {
            let middleRange = range(leftSiblingIndex, rightSiblingIndex);
            return [firstPageIndex, LeftDOTS, ...middleRange, RightDOTS, lastPageIndex];
        }
    }, [totalCount, pageSize, siblingCount, currentPage]);

    return paginationRange;
};

function Pagination({
    totalCount = 100,
    pageSize = 1,
    currentPage = 0, // 从0开始
    onPageChange = () => {},
    siblingCount = 1,
    pageSizeOption,
}) {
    // Ensure current page is within bounds
    const paginationRange = usePagination({ totalCount, pageSize, siblingCount, currentPage });

    if (currentPage < 0 || paginationRange.length < 2) {
        return null;
    }

    const onNext = () => {
        let newPageIndex = currentPage + 1;
        if (newPageIndex > Math.ceil(totalCount / pageSize)) {
            newPageIndex = Math.ceil(totalCount / pageSize);
        }

        onPageChange(newPageIndex);
    };

    const onPrevious = () => {
        let newPageIndex = currentPage - 1;
        if (newPageIndex < 1) {
            newPageIndex = 1;
        }
        onPageChange(newPageIndex);
    };

    const onLeftDOT = () => {
        let newPageIndex = currentPage - siblingCount * 2;
        if (newPageIndex < 1) {
            newPageIndex = 1;
        }

        onPageChange(newPageIndex);
    };

    const onRightDOT = () => {
        let newPageIndex = currentPage + siblingCount * 2;
        if (newPageIndex > Math.ceil(totalCount / pageSize)) {
            newPageIndex = Math.ceil(totalCount / pageSize);
        }

        onPageChange(newPageIndex);
    };

 
    let lastPage = paginationRange[paginationRange.length - 1];

    return (
        <div className="flex flex-row  items-baseline">
            <ul className="flex flex-row gap-1">
                {/* Left navigation arrow */}
                <li
                    className={`rounded-lg hover:bg-gray-200 ${
                        currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                    } `}
                    onClick={onPrevious}
                >
                    <ArrowLeft />
                </li>
                {paginationRange.map((pageNumber, index) => {
                    // If the pageItem is a DOT, render the DOTS unicode character
                    if (pageNumber === LeftDOTS) {
                        return (
                            <li key={index} className="rounded-lg hover:bg-gray-200 px-2" onClick={onLeftDOT}>
                                &#8230;
                            </li>
                        );
                    }
                    if (pageNumber === RightDOTS) {
                        return (
                            <li key={index} className="rounded-lg hover:bg-gray-200 px-2" onClick={onRightDOT}>
                                &#8230;
                            </li>
                        );
                    }

                    // Render our Page Pills
                    return (
                        <li
                            key={index}
                            className={`${
                                pageNumber === currentPage  ? "border-[1.4px]  border-blue-400 rounded-lg" : ""
                            } px-2 rounded-lg hover:bg-gray-200`}
                            onClick={()=> onPageChange(pageNumber)}
                        >
                            {pageNumber}
                        </li>
                    );
                })}
                {/*  Right Navigation arrow */}
                <li
                    className={`rounded-lg hover:bg-gray-200 ${
                        currentPage >= lastPage ? "opacity-50 cursor-not-allowed" : ""
                    } `}
                    onClick={onNext}
                >
                    <ArrowRight />
                </li>
            </ul>
            <div>
                第<input className="border w-[2rem]" max={100}/>/<span> {Math.ceil(totalCount / pageSize)}</span>页
            </div>
        </div>
    );
}

export  {Pagination};
