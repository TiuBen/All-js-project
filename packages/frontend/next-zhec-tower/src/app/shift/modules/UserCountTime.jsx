import React from "react";

function UserCountTime(props) {
    const { users } = props;

    const testUsers=[
        { username:"zhangshan",
          checkInTime:"2023-01-01 10:00:00",
          checkOutTime:"2023-01-01 12:00:00",
        },
        { username:"zhangshan",
          checkInTime:"2023-01-01 10:00:00",
          checkOutTime:"2023-01-01 12:00:00",
        },
        
    ]

    return <div>UserCountTime{}</div>;
}

export default UserCountTime;
