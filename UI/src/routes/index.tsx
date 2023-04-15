import React from 'react';

import { Switch, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Product from '../pages/Product';
import About from '../pages/About';
import Configuration from '../pages/Configuration';
import Combo from '../pages/Combo';
import UserAdministration from '../pages/User';

function Routes() {
  return (
    <Switch>
      <Route path="/" exact component={Dashboard} />
      <Route path="/product" component={Product} />
      <Route path="/combo" component={Combo} />
      <Route path="/about" component={About} />
      <Route path="/configuration" component={Configuration} />
      <Route path="/user" component={UserAdministration} />
    </Switch>
  )
};

/*const Routes: React.FC = () => (
  <Switch>
    <Route path="/" exact component={Dashboard} />
    <Route path="/product" component={Product} />
    <Route path="/combo" component={Combo} />
    <Route path="/about" component={About} />
    <Route path="/configuration" component={Configuration} />
    <Route path="/user" component={UserAdministration} />
 
  </Switch>
);*/

export default Routes;
