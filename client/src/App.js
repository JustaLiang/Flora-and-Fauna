import React from "react";
import { Route, Switch, BrowserRouter as Router, } from 'react-router-dom';
import Factory from './pages/Factory'
import Prototype from './Prototype'
import Home from './pages/Home'
import Battlefield from "./pages/Battlefield";
import BattlefieldNew from "./pages/BattlefieldNew";
export default function App() {
    return (
        <Router>
            <Switch>
                <Route exact path='/'><Home/></Route>
                <Route exact path='/Battlefield'><Battlefield/></Route>
                <Route exact path='/BattlefieldNew'><BattlefieldNew/></Route>
                <Route exact path='/Factory'><Factory /></Route>
                <Route exact path='/Prototype'><Prototype /></Route>
            </Switch>
        </Router>
    )
}
