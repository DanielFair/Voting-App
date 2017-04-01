import React from 'react';
import './App.css';
import axios from 'axios';
import { Redirect } from 'react-router-dom';

class NewPoll extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            pollTitle: '',
            pollOptions: '',
            added: false
        };
    }
    handleChange = (e) => {
        let name = e.target.name;
        this.setState({
            [name]: e.target.value
        });
    }
    handleSubmit = (e) => {
        e.preventDefault();
        console.log('Submitted ', this.state.pollTitle+', '+this.state.pollOptions);
        axios.post('/api/addnew', {

            pollTitle: this.state.pollTitle,
            pollOptions: this.state.pollOptions,
            pollAuthor: this.props.user
        }).then((res) => {
            //setting state to true will trigger redirecting SPA to home
            console.log('redirecting!');
            this.setState({
                added: true
            });
        }).catch((err) =>{
            console.log(err);
        });
    }
    render(){
        console.log(this.props.user);
        // console.log('now login: ', this.props.user["login"]);
        // console.log('props: ', this.props.loggedIn);
        if(this.state.added){
            return(
                <Redirect to='/' />
            )
        }
        else if(!this.props.loggedIn){
            return(
                <div className='pollContainer'>
                    <div className='myPolls'>
                        <h2>Please <a href='http://localhost:5000/auth/github'>login</a> to access this page.</h2>
                    </div>
                </div>
            );
        }
        return(
            <div className='pollContainer'>
                <div className='newPoll'>
                    <form action='addnew' onSubmit={this.handleSubmit} method='POST'>
                        <h2>Add New Poll</h2>
                        Poll Title:<br/>
                        <input
                            type='text'
                            name='pollTitle' 
                            value={this.state.pollTitle} 
                            onChange={this.handleChange} 
                            id='pollTitleInput'/>
                        <br/><br/>
                        Poll Options: (1 on each line)<br/>
                        <textarea 
                            name='pollOptions' 
                            rows='6' 
                            value={this.state.pollOptions} 
                            onChange={this.handleChange} 
                            id='pollOptionsInput'/>
                        <br/><br/>
                        <button type='submit' className='submitNewBtn'>Submit Poll</button>
                    </form>
                </div>
            </div>
        );
    }
};

export default NewPoll;