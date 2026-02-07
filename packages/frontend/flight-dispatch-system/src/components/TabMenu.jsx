//标签菜单组件
import { useLocation, useNavigate } from 'react-router-dom';

function TabMenu() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path) => {
    return location.pathname.includes(path);
  };

  return (
    <div className="d-flex justify-content-between mt-4 mb-3">
      <div className="btn-group" role="group">
        <button 
          className={`btn ${isActive('/') ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => navigate('/')}
        >
          首页
        </button>
        <button 
          className={`btn ${isActive('inbound') ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => navigate('/inbound')}
        >
          进港计划
        </button>
        <button 
          className={`btn ${isActive('outbound') ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => navigate('/outbound')}
        >
          出港计划
        </button>
        <button 
          className={`btn ${isActive('schedule') ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => navigate('/schedule')}
        >
          航班计划
        </button>
      </div>
    </div>
  );
}

export default TabMenu;