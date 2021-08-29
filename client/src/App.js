import React from "react";
import { Route, Switch, BrowserRouter as Router, } from 'react-router-dom';
import Factory from './pages/Factory'
import Prototype from './Prototype'
import Home from './pages/Home'
import BattlefieldOld from "./pages/Playground";
import Playground from "./pages/Playground";
export default function App() {
    return (
        <Router>
            <Switch>
                <Route exact path='/'><Home/></Route>
                <Route exact path='/BattlefieldOld'><BattlefieldOld/></Route>
                <Route exact path='/Playground'><Playground/></Route>
                <Route exact path='/Factory'><Factory /></Route>
                <Route exact path='/Prototype'><Prototype /></Route>
            </Switch>
        </Router>
    )
}
