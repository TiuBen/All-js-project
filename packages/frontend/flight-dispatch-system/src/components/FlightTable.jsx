//航班表格组件
function FlightTable({ title, flights, onFlightClick }) {
  return (
    <div className="card shadow-sm">
      <div className="card-header fw-bold">{title}</div>
      <div className="card-body p-2">
        <table className="table table-bordered table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th>航班号</th>
              <th>起飞时间</th>
              <th>到达时间</th>
              <th>详情</th>
            </tr>
          </thead>
          <tbody>
            {flights.map((flight, index) => (
              <tr key={index}>
                <td>{flight.number}</td>
                <td>{flight.departure}</td>
                <td>{flight.arrival}</td>
                <td>
                  <button 
                    className="btn btn-link p-0" 
                    onClick={() => onFlightClick(flight.number)}
                  >
                    详细流程
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default FlightTable;
