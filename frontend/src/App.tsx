import React from "react";
// import { Route, Switch, BrowserRouter as Router } from 'react-router-dom';
// import { Greeter } from "./components/Greeter";
import { Symfoni } from "./hardhat/SymfoniContext";
import { Playground } from "./pages/Playground";
export default function App() {
    return (
        <Symfoni autoInit={true} loadingComponent={<h1>Loading</h1>}>
            <Playground/>
        </Symfoni>
        
    )
}
