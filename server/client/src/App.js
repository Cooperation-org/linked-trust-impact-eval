import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { apiResponse: "" };
    this.state = { apiBacalhauResponse: "" };

}



async componentWillMount() {
  fetch("http://localhost:9000/")
      .then(res => res.text())
      .then(res => this.setState({ apiBacalhauResponse: "Fetching Merkle Root from bacalhau. Please Wait." }));

      let completedJobsArray =  ["1000","QmSCMeGh17KJWA9VHPftWqA1xdWM7McVtt3azxH3aenp1X", "QmZhCRWWv8x6zJKhUKwnDNzerWoUaAjyeD4aSY8tGz6qE4", "QmT3sHvzDBV53WqY2Z2Gt5U9zFPZYHKHMSKghbbkxt3zsM"];

      let queryData = {completedJobsArray};

          const settings = {
            method: 'post',
            headers: { 'Content-Type': 'application/json; charset=utf-8'},
            body: JSON.stringify(queryData)
          };

          try {
            await fetch(`http://localhost:9000/bacalhau`, settings)
            .then(res => res.text())
            .then(res => this.setState({ apiBacalhauResponse: res }));
          } catch (error) {
            console.error("error: ", error);
          }
    }

render() {
  return (
    <div className="App">
    <header className="App-header">
    <img src={logo} className="App-logo" alt="logo" />
    <p>
    Edit <code>src/App.js</code> and save to reload.
    </p>
    <a
    className="App-link"
    href="https://reactjs.org"
    target="_blank"
    rel="noopener noreferrer"
    >
    Learn React
    </a>
    <p>{this.state.apiResponse}</p>
    <p>{this.state.apiBacalhauResponse}</p>
    </header>
    </div>
  );
  }
}

export default App;
