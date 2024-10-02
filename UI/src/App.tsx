import React, { Suspense, lazy } from 'react';
import { HashRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';

// Use React.lazy to load AppRoutes lazily
const AppRoutes = lazy(() => import('./routes'));

function App() {
  return (
    <div>
      <Provider store={store}>
        <HashRouter>
          <div>
            {/* Use Suspense to handle the loading state while AppRoutes is being loaded */}
            <Suspense fallback={<div>Loading...</div>}>
              <AppRoutes />
            </Suspense>
          </div>
        </HashRouter>
      </Provider>
    </div>
  );
}

export default App;
