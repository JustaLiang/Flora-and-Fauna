import React from 'react';
import { Route, Switch, BrowserRouter as Router, } from 'react-router-dom';
import Home from './pages/Home';
import Factory from './pages/Factory';
import UploadPage from './pages/UploadPage';
import { Symfoni } from "./hardhat/SymfoniContext";

function App() {

  return (
    <Router>
      <Switch>
        <Symfoni autoInit={true} loadingComponent={<h1>Loading...</h1>}>
          <Route exact path='/'><Home /></Route>
          <Route exact path='/upload'><UploadPage /></Route>
          <Route exact path='/factory'>
            <Factory />
          </Route>
        </Symfoni>
      </Switch>
    </Router>
  );
}

export default App;
