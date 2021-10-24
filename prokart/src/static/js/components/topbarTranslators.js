import React, {Component} from 'react';

class TopBarTranslators extends Component {
    clickTopButton = e => {
        if (e.target.innerHTML.trim() == "Start!") {
            window.location.href = "/languages";
        }
        else {
            window.location.reload();
        }
    }

    render() {
        let contents = JSON.parse(this.props.contents);

        var presentTranslator;
        if (contents.length > 0) {
            presentTranslator = (
                <div>
                    contents[0][2]
                    <span style={{fontWeight: "bold"}}>→</span>
                    contents[0][5]
                </div>
            );
        }
        else {
            presentTranslator = "Start!";
        }

        return (
            <div>
                <div id="sidebar-center-translator" className="sidebar-center-button" style={{cursor: "pointer"}} onClick={this.clickTopButton}>
                {presentTranslator}
                </div>
            </div>
        );
    }
}

export default TopBarTranslators;
