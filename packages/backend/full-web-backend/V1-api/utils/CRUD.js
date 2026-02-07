//*! 连接数据库初始化部分
const ENV = require("./CONST");

var MYSQLX = require("@mysql/xdevapi");
// @PARAM
var SESSION = MYSQLX;

function InitSession(dbName = ENV.DefaultDbName) {
    MYSQLX.getSession({
        host: "localhost",
        port: 33060,
        user: "root",
        password: "root1234",
    })
        .then(function (session) {
            return session.getSchema(dbName);
        })
        .catch((err) => {
            console.log(err);
        });
}

// TEST-FUNCTION
function TestConnection(response) {
    MYSQLX.getSession({
        host: "localhost",
        port: 33060,
        user: "root",
        password: "root1234",
    })
        .then(function (session) {
            // Get a list of all available schemas
            SESSION = session;
            return SESSION.getSchemas(); //*! 测试获取全部数据库
            // return session.getSchema("companydatabase");
        })
        .then(function (schemaList) {
            console.log("Available schemas in this session:\n");

            // Loop over all available schemas and print their name
            var names = [];
            schemaList.forEach(function (schema) {
                console.log(schema.getName());
                names.push(schema.getName());
            });
            response.send(JSON.stringify(names));
        })
        .catch((err) => {
            console.log(err);
        });
}

// TestConnection();

//*! create   插入数据 新建表格
// TEST-FUNCTION
function createTable(session, name) {
    var create = "CREATE TABLE ";
    create += name;
    create += " (id INT NOT NULL PRIMARY KEY AUTO_INCREMENT)";

    return session
        .sql("DROP TABLE IF EXISTS " + name)
        .execute()
        .then(function () {
            return session.sql(create).execute();
        });
}
// TEST-FUNCTION
function TestCreateTable() {
    createTable(SESSION, "TestCreateTableFunction");
}

// @STEP Database
// function getSession();
// function getSchema();
// function getName();
// function existsInDatabase();

// @STEP Schema
// @STEP>> Browse Functions
// function getCollections()
// function getTables();
// @STEP>> DbObject Instance Functions
// function getCollection();
// function getTable();
// function getCollectionAsTable();
// @STEP>> Create Functions
// function createCollection()

// @STEP Collection
// @STEP>> CRUD Functions
// *! add find modify remove
function CollectionAdd(databaseName = "companydatabase", collectionName = "Default", jsonData, response) {
    MYSQLX.getSession({
        host: "localhost",
        port: 33060,
        user: "root",
        password: "root1234",
    })
        .then(function (session) {
            var DB = session.getSchema(databaseName);
            // Get a collection object for 'my_collection'
            // var collection = db.getCollection('my_collection');
            return DB.createCollection(collectionName, { reuseExisting: true });
        })
        .then(function (myColl) {
            var result = myColl.add(jsonData).execute();
            console.log(result);
            return result;
            // var items = [];
            // jsonData.forEach((item) => {
            //     items.push(
            //         new Promise((resolve, reject) => {
            //             myColl.add(item).execute();
            //         })
            //     );
            // });
            // return Promise.all(items).then(myColl.find().execute());
        })
        .then(function (result) {
            console.log(result.getGeneratedIds());
            response.send(
                JSON.stringify({
                    affectedCount: result.getAffectedItemsCount(),
                    generatedIds: result.getGeneratedIds(),
                })
            );
        })
        .catch((err) => {
            console.log(err);
        });
}
// function find()
function CollectionFind(databaseName = "companydatabase", collectionName = "Default", sqlExpression, response) {
    MYSQLX.getSession({
        host: "localhost",
        port: 33060,
        user: "root",
        password: "root1234",
    })
        .then(function (session) {
            var DB = session.getSchema(databaseName);
            // Get a collection object for 'my_collection'
            return (collection = DB.getCollection(collectionName));
        })
        .then(function (myColl) {
            console.log("sqlExpression");
            console.log(sqlExpression);
            var document = myColl.find(sqlExpression).execute();
            return document;
        })
        .then(function (doc) {
            console.log("查询到了数据");
            return doc.fetchAll();
        })
        .then(function (ans) {
            console.log("正在往前端发送数据");
            var _test = [];
            ans.forEach((i) => _test.push(i));
            response.send(_test);
        })
        .catch((err) => {
            console.log(err);
        });
}
// function modify()
function CollectionModify(databaseName = ENV.DefaultDbName, collectionName = ENV.DefaultTableName, request, response) {
    // TODO 应该在这里添加 对request 的处理
    var sqlExpression = '_id = "' + request.body.id + '"';
    var modify = JSON.stringify(request.body);

    console.log(sqlExpression);
    console.log(modify);
    console.log("------");

    // TODO
    MYSQLX.getSession({
        host: "localhost",
        port: 33060,
        user: "root",
        password: "root1234",
    })
        .then(function (session) {
            var DB = session.getSchema(databaseName);
            // Get a collection object for 'my_collection'
            return (collection = DB.getCollection(collectionName));
        })
        .then(function (myColl) {
            console.log("sqlExpression");
            console.log(sqlExpression);
            // var result = myColl.modify(sqlExpression).patch(request.body).execute();
            var result = myColl
                .modify(sqlExpression)
                .set("$", MYSQLX.expr('"' + modify + '"'))
                .execute();
            return result;
        })
        .then(function (rst) {
            console.log("修改了数据");
            console.log(rst.getAffectedItemsCount());
        })
        .catch((err) => {
            console.log(err);
        });
}

// function remove()
// @STEP>> Index Functions
// *! create drop get index
// function createIndex()
// function dropIndex()
// function getIndexes()
// *! add find modify remove
// function newDoc()
// function count()

// @STEP Table
// @STEP>> CRUD Functions
// function insertObjIntoTable()
function selectObjFromTable(databaseName = ENV.DefaultDbName, tableName = ENV.DefaultTableName, request, response) {
    var session;
    var data = {
        "name":request.query.name,
        "short":[],
        "long":[]
    }

    MYSQLX.getSession({
        host: "localhost",
        port: 33060,
        user: "root",
        password: "root1234",
    })
        .then(function (s) {
            session = s;
            return session.getSchema(databaseName);
        })
        .then(function () {
            const query = request.query;
            console.log("test query");
            var [key, value] = Object.entries(query);
            console.log(key + ":" + value);
            console.log("______test query");

            var sqlExpression="SELECT id,type FROM "+databaseName+"."+tableName+" where name='"+query.name+"'";
            console.log(sqlExpression);

              var result= session.sql("SELECT id FROM companydatabase.plan where name = '沈宁'").execute(function (row) {
                // var result= session.sql(sqlExpression).execute(function (row) {
                    // console.log("row");
                    // console.log("ID:"+row[0]+" type:"+row[1]);
                    if (row[1]==1) {
                        data.long.push(row[0]);
                    }else{
                        data.short.push(row[0]);
                    }
                })
                // console.log("in result");
                // console.log(data);
            return result;
        })
        .then(function (result) {
            // console.log(result);
            // console.log(data);
            response.send(JSON.stringify(data));
        })
        .catch((err) => console.log(err));
}
// function updateObjFromTable()
// function deleteObjFromTable()

//*! update   更新数据 新建数据
//*! read     查询数据
//*! delete   删除数据 删除table中的某一行数据

module.exports = { TestConnection, CollectionAdd, CollectionFind, CollectionModify, selectObjFromTable };
