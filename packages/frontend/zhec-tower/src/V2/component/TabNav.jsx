import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, useHistory, useLocation } from 'react-router-dom';
import * as Tabs from '@radix-ui/react-tabs';

// Tab component
const TabComponent = () => {
  // Read the last visited tab from localStorage or default to 'tab1'
  const storedTab = localStorage.getItem('activeTab') || 'tab1';
  const [activeTab, setActiveTab] = useState(storedTab);

  const location = useLocation();
  const history = useHistory();

  // Update active tab based on the current route
  useEffect(() => {
    const path = location.pathname.split('/')[1];
    if (path) {
      setActiveTab(path);
    }
  }, [location]);

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    localStorage.setItem('activeTab', tab); // Store the active tab in localStorage
    history.push(`/${tab}`); // Update URL without page reload
  };

  return (
    <Tabs.Root value={activeTab} onValueChange={handleTabChange}>
      <Tabs.List aria-label="Tabs" style={{ display: 'flex', gap: 10 }}>
        <Tabs.Trigger value="tab1" style={tabStyle}>
          Tab 1
        </Tabs.Trigger>
        <Tabs.Trigger value="tab2" style={tabStyle}>
          Tab 2
        </Tabs.Trigger>
        <Tabs.Trigger value="tab3" style={tabStyle}>
          Tab 3
        </Tabs.Trigger>
      </Tabs.List>
      
      <Tabs.Content value="tab1" style={tabContentStyle}>
        <div>Content for Tab 1</div>
      </Tabs.Content>
      <Tabs.Content value="tab2" style={tabContentStyle}>
        <div>Content for Tab 2</div>
      </Tabs.Content>
      <Tabs.Content value="tab3" style={tabContentStyle}>
        <div>Content for Tab 3</div>
      </Tabs.Content>
    </Tabs.Root>
  );
};

const App = () => {
  return (
    <Router>
      <TabComponent />
      <Switch>
        <Route path="/tab1" exact>
          <div>Content for Tab 1 (URL)</div>
        </Route>
        <Route path="/tab2" exact>
          <div>Content for Tab 2 (URL)</div>
        </Route>
        <Route path="/tab3" exact>
          <div>Content for Tab 3 (URL)</div>
        </Route>
      </Switch>
    </Router>
  );
};

// Simple styles
const tabStyle = {
  padding: '10px 20px',
  cursor: 'pointer',
  backgroundColor: '#e0e0e0',
  border: '1px solid #ccc',
  borderRadius: '4px',
};

const tabContentStyle = {
  padding: '20px',
  borderTop: '1px solid #ccc',
};

export default App;
