import React from "react";
import Info from "./Info";
import Countdown from "./Countdown";
import AnswerSheet from "./AnswerSheet";

function Layout() {
    return (
      <>
        <header className="h-16 bg-blue-600 px-8 flex flex-row items-center sticky top-0 z-10">
            <div className="text-white text-2xl">管制员执照题库</div>
        </header>
        <main className=" flex flex-row  bg-slate-100 px-8 pt-4 gap-2  relative ">
            <aside className="bg-white  divide-y  sticky top-20 h-max z-5   ">
                  <Info />
                  <Countdown />
            </aside>
            <main className="flex-1">
              {
                [0,1,2,3,4,5,6,7,8,9].map(()=>{
                  return <div className="bg-white h-64 "></div>
                })
              }

            </main>
            <aside className="bg-white  divide-y sticky top-20 h-max  z-5  ">
              <AnswerSheet />
            </aside>
        </main>
      </>
    );
}

export default Layout;
