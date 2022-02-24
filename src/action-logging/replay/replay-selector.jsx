import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import styles from './replay-selector.css';
import VM from 'scratch-vm';

const endpointToken = 'YOUR_TOKEN';

class ReplaySelector extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            taskId: 'word',
            userId: '',
            lastTimestamp: 0,
            lastAction: ''
        };
        this.handleTaskChange = this.handleTaskChange.bind(this);
        this.handleUserChange = this.handleUserChange.bind(this);
        this.handleGetFirst = this.handleGetFirst.bind(this);
        this.handleGetLast = this.handleGetLast.bind(this);
        this.handleGetNext = this.handleGetNext.bind(this);
        this.handleGetPrevious = this.handleGetPrevious.bind(this);
    }

    componentDidMount () {
    }

    componentWillUnmount () {
    }

    handleTaskChange = event => {
        this.setState({taskId: event.target.value});
    }

    handleUserChange = event => {
        this.setState({userId: event.target.value});
    }

    handleGetFirst () {
        this.getCodeState('first');
    }

    handleGetLast () {
        this.getCodeState('last');
    }

    handleGetNext () {
        this.getCodeState('next');
    }

    handleGetPrevious () {
        this.getCodeState('previous');
    }

    getCodeState (operation) {
        if (!operation) return;

        const baseUrl = 'http://localhost:8080/actionlog/';
        let fullUrl;
        if (operation === 'first' || operation === 'last' || operation === 'next' || operation === 'previous') {
            fullUrl = baseUrl + operation;
        } else {
            return;
        }
        const params = {
            taskId: this.state.taskId,
            userId: this.state.userId,
            timestamp: this.state.lastTimestamp
        };
        const headers = {
            Authorization: `Basic ${endpointToken}`
        };
        axios.get(fullUrl, {
            params: params,
            headers: headers
        })
            .then(response => {
                const actionlog = response.data.actionlog;
                if (!actionlog) return;
                this.setState({
                    lastTimestamp: actionlog.timestamp,
                    lastAction: actionlog.type
                });
                this.loadCodeState(actionlog);
                console.log(actionlog);
            })
            .catch(err => {
                console.log(err);
            });
    }

    loadCodeState (actionlog) {
        const json = actionlog.codeState?.json;
        if (!json) return;
        this.props.vm.loadProject(json);
    }

    render () {
        return (
            <React.Fragment>
                <div className={styles.flexboxrow}>
                    <label>
                        {'task:'}
                        <input
                            type="text"
                            value={this.state.taskId}
                            onChange={this.handleTaskChange}
                        />
                    </label>
                    <label>
                        {'UserId:'}
                        <input
                            type="text"
                            value={this.state.userId}
                            onChange={this.handleUserChange}
                        />
                    </label>
                    <button onClick={this.handleGetFirst}>
                        {'First'}
                    </button>
                    <button onClick={this.handleGetLast}>
                        {'Last'}
                    </button>
                    <button onClick={this.handleGetNext}>
                        {'Next'}
                    </button>
                    <button onClick={this.handleGetPrevious}>
                        {'Prev'}
                    </button>
                    <label className={styles.lastactionlabel}>
                        {`action: ${this.state.lastAction}`}
                    </label>
                </div>
            </React.Fragment>
        );
    }
}

ReplaySelector.propTypes = {
    vm: PropTypes.instanceOf(VM).isRequired
};

export default ReplaySelector;
