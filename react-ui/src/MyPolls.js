import React from 'react';
import {Link} from 'react-router-dom';
import axios from 'axios';

class MyPolls extends React.Component{
    // let myPolls = props.userPolls;dS 
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
        axios.get('/api/displaymypolls', {username: this.props.user}).then((res) => {
            console.log(res);
            this.setState({
                loaded: true,
                myPolls: res.data
            })
        }).catch((err) => {
            if(err)console.log(err);
        });
    }
    render() {
        console.log('better yet lets check state: ', this.state.myPolls);
        let myPolls = this.state.myPolls.map((poll, i) => {
            console.log(poll);
            return <MyPollDisplay pollTitle={poll.title} pollOptions={poll.options} key={i}/>;
        })
        if(this.props.loggedIn && this.state.loaded){
            console.log('dwgh');
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
  let linkTo = '/polls/'+props.pollTitle;
  return (
    <Link to={linkTo} style={{textDecoration: 'none'}}><div className='pollDisplay'>
      <h2>{props.pollTitle}</h2>
    </div></Link>
  );
}
export default MyPolls;