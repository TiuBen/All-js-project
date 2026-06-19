import axios from "axios";
import { ServerHttpURL } from "./URLS";
//  axios.create({
//   baseURL: "http://127.0.0.1:3100/",
//   headers: {
//     "Content-type": "application/json"
//   }
// });

// axios.defaults.baseURL=ServerURL;
// axios.interceptors.response.use(function(response){
//   console.log("这是用axios的response的拦截");
//   return response;
// },function(error){
//   console.log("这是用axios的response的error");

//   return Promise.reject(error);
// })

const defaultOptions = {
    baseURL: ServerHttpURL,
    headers: {
        "Content-Type": "application/json",
    },
};

const Request = axios.create(defaultOptions);
// 每次的请求中添加 user="沈宁" ???
// ? TODO 也许也可以用token 解析来做
// Request.interceptors.request.use(function (config) {
//     console.log("%c req", "color:green");
//     console.log(config.data);
//     config.transformRequest = [
//         function (data, headers) {
//             // Do whatever you want to transform the data
//             console.log("???:" + data);
//             console.log(data);
//             return data;
//         },
//     ];
//     return config;
// });

Request.interceptors.response.use(
    function (response) {
        console.log("%c这是用axios的response的拦截", "color:green");
        // !这里只返回data.这里只返回data
        console.log("rrrrr");
        console.log(response);
        return response.data;
    },
    function (error) {
        console.error("errorerrorerrorerror");
        console.error(error);
        // window.localStorage.clear();

        // window.location.reload();
        // return {...error.response.data};
        // return Promise.reject(error);\
        return error.response;
    }
);

export { defaultOptions, Request };
