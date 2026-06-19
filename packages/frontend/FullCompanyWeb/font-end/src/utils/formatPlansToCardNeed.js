// enum ILastType {
//     short="short",
//     long="long"
// }

// interface IPlan {
//     id:Number,
//     content:String,
//     comment:String,
//     type:ILastType

// }
// interface ICardNeedPlan{
//     name:string,
//     plans:

// }

// interface Plans extends Array<IPlan>{}

function formatPlansToCardNeed(plans, name, userslist) {
    var cardNeed = {
        name: "",
        plans: {
            short: [
                {
                    id: "",
                    content: "",
                    comment: "",
                },
            ],
            long: [
                {
                    id: "",
                    content: "",
                    comment: "",
                },
            ],
        },
    };

    const output = [];

    userslist.forEach((user) => {
        output.push({
            name: user.name,
            plans: {
                short: [],
                long: [],
            },
        });
    });

    plans.forEach((p) => {
        // output.find(x. )


    });
}
