import { useState, useEffect, useContext } from "react";
import { WorkerDataService } from "services/index";

function useWorkerInformation(id = 1) {
    const [state, setState] = useState(null);

    useEffect( () => {
        WorkerDataService.getOneByID(id).then((data) => {
            setState(data);
        });
    }, [id]);

    return state;
}

export { useWorkerInformation };

