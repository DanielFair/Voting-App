import React from 'react';
import axios from 'axios';
import Chart from 'chart.js';
Chart.defaults.global.defaultFontColor = "white";
import {Doughnut} from 'react-chartjs-2';
// import { defaults } from 'react-chartjs-2';

class Poll extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loadedData: false,
            title: this.props.match.params.title,
            options: [],
            votecounts: {},
            selectedOption: ''
        }
    }
    componentWillMount = () => {
        this.getData();
    }
    getData = () => {
        let url = 'http://localhost:5000/api/displaypoll/'+this.state.title;
        axios.get(url).then((res) => {
            this.setState({
                loadedData: true,
                options: res.data.options,
                votecounts: res.data.votecounts,
                selectedOption: res.data.options[0]
            });
            
        }).catch((err) => {
            console.log(err);
        });
    };
    handleChange = (e) => {
        this.setState({
            selectedOption: e.target.value
        });
    }
    submitForm = (e) => {
        let postUrl = '/api/submitvote/'+this.state.title;
        e.preventDefault();
        console.log('Submitted '+this.state.selectedOption);
        axios.post(postUrl, {selectedOption: this.state.selectedOption}).then((res) => {
            this.getData();
        });
    }
    render() {
        if(this.state.loadedData){
            //Prepare dropdown options
            let selectOptions = this.state.options.map((option, i) => {
                return <option key={i} value={option}>{option}</option>
            });
            //Prepare chart data            
            let voteArr = this.state.options.map((option) => {
                return this.state.votecounts[option];
            });

            let chartData = {
                labels: this.state.options,
                datasets: [
                    {
                        data: voteArr,
                        backgroundColor: [
                            '#B30000',
                            'Ivory',
                            'Darkgreen',
                            'Peru',
                            'Royalblue'
                        ],
                        hoverBackgroundColor: [
                            '#B30000',
                            'Ivory',
                            'Darkgreen',
                            'Peru',
                            'Royalblue'
                        ]
                }]
            };

            return(
                <div className='pollContainer'>
                    <div className='votePoll'>
                        <h2>{this.state.title}</h2>
                        Select your vote from the available options or add a custom option if logged in:<br/><br/>
                        <form onSubmit={this.submitForm}>
                            <select name='voteselection' value={this.state.selectedOption} onChange={this.handleChange} style={{width: 200}}>
                                {selectOptions}
                            </select><br/><br/>
                            <button type='submit'className='submitNewBtn'>Submit Vote</button>
                        </form>
                        <h3>Results: </h3>
                        <Doughnut data={chartData} />
                    </div>
                </div>
            );
        }
        else{
            return <h1>Loading Data</h1>;
        }
    };
}

export default Poll;

