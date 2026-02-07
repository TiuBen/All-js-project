//航班筛选组件
function FlightFilter() {
  return (
    <div className="mb-3">
      {["所有航班", "客运航班", "国际航班", "国内航班","中转航班","始发航班"].map((label, index) => (
        <div key={index} className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="radio"
            name="flightType"
            defaultChecked={index === 0}
          />
          <label className="form-check-label">{label}</label>
        </div>
      ))}
    </div>
  );
}
export default FlightFilter;
