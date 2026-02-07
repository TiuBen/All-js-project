import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlightContext } from '../context/FlightContext';
import FlightFilter from '../components/FlightFilter';
import FlightTable from '../components/FlightTable';
import Layout from './Layout';

function Home() {
  const { arrivalFlights, departureFlights, loading, setCurrentFlight } = useFlightContext();
  const navigate = useNavigate();

  const handleFlightClick = (flightNumber) => {
    navigate(`/detail/${flightNumber}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">加载中...</span>
          </div>
          <p className="mt-3">正在加载航班数据...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <FlightFilter />
      
      <div className="row">
        <div className="col-md-6 mb-4">
          <FlightTable 
            title="进港航班" 
            flights={arrivalFlights} 
            onFlightClick={handleFlightClick}
          />
        </div>
        <div className="col-md-6 mb-4">
          <FlightTable 
            title="出港航班" 
            flights={departureFlights} 
            onFlightClick={handleFlightClick}
          />
        </div>
      </div>
    </Layout>
  );
}

export default Home;