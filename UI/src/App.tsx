import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';

import { Provider } from 'react-redux';

import Routes from './routes';
import store from './store';
import Login from './pages/Login';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <div>
      {isLoggedIn ? (
        <Provider store={store}>
        <BrowserRouter>
          <Routes />
        </BrowserRouter>
      </Provider>
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
