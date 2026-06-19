var Mock=require('mockjs');
var Random=Mock.Random;

const fakeTodo = {
    id: "",
    author: "",
    createdAt: "Mon Apr 26 06:01:55 +0000 2015",
    title: "Fake todo Title",
    content: "",
    users: "",
    isPrivate: false,
    startTime: "",
    endTime: "",
    duration: "",
    needResponse: "",
    response: "",
    reminderType: "",
    tags: [],
    isComplete: false,
    isDelete:false,
};

function mockTodo() {
    let todoList=[];
    for (let i = 0; i < parseInt( Math.random()*20); i++) {
       let _newTodo= Object.assign({},fakeTodo);
        _newTodo.id=i;
        _newTodo.author=Random.cname();
        _newTodo.title=Random.csentence(5,12);
        _newTodo.content=Random.csentence(14,40);
        _newTodo.users=Random.cname(2);
        _newTodo.isPrivate=Random.boolean();
        _newTodo.startTime= new Date(2023,2,parseInt(Math.random()*28));
        _newTodo.endTime='';
        _newTodo.duration=""
        _newTodo.needResponse=Random.boolean();
        _newTodo.reminderType="";
        
        var tags=[];

        for (let x = 0; x <parseInt(Math.random()*5); x++) {
           tags.push(Random.cword(2,6));
        }

        _newTodo.tags=tags;
        _newTodo.isComplete=Random.boolean();
        _newTodo.isDelete=Random.boolean();

        todoList.push(_newTodo);
    }

    

    // return Promise((resolve,reject)=>{

    // });
    return todoList;
}





export {fakeTodo,mockTodo}