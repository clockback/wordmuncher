import React, {Component} from 'react';


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
                <div className="main">
                    <div style={{top: "0", width: "100%", textAlign: "center"}}>
                        <img style={{width: "216.448px", height: "80px", marginTop: "40px"}} src="./prokart/src/static/images/logo-full.svg"/>
                        <h2>A Language-Learning Tool</h2>
                    </div>
                    <div style={{textAlign: "center"}}>
                        <button id="test-button" className="button" onClick={this.onClickTest}>Test</button>
                        <button  id="create-button" className="button" onClick={this.onClickCreate}>Create</button>
                    </div>
                </div>
                <footer>
                    <div>Copyright © 2021 – Elliot Paton-Simpson</div>
                </footer>
            </div>
        );
    }
}

export default MainPage;
