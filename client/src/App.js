import React from "react";
import { Route, Switch, BrowserRouter as Router, } from 'react-router-dom';
import Dapp from './pages/Dapp'
import Prototype from './Prototype'
import Home from './pages/Home'
export default function App() {
    return (
        <Router>
            <Switch>
                <Route exact path='/'><Home/></Route>
                <Route exact path='/Dapp'><Dapp /></Route>
                <Route exact path='/Prototype'><Prototype /></Route>
            </Switch>
        </Router>
    )
}
