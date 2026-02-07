import React from "react";
import useStore from "../../utils/store/userStore";

function MonthPage() {
    const { users, detailUsers } = useStore();
    return (
        <div className="w-full h-full  flex flex-col">
            <>
                <div className="flex flex-row gap-2 bg-slate-400  min-w-0 overflow-x-auto h-12  p-2">
                    {users.map((user, index) => (
                        <div key={user.id} className="text-nowrap whitespace-nowrap min-w-fit   ">
                            {user.username}
                        </div>
                    ))}
                </div>
            </>
            <div className="flex-1 min-h-0 min-w-0 overflow-auto">
                <div className="w-[1000px] h-[800px] bg-yellow-100">fadfasdfasf</div>
            </div>
        </div>
    );
}

export default MonthPage;
