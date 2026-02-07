import React, { useState, useEffect } from "react";
import Position from "./Components/Position";
import FaceAuthDialog from "../../component/FaceAuthDialog";
import UserListDialog from "../../component/UserListDialog";
import ConfirmGetOutDialog from "../../component/ConfirmGetOutDialog";
import { Route } from "react-router-dom";
const Positions = [
    { position: "西塔台", dutyType: ["主班", "副班"] },
    { position: "西地面", dutyType: ["主班", "副班"] },
    { position: "西放行", dutyType: ["主班", "副班"] },
    { position: "进近高扇", dutyType: ["主班", "副班"] },
    { position: "进近低扇", dutyType: ["主班", "副班"] },
    { position: "东塔台", dutyType: ["主班", "副班"] },
    { position: "东地面", dutyType: ["主班", "副班"] },
    { position: "东放行", dutyType: ["主班", "副班"] },
    { position: "领班" },
    { position: "流控" },
];

function MainPage() {
    //   const [needReload, setNeedReload] = useState(false);
    //   const [selectedPosition, setSelectedPosition] = useLocalStorageState("position", { listenStorageChange: true });
    //   const [selectedDutyType, setSelectedDutyType] = useLocalStorageState("dutyType", { listenStorageChange: true });

    //   const [openSelectUserDialog, setOpenSelectUserDialog] = useState(false);
    //   const [openConfirmGetOutDialog, setOpenConfirmGetOutDialog] = useState(false);
    //   const [openCompareFaceDialog, setOpenCompareFaceDialog] = useState(false);

    //   useEffect(() => {
    //       // if (openConfirmGetOutDialog) {
    //       //     setOpenCompareFaceDialog(true);
    //       // }
    //       // if (openCompareFaceDialog) {
    //       //     setOpenConfirmGetOutDialog(true);
    //       // }
    //   }, [openConfirmGetOutDialog, openCompareFaceDialog, setOpenCompareFaceDialog, setOpenConfirmGetOutDialog]);

    return (
        //   <DialogContext.Provider
        //       value={{
        //           needReload: needReload,
        //           setNeedReload: setNeedReload,

        //           openSelectUserDialog: openSelectUserDialog,
        //           setOpenSelectUserDialog: setOpenSelectUserDialog,

        //           selectedPosition: selectedPosition,
        //           setSelectedPosition: setSelectedPosition,
        //           openConfirmGetOutDialog: openConfirmGetOutDialog,
        //           setOpenConfirmGetOutDialog: setOpenConfirmGetOutDialog,
        //           openCompareFaceDialog: openCompareFaceDialog,
        //           setOpenCompareFaceDialog: setOpenCompareFaceDialog,
        //       }}
        //   >
        //       <div>{server}</div>

        //       <div className=" justify-self-center grid  sm:grid-cols-1 md:grid-cols-2  lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5  m-auto  place-self-center gap-2 ">
        //           {Positions.map((x, index) => {
        //               return <Position position={x.position} dutyType={x?.dutyType} key={index} />;
        //           })}
        //           <SelectUserDialog />
        //       </div>
        //   </DialogContext.Provider>

        <>
            <div className=" justify-self-center grid  sm:grid-cols-1 md:grid-cols-2  lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5  m-auto  place-self-center gap-2 ">
                {Positions.map((x, index) => {
                    return <Position position={x.position} dutyType={x?.dutyType} key={index} />;
                })}
                {/* <SelectUserDialog /> */}
            </div>
            <UserListDialog title={""} excludeUser={[]} />
            <FaceAuthDialog />
            <ConfirmGetOutDialog />
        </>
    );
}

const MainPageRoutes = () => {
    return(
        <>
            <Route index element={<MainPage /> }  />
        </>
    )
     return ;
};

export default MainPageRoutes;
