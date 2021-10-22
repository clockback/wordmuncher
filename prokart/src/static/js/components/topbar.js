import React, {Component} from 'react';

import '../../css/general.css';
import logoDark from '../../images/logo-dark.svg';



class TopBar extends Component {
    render() {
        return (
            <div>
                <div id="sidebar-left" className="sidebar-left">
                    <div id="sidebar-left-home" tabIndex="0">
                        <img style={{width: "40px", height: "40px"}} src={logoDark}/>
                    </div>
                </div>
                <div id="sidebar-center" className="sidebar-center">
                    <div id="sidebar-center-translator" className="sidebar-center-button" style={{cursor: "pointer"}}>
                    </div>
                </div>
            </div>
        );
    }
}

export default TopBar;
