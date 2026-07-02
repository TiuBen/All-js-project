const BaseController = require("./Base.Controller");
const UserService = require("../services/User.Service");

const UserServiceInstance = new UserService();

class UserController extends BaseController {
    constructor() {
        //console.log("UserController");
        super(UserServiceInstance);
        this.getAll = this.getAll.bind(this);
        this.getById = this.getById.bind(this);
        this.update = this.update.bind(this);
        this.create = this.create.bind(this);
    }

    async getAll(req, res) {
        console.log("UserController getAll ");
        console.log(req.query);
        const { fields, groupBy, ...restQuery } = req.query;

        const options = {
            ...restQuery, // ✅ 保留其他 query 参数
        };
        if (fields) {
            options.fields = fields.trim() !== "" ? fields.split(",").map((f) => f.trim()) : ["*"];
        }else{
            options.fields = ["*"];
        }

        if (groupBy && groupBy.trim() !== "") {
            options.groupBy = "order";
        }

        console.log("options");
        console.log(options);
        await this.service
            .getAll(options)
            .then((result) => {
                // console.log("result");
                // console.log(result);
                res.json(result);
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json({ error: "Server error" });
            });
    }

    getById(req, res) {
        const id = req.params.id;
        //console.log(" UserController getById id:" + id);

        this.service
            .findById(id)
            .then((result) => {
                res.json(result);
            })
            .catch((err) => {
                res.status(500).json({ error: "Server error" });
            });
    }

    update(req, res) {
        const id = req.params.id;
        const data = req.body;
        //console.log(" UserController update id:" + id);
        //console.log(data);
        this.service
            .update(id, data)
            .then((result) => {
                //console.log(result);

                res.json(result);
            })
            .catch((err) => {
                res.status(500).json({ error: "Server error" });
            });
    }
}

module.exports = UserController;
