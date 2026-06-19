import http from "../utils/axiosHelper";

// 获取单个Todo by ID
// 修改单个Todo by ID
// 删除单个Todo by ID
// /todo/${id}


// 获取某个Worker的所有Todo by workerName/workerID 
// 修改某个Worker的所有Todo by workerName/workerID
// 删除某个Worker的所有Todo by workerName/workerID
// /todos/${name=?}             /todos?name=‘沈宁‘
// /todos/${workerID=?}         /todoe?workerID=1 

// 获取某个workerName/workerID的单个Todo  
// 修改某个workerName/workerID的单个Todo 
// 删除某个workerName/workerID的单个Todo 
// /todos/${name=?}/${id=?}
// /todos/${workerID=?}/${id=?}


// 获取所有的Todo
// 删除所有的Todo
// /todos


class TodoDataService {
    getAll() {
        return http.get("/todo");
    }

    get(id) {
        return http.get(`/todo/${id}`);
    }

    create(data) {
        return http.post("/todo", data);
    }

    update(id, data) {
        return http.put(`/todo/${id}`, data);
    }

    delete(id) {
        return http.delete(`/worker/${id}`);
    }

    deleteAll() {
        return http.delete(`/worker`);
    }

    findByName(name) {
        return http.get(`/worker?name=${name}`);
    }
}

export default new TodoDataService();
