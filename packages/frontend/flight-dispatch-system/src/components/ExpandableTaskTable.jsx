//航班任务节点组件
import React, { useState } from 'react';

function ExpandableTaskTable({ tasks }) {
  // 状态管理展开/折叠的任务
  const [expandedTasks, setExpandedTasks] = useState({});

  // 切换任务展开状态
  const toggleTask = (taskId) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body p-0">
        <table className="table table-bordered mb-0">
          <thead className="table-light">
            <tr>
              <th style={{ width: '5%' }}>序号</th>
              <th style={{ width: '15%' }}>主要监控指标</th>
              <th style={{ width: '10%' }}>预计时间</th>
              <th style={{ width: '10%' }}>实际时间</th>
              <th style={{ width: '15%' }}>操作人</th>
              <th style={{ width: '15%' }}>备注</th>
              <th style={{ width: '10%' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <React.Fragment key={task.id}>
                {/* 主要任务行 */}
                <tr>
                  <td>{task.id}</td>
                  <td>{task.mainTask}</td>
                  <td>{task.estimatedTime}</td>
                  <td>{task.actualTime}</td>
                  <td>
                    <input 
                      type="text"
                      className="form-control form-control-sm"
                      value={task.operator}
                      onChange={(e) => handleTaskChange(task.id, 'operator', e.target.value)}
                      placeholder="输入操作人"
                    />
                  </td>
                  <td>
                    <input 
                      type="text"
                      className="form-control form-control-sm"
                      value={task.remarks}
                      onChange={(e) => handleTaskChange(task.id, 'remarks', e.target.value)}
                      placeholder="输入备注"
                    />
                  </td>
                  <td className="text-center">
                    {task.subTasks.length > 0 && (
                      <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => toggleTask(task.id)}
                      >
                        {expandedTasks[task.id] ? '收起' : '展开'}
                      </button>
                    )}
                  </td>
                </tr>
                
                {/* 辅助任务行（展开时显示） */}
                {expandedTasks[task.id] && task.subTasks.map(subTask => (
                  <tr key={subTask.id} className="bg-light">
                    <td></td>
                    <td className="ps-4">- {subTask.name}</td>
                    <td>{subTask.estimatedTime}</td>
                    <td>{subTask.actualTime}</td>
                    <td>
                      <input 
                        type="text"
                        className="form-control form-control-sm"
                        value={task.operator}
                        onChange={(e) => handleTaskChange(task.id, 'operator', e.target.value)}
                        placeholder="输入操作人"
                        readOnly
                      />
                    </td>
                    <td>
                      <input 
                        type="text"
                        className="form-control form-control-sm"
                        value={task.remarks}
                        onChange={(e) => handleTaskChange(task.id, 'remarks', e.target.value)}
                        placeholder="输入备注"
                        readOnly
                      />
                    </td>
                    <td></td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ExpandableTaskTable;