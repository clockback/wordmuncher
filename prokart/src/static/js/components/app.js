import React, {Component} from 'react';
import {Link, Switch, Route} from 'react-router-dom';

import TopBar from './topbar.js';
import MainPage from './mainPage.js';
import LanguagesPage from './languagesPage.js';
import CreatePage from './createPage.js';
import '../../css/general.css';
import '../../css/desktop.css';


class App extends Component {
    render() {
        return (
            <React.StrictMode>
                <TopBar />
                <Switch>
                    <Route exact path='/' component={MainPage}></Route>
                    <Route exact path='/languages' component={LanguagesPage}></Route>
                    <Route exact path='/create' component={CreatePage}></Route>
                </Switch>
            </React.StrictMode>
        );
    }
}

export default App;
