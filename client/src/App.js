import React from "react";
import { Route, Switch, BrowserRouter as Router, } from 'react-router-dom';
import Factory from './pages/Factory'
import Prototype from './Prototype'
import Home from './pages/Home'
import Battlefield from "./pages/Battlefield";
export default function App() {
    return (
        <Router>
            <Switch>
                <Route exact path='/'><Home/></Route>
                <Route exact path='/Battlefield'><Battlefield/></Route>
                <Route exact path='/Factory'><Factory /></Route>
                <Route exact path='/Prototype'><Prototype /></Route>
            </Switch>
        </Router>
    )
}
