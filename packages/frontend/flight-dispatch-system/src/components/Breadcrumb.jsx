//导航组件
import { useLocation, Link } from 'react-router-dom';
import { useFlightContext } from '../context/FlightContext';

function Breadcrumb() {
  const location = useLocation();
  const { currentFlight } = useFlightContext();
  //分割路径
  const pathnames = location.pathname.split('/').filter(x => x);

   // 路径名称映射到中文显示
  const pathNameMap = {
    inbound: '进港计划',
    outbound: '出港计划',
    schedule: '航班计划',
    detail: '航班详情'
  };

  return (
    <nav aria-label="breadcrumb" className="mb-3">
      <ol className="breadcrumb">
        <li className="breadcrumb-item">
          <Link to="/">首页</Link>
        </li>
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          
           // 映射路径名称到中文显示
          const displayName = pathNameMap[name] || name;

          // 如果是航班详情页，显示航班号
          if (name === 'detail' && currentFlight) {
            return (
              <li key={index} 
                  className="breadcrumb-item active" 
                  aria-current="page">
                {currentFlight}
              </li>
            );
          }

          return (
            <li 
              key={index}
              className={`breadcrumb-item ${isLast ? 'active' : ''}`}
              aria-current={isLast ? 'page' : undefined}
            >
              {isLast ? (
                displayName
              ) : (
                <Link to={routeTo}>{displayName}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}


export default Breadcrumb;