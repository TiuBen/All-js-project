 //航班详情页面
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useFlightContext } from '../context/FlightContext';
import Layout from './Layout';
import FormulaSelector from '../components/FormulaSelector';
import ExpandableTaskTable from '../components/ExpandableTaskTable';

function Detail() {
  const { flightNumber } = useParams();
  const { getFlightDetails, currentFlight} = useFlightContext();
  const [flightData, setFlightData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editableTasks, setEditableTasks] = useState([]);

  useEffect(() => {
    const fetchFlightData = async () => {
      try {
        setLoading(true);
        const data = getFlightDetails(flightNumber);
        setFlightData(data);

        setEditableTasks(
          data.tasks.map(task => ({
            ...task,
            operator: task.operator || '',     // 初始化为空字符串
            remarks: task.remarks || ''       // 初始化为空字符串
          }))
        );

        setError(null);
      } catch (err) {
        setError('加载航班详情失败');
        console.error('航班详情加载错误:', err);
      } finally {
        setLoading(false);
      }
    };

    if (flightNumber) {
      fetchFlightData();
    }
  }, [flightNumber, getFlightDetails]);

  const handleTaskChange = (taskId, field, value) => {
    setEditableTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, [field]: value } : task
      )
    );
  };

  //提交任务数据
  const handleSubmitTasks = () => {
    if (!flightData) return;
    
    const submitData = {
      flightNumber: flightData.number,
      tasks: editableTasks.map(task => ({
        id: task.id,
        operator: task.operator,
        remarks: task.remarks
      }))
    };
    
    console.log("提交任务数据:", JSON.stringify(submitData, null, 2));
    // fetch('/api/submit-tasks', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(submitData)
    // });
    
    alert('任务数据已提交！');
  };


  if (loading) {
    return(
      <Layout>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">加载中...</span>
          </div>
          <p className="mt-3">正在加载航班详情...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="alert alert-danger text-center">
          {error}
          <button 
            className="btn btn-link p-0 ms-2"
            onClick={() => window.location.reload()}
          >
            重试
          </button>
        </div>
      </Layout>
    );
  }

  if (!flightData) {
    return (
      <Layout>
        <div className="alert alert-warning text-center">
          未找到航班 {flightNumber} 的详细信息
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* 航班信息卡片... */}
      <div className="card shadow-sm mb-4">
        <div className="card-header fw-bold d-flex justify-content-between align-items-center">
          <span>航班信息</span>
          <small className="text-muted">航班号: {flightData.number}</small>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-3">
              <div className="fw-bold">机号</div>
              <div>{flightData.account}</div>
            </div>
            <div className="col-md-3">
              <div className="fw-bold">机位</div>
              <div>{flightData.gate}</div>
            </div>
            <div className="col-md-3">
              <div className="fw-bold">机型</div>
              <div>{flightData.model}</div>
            </div>
             <div className="col-md-3">
              <div className="fw-bold">机型</div>
              <div>{flightData.model}</div>
            </div>
          </div>
          
          <div className="row">
            <div className="col-md-3">
              <div className="fw-bold">预计到达</div>
              <div>{flightData.estimatedArrival}</div>
            </div>
            <div className="col-md-3">
              <div className="fw-bold">预计推出时间</div>
              <div>{flightData.estimateDeparture}</div>
            </div>
            <div className="col-md-3">
              <div className="fw-bold">始发地</div>
              <div>{flightData.overflightTime}</div>
            </div>
            <div className="col-md-3">
              <div className="fw-bold">目的地</div>
              <div>{flightData.destination}</div>
            </div>
          </div>
        </div>
      </div>
      {/* 公式选择器 */}
      <FormulaSelector currentFlight={flightData?.number} />
      <div className="d-flex justify-content-between mb-3">
        <h5>任务列表</h5>
        <button 
          className="btn btn-primary"
          onClick={handleSubmitTasks}
        >
          提交任务数据
        </button>
      {/* 任务节点 */}
      </div>
       <ExpandableTaskTable 
        tasks={editableTasks}
        handleTaskChange={handleTaskChange}
      />
    </Layout>
  );
}

export default Detail;