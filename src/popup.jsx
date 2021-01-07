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

        if (target.checked && !proxiedSites.includes(target.value)) {
            proxiedSites.push(target.value);
        } else if (!target.checked && proxiedSites.includes(target.value)) {
            proxiedSites = proxiedSites.filter(e => e !== target.value);
        }

        this.setState({ proxiedSites: proxiedSites }, () => {
            chrome.storage.local.set({ proxiedSites: proxiedSites });
        });
    }

    renderVisitedSites() {
        if (!this.state.visitedSites.length) {
            return;
        }

        return (
            <div class="divide-y">
                {
                    this.state.visitedSites.map((host, index) => (
                        <div key={index}>
                            <label class="row">
                                <span class="col">{host}</span>
                                <span class="col-auto">
                                    <label class="form-check form-check-single form-switch">
                                        <input class="form-check-input" type="checkbox" checked={this.state.proxiedSites.includes(host)} value={host} onClick={this.addOrRemoveHost.bind(this)} />
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
                    <div class="card-header d-flex">
                        <h3 class="card-title">Add a site to the list</h3>
                        <a class="btn btn-sm ml-auto" href="javascript:void(0)" onClick={this.clearVisitedSites.bind(this)}>
                            Clear visited sites
                        </a>
                    </div>
                    <div class="card-body">
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