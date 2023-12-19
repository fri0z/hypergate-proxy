import React, { Component } from "react";
import ReactDOM from "react-dom";

import './css/tabler.css';
import './css/popup.css';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            visitedSites: [],
            proxiedSites: [],
        };
    }

    componentDidMount() {
        chrome.storage.local.get(['proxiedSites'], ({ proxiedSites }) => {
            this.setState({ proxiedSites: proxiedSites ?? [] })
        });

        chrome.storage.local.get(['visitedSites'], ({ visitedSites }) => {
            this.setState({ visitedSites: visitedSites ?? this.state.proxiedSites })
        });

    }

    clearVisitedSites(event) {
        event.preventDefault();

        this.setState({ visitedSites: this.state.proxiedSites }, () => {
            chrome.storage.local.set({ visitedSites: this.state.proxiedSites });
        });
    }

    addOrRemoveHost({ target }) {
        let { proxiedSites } = this.state;

        if (target.checked) {
            proxiedSites.push(target.value);
        } else {
            proxiedSites = proxiedSites.filter(e => e !== target.value);
        }

        this.setState({ proxiedSites: proxiedSites }, () => {
            chrome.storage.local.set({ proxiedSites: proxiedSites });
            chrome.runtime.sendMessage({ action: 'updateProxySettings' });
        });
    }

    renderVisitedSites() {
        const { visitedSites } = this.state;

        return (
            <div className="divide-y">
                {
                    visitedSites.sort().map((host, index) => (
                        <div key={index}>
                            <label className="row">
                                <span className="col">{host}</span>
                                <span className="col-auto">
                                    <label className="form-check form-check-single form-switch">
                                        <input className="form-check-input" type="checkbox" checked={this.state.proxiedSites.includes(host)} value={host} onClick={this.addOrRemoveHost.bind(this)} />
                                    </label>
                                </span>
                            </label>
                        </div>
                    ))
                }
            </div>
        );
    }

    render() {
        return (
            <div className="browser-action">
                <div className="card border-0">
                    <div className="card-header d-flex">
                        <h3 className="card-title">Add a site to the list</h3>
                        <a className="btn btn-sm ml-auto" href="#" onClick={this.clearVisitedSites.bind(this)}>
                            Clear visited sites
                        </a>
                    </div>
                    <div className="card-body">
                        {this.renderVisitedSites()}
                    </div>
                </div>
            </div>
        );
    }
}

ReactDOM.render(
    <App />, document.getElementById('popup-container')
);
