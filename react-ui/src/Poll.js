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
            id: this.props.location.params.title,
            title: '',
            options: [],
            votecounts: {},
            selectedOption: '',
            customOption: '',
            showCustom: false
        }
    }
    componentWillMount = () => {
        this.getData();
    }
    getData = () => {
        // if(this.props.user !== ''){
        let url = '/api/displaypoll/'+this.state.id;
        axios.get(url).then((res) => {
            console.log('trigger');
            this.setState({
                title: res.data.title,
                options: res.data.options,
                votecounts: res.data.votecounts,
                selectedOption: res.data.options[0],
                loadedData: true
            });
            
        }).catch((err) => {
            console.log(err);
        });
        // }
    };
    handleChange = (e) => {
        let customState = false;
        if(e.target.value == 'Add custom option' || this.state.selectedOption == 'Add custom option'){
            customState = true;
        }

        let name = e.target.name;
        this.setState({
            [name]: e.target.value,
            showCustom: customState
        });
    }
    submitForm = (e) => {
        let postUrl = '/api/submitvote';
        e.preventDefault();
        axios.post(postUrl, {
            selectedOption: this.state.selectedOption,
            title: this.state.title
        }).then((res) => {
            if(res.data == 'Already voted'){
                alert('Already voted!');
            }
            else{
                this.getData();
            }
        }).catch((err) => {
            console.log(err)
        });
    }
    handleAddCustom = (e) => {
        e.preventDefault();
        //ajax to add new voting option to the polls data array
        axios.post('/api/addcustom', {
            title: this.state.title,
            option: this.state.customOption}).then((res) => {
                this.getData();
            }).catch((err) => {
                console.log(err)
            });
    }
    
    render() {
        if(this.state.loadedData){
            //Prepare dropdown options
            let selectOptions = this.state.options.map((option, i) => {
                return <option key={i} value={option}>{option}</option>
            });
            if(this.props.loggedIn){
                let custom = 'Add custom option';
                let key = selectOptions.length;
                selectOptions.push(<option key={key} value={custom}>{custom}</option>);
            }
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

        
            let customOption = <CustomOption 
                                    show={this.state.showCustom} 
                                    value={this.state.customOption} 
                                    onChange={this.handleChange}
                                    addCustom={this.handleAddCustom} />;
            let twitterText = 'Cast your vote for the poll "'+this.state.title+'" using the Voting App. https://blooming-waters-58260.herokuapp.com/polls/'+this.state.id;
            // let tweetie = 'https://twitter.com/intent/tweet?text='+twitterText;
            return(
                <div className='pollContainer'>
                    <div className='votePoll'>
                        <h2>{this.state.title}</h2>
                        Select your vote from the available options or add a custom option if logged in:<br/><br/>
                        <form onSubmit={this.submitForm}>
                            <select name='selectedOption' value={this.state.selectedOption} onChange={this.handleChange} style={{width: 200}}>
                                {selectOptions}
                            </select><br/><br/>
                            {customOption}
                            <button type='submit'className='submitNewBtn'>Submit Vote</button>
                        </form>
                        <h3>Results: </h3>
                        <Doughnut data={chartData} />
                        <a href="https://twitter.com/share" class="twitter-share-button" data-text={twitterText} data-show-count="false">Share this Poll</a><script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>
                    </div>
                </div>
            );
        }
        else{
            return <h1>Loading Data</h1>;
        }
    };
}

const CustomOption = (props) => {
    if(props.show){
        return (
            <div>
                Enter your custom option below: <br/>
                <input
                    type='text' 
                    name='customOption'
                    value={props.value}
                    onChange={props.onChange} /><br/>
                <button className='submitNewBtn' onClick={props.addCustom}>Add new option</button>
            </div>
        )
    }
    else{
        return null;
    }
}

export default Poll;

