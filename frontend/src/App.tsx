import React from "react";
import { Route, Switch, BrowserRouter as Router } from 'react-router-dom';
import { Greeter } from "./components/Greeter";
import { Playground } from "./pages/Playground";
export default function App() {
    return (
        <Router>
            <Switch>
                <Greeter></Greeter>
                <Route exact path='/Playground'><Playground/></Route>
            </Switch>
        </Router>
    )
}
