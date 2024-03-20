// src/AppRouter.js
import React from 'react';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Home from './components/pages/Home';
import Grid from './components/pages/Grid';
import Command from './components/pages/Command';
import Layout from "./Layout";

const  AppRouter = () => {

    console.log("rendering AppRouter.js")

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="/grid" element={<Grid />} />
                    <Route path="/command" element={<Command/>}/>
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;