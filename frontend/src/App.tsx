import React from 'react';
import { Route, Switch, BrowserRouter as Router, } from 'react-router-dom';
import Home from './pages/Home';
import Factory from './pages/Factory';
import { Playground } from "./pages/Playground";
import Admin from "./pages/Admin";
import { Symfoni } from "./hardhat/SymfoniContext";

function App() {

  return (
    <Router>
      <Switch>
        <Symfoni autoInit={true} loadingComponent={<h1>Loading...</h1>}>
          <Route exact path='/'><Home /></Route>
          <Route exact path='/factory'><Factory /></Route>
          <Route exact path='/playground'><Playground /></Route>
          <Route exact path='/admin'><Admin /></Route>
        </Symfoni>
      </Switch>
    </Router>
  );
}

export default App;
