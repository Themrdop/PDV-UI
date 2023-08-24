import React from 'react';
import { HashRouter } from 'react-router-dom';

import { Provider } from 'react-redux';

import AppRoutes from './routes';
import store from './store';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <div>
      <Provider store={store}>
        <HashRouter>
          <div>
            <AppRoutes />
          </div>
        </HashRouter>
      </Provider>
    </div>
  );
}

export default App;
