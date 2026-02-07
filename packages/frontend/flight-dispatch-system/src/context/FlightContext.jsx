 //航班数据
import { createContext, useContext, useEffect, useState,useCallback } from 'react';
import { getFlights } from '../services/flightService';

export const FlightContext = createContext();

export function useFlightContext() {
  return useContext(FlightContext);
}

export function FlightProvider({ children }) {
  const [arrivalFlights, setArrivalFlights] = useState([]);
  const [departureFlights, setDepartureFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentFlight, setCurrentFlight] = useState(null); // 当前航班状态

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getFlights();
        setArrivalFlights(data.arrivalFlights);
        setDepartureFlights(data.departureFlights);
        setLoading(false);
      } catch (error) {
        console.error("航班数据获取失败:", error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const getFlightDetails = useCallback((flightNumber) => {
     // 设置当前航班
    setCurrentFlight(flightNumber);
    
    // 在实际应用中，这里应该调用API获取航班详情
    return {
      number: flightNumber,
      account: "B1173",
      gate: "315",
      model: "B712",
      estimatedArrival: "01:30",
      estimateDeparture: "04:30",
      overflightTime: "",
      destination: "EHU",
      tasks: [
        {
          id: 1,
          mainTask: "节点1",
          estimatedTime: "01:00",
          actualTime: "01:05",
          subTasks: [
            { id: 101, name: "辅助节点1-1", estimatedTime: "01:10", actualTime: "01:15" },
            { id: 102, name: "辅助节点1-2", estimatedTime: "01:20", actualTime: "01:25" }
          ],
          operator: "操作人1",
          remarks: "备注1"
        },
        {
          id: 2,
          mainTask: "节点2",
          estimatedTime: "02:00",
          actualTime: "02:05",
          subTasks: [
            { id: 201, name: "辅助节点2-1", estimatedTime: "02:10", actualTime: "02:15" }
          ],
          operator: "操作人2",
          remarks: "备注2"
        },
        // 更多任务...
      ]
    };
  }, []);

  const value = {
    arrivalFlights,
    departureFlights,
    loading,
    getFlightDetails,
    currentFlight // 暴露当前航班
  };

  return (
    <FlightContext.Provider value={value}>
      {children}
    </FlightContext.Provider>
  );
}