import React, {Component} from 'react';


class TopBarTranslators extends Component {
    render() {
        let contents = JSON.parse(this.props.contents);

        var sidebarCenterTranslator;
        if (contents.length > 0) {
            sidebarCenterTranslator = (
                <div>
                    contents[0][2]
                    <span style={{fontWeight: "bold"}}>→</span>
                    contents[0][5]
                </div>
            );
        }
        else {
            sidebarCenterTranslator = "Start!";
        }

        return (
            <div>
                <div id="sidebar-center-translator" className="sidebar-center-button" style={{cursor: "pointer"}}>
                {sidebarCenterTranslator}
                </div>
            </div>
        );
    }
}

export default TopBarTranslators;
