// import { useState, useEffect } from "react";
// import { server } from "../../lib/CONST";

// const useQuery = (url, params = {}) => {
//     const [data, setData] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         const fetchData = async () => {
//             setLoading(true);
//             setError(null);

//             try {
//                 const queryParams = new URLSearchParams(params).toString();
//                 const response = await fetch(`${server}${url}${queryParams}`);

//                 if (!response.ok) {
//                     throw new Error("Network response was not ok");
//                 }

//                 const result = await response.json();
//                 setData(result);
//             } catch (err) {
//                 setError(err.message);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchData();
//     }, [url, JSON.stringify(params)]); // Re-fetch when url or params change

//     return { data, loading, error };
// };

// export default useQuery;
