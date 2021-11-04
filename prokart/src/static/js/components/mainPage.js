import React, {Component} from 'react';

import logoFull from '../../images/logo-full.svg';
import Footer from './footer.js';


class MainPage extends Component {
    onClickTest = () => {
        window.location.href = '/test';
    };

    onClickCreate = () => {
        window.location.href = '/create';
    };

    render() {
        return (
            <div>
                <div className="main" tabIndex="-1">
                    <div style={{top: "0", width: "100%", textAlign: "center"}}>
                        <img style={{width: "216.448px", height: "80px", marginTop: "40px"}} src={logoFull}/>
                        <h2>A Language-Learning Tool</h2>
                    </div>
                    <div style={{textAlign: "center"}}>
                        <button id="test-button" className="button" onClick={this.onClickTest}>Test</button>
                        <button  id="create-button" className="button" onClick={this.onClickCreate}>Create</button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }
}

export default MainPage;
