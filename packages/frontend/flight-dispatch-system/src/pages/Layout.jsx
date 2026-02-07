//页面布局组件
import TopBar from '../components/TopBar';
import TabMenu from '../components/TabMenu';
import Breadcrumb from '../components/Breadcrumb';

function Layout({ children }) {
  return (
    <div className="container-fluid px-4 py-3">
      <TopBar />
      <TabMenu />
      <Breadcrumb />
      {children}
    </div>
  );
}

export default Layout;