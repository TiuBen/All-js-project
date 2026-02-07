const {Positions}=require('../utils/FakeWhoIsOnDuty')


var RandomPosition=[...Positions];
async function GetThisPosition(){
     console.log('\x1b[36m%s\x1b[0m', 'GetThisPosition');  //cyan

      const data=RandomPosition[Math.floor( Math.random()*RandomPosition.length)];

     // console.log(data);
     
     console.log('\x1b[36m%s\x1b[0m', 'GetThisPosition');  //cyan

     return Promise.resolve(data);
}     

module.exports={GetThisPosition}

