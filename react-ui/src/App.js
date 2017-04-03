import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Link} from 'react-router-dom';
import Home from './Home';
import NewPoll from './NewPoll';
import MyPolls from './MyPolls';
import Poll from './Poll';
import axios from 'axios';
import gitlogo from './gitlogo.png';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: false,
      user: '',
      avatar: ''
    };
  }
  getUser = () => {
    axios.get('/getuser').then((res) => {
      if(res.data._raw !== undefined && !this.state.loggedIn) {
        let avatarStr = JSON.stringify(res.data.photos[0].value).replace(/^"(.*)"$/, '$1');
        this.setState({
          loggedIn: true,
          user: res.data.username,
          avatar: avatarStr
        });
      }
      else if(res.data === 'No user!' && this.state.loggedIn) {
        this.setState({
          loggedIn: false,
          user: ''
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

    return(
      <Router>
        <div>
          <div>
            <TopBanner />
            <SideBar 
              loggedIn={this.state.loggedIn}
              updateData={this.getUser} 
              user={this.state.user} 
              avatar={this.state.avatar} />
          </div>

          <Route exact={true} path='/' component={Home}/>
          <Route path='/newpoll' component={() => (<NewPoll loggedIn={this.state.loggedIn} user={this.state.user} />)}/>
          <Route path='/polls/:title' component={(props) => (<Poll loggedIn={this.state.loggedIn} location={props.match} user={this.state.user} />)}/>
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
      <AccountControl 
        loggedIn={props.loggedIn} 
        updateData={props.updateData} 
        user={props.user} 
        avatar={props.avatar}/>
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
      <a href='/auth/github' style={{textDecoration: 'none'}}>
      <div className='sideBarTop'><br/>Login<br/> <img src={gitlogo} alt='logingithub' style={{margin: '5px'}}/>
      </div></a>
    );
  }
  else{
    return(
      <a href='/logout' style={{textDecoration: 'none'}}>
      <div className='sideBarTop'><img src={props.avatar} alt='Avatar' height='32' width='32'/><br />Welcome {props.user}!<br/>Logout
      </div></a>
    );
  }
}

export default App;
