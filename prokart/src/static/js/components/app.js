import React, {Component} from 'react';
import {Link, Switch, Route} from 'react-router-dom';

import TopBar from './topbar.js';
import MainPage from './mainPage.js';
import LanguagesPage from './languagesPage.js';


class App extends Component {
    render() {
        return (
            <div>
                <TopBar />
                <div>
                    <Switch>
                        <Route exact path='/' component={MainPage}></Route>
                        <Route exact path='/languages' component={LanguagesPage}></Route>
                    </Switch>
                </div>
            </div>
        );
    }
}

export default App;
