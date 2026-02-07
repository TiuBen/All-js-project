import React from "react";
import UserStore from "../store/UserStore";
import useDutyStore from "../store/DutyStore";
import RadioButtonUserList from "./BarRight/RadioButtonUserList";

function TestStore() {
    const {
        users,
        selectedUser,
        groupedUsers,
        detailUsers,
        positions,
        onDutyUsers,
        isLoading,
        error,
        initStore,
        fetchOnDutyUsers,
    } = UserStore();

    const {
        items,
        hasMore,
        isValidating,
        error: dd,
        isLoadingInitial,
        setSize,
    } = useDutyStore((s) => s.useDutyPagination());

    return (
        <div>
            <button onClick={() => setSize(  1)} className="px-4 py-2 bg-blue-600 text-white rounded">
                手动加载下一页
            </button>
            {isLoadingInitial && <div>初始化加载中...</div>}
            {isValidating && <div>加载中...</div>}
            {dd && <div className="text-red-500">错误：{dd.message}</div>}
            <div className="text-green-600">hasMore: {String(hasMore)}</div>
            <div>
                <h3 className="font-bold">数据：</h3>
                <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(items, null, 2)}</pre>
            </div>
            <br />
            <RadioButtonUserList />
            <br />
            <>{JSON.stringify(selectedUser)}</>
            <br />
            <>{JSON.stringify(users)}</>
        </div>
    );
}

export default TestStore;
