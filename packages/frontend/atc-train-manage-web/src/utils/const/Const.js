const SERVER_URL = import.meta.env.VITE_SERVER_URL;
// const SERVER_URL = "http://localhost:3105";
// const SERVER_URL = ":3105";

const FETCHER = (...args) => fetch(...args).then((res) => res.json());

const POSITIONS = [
    "带班主任",
    "放行",
    "地面",
    "综合协调",

    "西塔台",
    "西地面",
    "西放行",
    "东塔台",
    "东地面",
    "东放行",
    "领班",
    "流控",
    "进近高扇",
    "进近低扇",
];

const API_URL = {
    API_URL: `${SERVER_URL}`,
    login: `${SERVER_URL}/api/login`,
    logout: `${SERVER_URL}/api/logout`,
    log: `${SERVER_URL}/api/log`,
    positions: `${SERVER_URL}/api/positions`,
    users: `${SERVER_URL}/api/users`,
    duty: `${SERVER_URL}/api/duty`,
    roles: `${SERVER_URL}/api/roles`,
    excel: `${SERVER_URL}/api/download-excel`,
    events: `${SERVER_URL}/api/events`,
    files: `${SERVER_URL}/api/files`,
};

export { SERVER_URL, FETCHER, POSITIONS, API_URL };
