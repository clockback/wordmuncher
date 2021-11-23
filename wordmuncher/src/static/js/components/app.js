import React, {Component} from 'react';
import {Link, Switch, Route} from 'react-router-dom';

import TopBar from './topbar.js';
import MainPage from './mainPage.js';
import LanguagesPage from './languagesPage.js';
import CreatePage from './createPage.js';
import TestPage from './testPage.js';
import TestSheetPage from './testSheetPage.js';
import ResultsPage from './resultsPage.js';
import '../../css/general.css';
import '../../css/desktop.css';


class App extends Component {
    render() {
        return (
            <React.StrictMode>
                <Switch>
                    <Route exact path='/' component={TopBar}></Route>
                    <Route exact path='/languages' component={TopBar}></Route>
                    <Route exact path='/create' component={TopBar}></Route>
                    <Route exact path='/test' component={TopBar}></Route>
                    <Route exact path='/results' component={TopBar}></Route>
                </Switch>
                <Switch>
                    <Route exact path='/' component={MainPage}></Route>
                    <Route exact path='/languages' component={LanguagesPage}></Route>
                    <Route exact path='/create' component={CreatePage}></Route>
                    <Route exact path='/test' component={TestPage}></Route>
                    <Route exact path='/test-sheet' component={TestSheetPage}></Route>
                    <Route exact path='/results' component={ResultsPage}></Route>
                </Switch>
            </React.StrictMode>
        );
    }
}

export default App;
