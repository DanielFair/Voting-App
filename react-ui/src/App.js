import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Link} from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import NewPoll from './NewPoll';
import MyPolls from './MyPolls';
import Poll from './Poll';
import axios from 'axios';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: false,
      user: {},
      avatar: ''
    };
  }
  getUser = () => {
    axios.get('http://localhost:5000/getuser').then((res) => {
      console.log(res.data);
      if(res.data._raw !== undefined && !this.state.loggedIn) {
        this.setState({
          loggedIn: true,
          user: res.data.username,
          avatar: res.data.photos[0]
        });
      }
      else if(res.data === 'No user!' && this.state.loggedIn) {
        this.setState({
          loggedIn: false,
          user: {}
        });
      }
    }).catch((err) => {
      console.log(err);
    });
  }
  componentWillMount = () => {
    this.getUser();
  }
  render() {
    console.log('State logged in?: ', this.state.loggedIn);
    if(this.state.loggedIn){
      console.log(this.state.user);
    }
    //das boot
    return(
      <Router>
        <div>
          <div>
            <TopBanner />
            <SideBar loggedIn={this.state.loggedIn} updateData={this.getUser} user={this.state.user}/>
          </div>

          <Route exact={true} path='/' component={Home}/>
          <Route path='/login' component={Login}/>
          <Route path='/newpoll' component={() => (<NewPoll loggedIn={this.state.loggedIn} user={this.state.user} />)}/>
          <Route path='/polls/:title' component={Poll}/>
          <Route path='/mypolls' component={() => (<MyPolls loggedIn={this.state.loggedIn} user={this.state.user} />)}/>

        </div>
      </Router>
    );
  }
}

function TopBanner(props) {
  return (
    <Link to='/' id='titleLink'><div className='topBanner'>
      <h1>Voting App</h1>
    </div></Link>
  );
}
function SideBar(props) {

  return (
    <div className='sideBar'>
      <AccountControl loggedIn={props.loggedIn} updateData={props.updateData} user={props.user}/>
      <Link to='/newpoll' style={{textDecoration: 'none'}}><div className='newPollBtn'>
        New Poll
      </div></Link>
      <Link to='/mypolls' style={{textDecoration: 'none'}}><div className='myPollsBtn'>
        My Polls
      </div></Link>
     </div>
  );
}
function AccountControl(props){
    if(!props.loggedIn){
      return(
        <a href='http://localhost:5000/auth/github' style={{textDecoration: 'none'}}>
        <div className='sideBarTop'><br/>Login<br/> <img src='Github-Mark-32px.png' alt='logingithub' style={{margin: '5px'}}/>
        </div></a>
      );
    }
    else{
      return(
        <a href='http://localhost:5000/logout' style={{textDecoration: 'none'}}>
        <div className='sideBarTop'><br />Welcome {props.user.login}!<br/>Logout
        </div></a>
      );
    }
}

export default App;
