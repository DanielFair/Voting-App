import React from 'react';
import {Link} from 'react-router-dom';
import axios from 'axios';

class MyPolls extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            loaded: false,
            myPolls: []
        };
    }
    componentWillMount = () => {
        this.getMyPolls();
    };
    getMyPolls = () => {
        if(this.props.user !== ''){
            axios.post('/api/displaymypolls', {'username': this.props.user}).then((res) => {
                this.setState({
                    loaded: true,
                    myPolls: res.data
                })
            }).catch((err) => {
                if(err)console.log(err);
            });
        }
    }
    deletePoll = (title) => {
        let deleteUrl = '/api/delete/'+title;
        axios.delete(deleteUrl).then((res) => {
            this.getMyPolls();
        }).catch((err) => {
            console.log(err);
        });
    }
    render() {
        let myPolls = this.state.myPolls.map((poll, i) => {
            return (
                <div key={i}>
                    <MyPollDisplay 
                        pollTitle={poll.title} 
                        pollId={poll._id}
                        pollOptions={poll.options} 
                        handleDelete={this.deletePoll} />
                    <button className='submitNewBtn' onClick={() => {this.deletePoll(poll.title)}}>Delete Poll</button>
                </div>
            );
        })
        if(this.props.loggedIn && this.state.loaded){
            return(
                <div className='pollContainer'>
                    <div className='myPolls'>
                        <h2>My Polls</h2>
                        {myPolls}
                    </div>
                </div>
            )
        }
        return (
            <div className='pollContainer'>
                <div className='myPolls'>
                    <h2>Please <a href='http://localhost:5000/auth/github'>login</a> to access this page.</h2>
                </div>
            </div>
        )
    }
}
const MyPollDisplay = (props) => {
  let linkTo = '/polls/'+props.pollId;
  return (
    <Link to={linkTo} style={{textDecoration: 'none'}}><div className='pollDisplay'>
      <h2>{props.pollTitle}</h2>
    </div></Link>
  );
}
export default MyPolls;