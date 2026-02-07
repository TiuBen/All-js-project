import React, { useState, useEffect } from "react";
import useStore from "../utils/store/userStore";

function AppVSkeleton() {
    const { users } = useStore();

    return <div>{JSON.stringify(users)}</div>;
}

function AppV6() {
    const { users,fetchUsers } = useStore();
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);
    return (
        <div>
            AppV6
            <div>{JSON.stringify(users)}</div>
        </div>
    );
}

export default AppV6;
