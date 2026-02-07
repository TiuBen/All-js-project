import { useState } from 'react';

function FormulaSelector({ currentFlight }) {
  const [selectedFormula, setSelectedFormula] = useState(null);
  
  const formulas = [
    { id: 1, name: '客运过站' },
    { id: 2, name: '货运国际过站' },
    { id: 3, name: '货运国际始发' },
    { id: 4, name: '货运国内过站' },
    { id: 5, name: '货运国内始发' }
  ];

  const handleSubmit = () => {
    if (!selectedFormula || !currentFlight) {
      alert('请选择算法并确保有航班信息');
      return;
    }
    
    const submitData = {
      flightNumber: currentFlight,
      formulaId: selectedFormula.id,
      formulaName: selectedFormula.name
    };
    
    console.log("提交公式数据:", submitData);
    // 实际API调用示例:
    // fetch('/api/submit-formula', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(submitData)
    // });
    
    alert(`已应用算法: ${selectedFormula.name}`);
  };

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-header fw-bold">时间算法选择</div>
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <label className="form-label me-2">选择预计时间算法:</label>
            <select 
              className="form-select"
              value={selectedFormula?.id || ''}
              onChange={(e) => {
                const id = parseInt(e.target.value);
                const formula = formulas.find(f => f.id === id);
                setSelectedFormula(formula);
              }}
            >
              <option value="">请选择算法</option>
              {formulas.map(formula => (
                <option key={formula.id} value={formula.id}>
                  {formula.name}
                </option>
              ))}
            </select>
          </div>
          
          <button 
            className="btn btn-primary"
            disabled={!selectedFormula}
            onClick={handleSubmit}
          >
            应用算法
          </button>
        </div>
      </div>
    </div>
  );
}

export default FormulaSelector;