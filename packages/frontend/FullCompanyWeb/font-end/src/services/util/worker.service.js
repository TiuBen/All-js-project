import http from "utils/axiosHelper";

const getAll = () => {
    return http.get("/worker");
};

async function getOneByID(id) {
    return http
        .get(`/worker/${id}`)
        .then((res) => {
          console.log("测试 worker service 的 res");
          console.log(res);
            return res.data;
        })
}

const createOne = (data) => {
    return http.post("/worker", data);
};

const updateOneByID = (id, data) => {
    return http.put(`/worker/${id}`, data);
};

const deleteOneByID = (id) => {
    return http.delete(`/worker/${id}`);
};

const deleteAll = () => {
    return http.delete(`/worker`);
};

const findOneByName = (name) => {
    return http.get(`/worker?name=${name}`);
};

export { getAll, getOneByID, createOne };
