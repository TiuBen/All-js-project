import dutyService from "../service/dutyService";
import { create } from "zustand";
import useSWRInfinite from "swr/infinite";

const useDutyStore = create((set, get) => ({
    // SWRInfinite Hook（必须写在 store 的函数里返回）
    useDutyPagination() {
        const { data, error, size, setSize, isValidating } = useSWRInfinite(
            (pageIndex, previousPageData) => {
                // 无更多数据时停止请求
                if (previousPageData && !previousPageData.hasMore) return null;
                return { page: pageIndex + 1, limit: 10 };
            },
            ({ page, limit }) => dutyService.fetchDuties(page, limit), // 调用 service
            {
                revalidateFirstPage: false,
            }
        );

        // 扁平化 items
        const items = data ? data.flatMap((p) => p.items) : [];
        const hasMore = data && data[data.length - 1]?.hasMore;

        return {
            items,
            error,
            hasMore,
            size,
            setSize,
            isValidating,
            isLoadingInitial: !data && !error,
        };
    },
}));


export default useDutyStore;