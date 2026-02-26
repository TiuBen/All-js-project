import { useState, useEffect } from "react";
import "./App.css";
import { useAppStore } from "./store/app.store";

function App() {
    const [count, setCount] = useState(0);
    const { positions, positionsLoading, fetchPositions } = useAppStore();

    useEffect(() => {
        fetchPositions();
    }, [fetchPositions]);

    if (positionsLoading) return <div>Loading...</div>;
    return <>{JSON.stringify(positions)}</>;
}

export default App;
