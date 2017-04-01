import React from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './App.css';

class Home extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      polls: []
    };
  }
  componentWillMount = () => {
    this.getPolls();
  }
  getPolls = () => {
    axios.get('http://localhost:5000/api/displayPolls').then((res) => {
      this.setState({
        polls: res.data
      });
    }).catch((err) => {
      console.log(err);//dasaea
    });
  }
  render() {
    let pollList = this.state.polls.map((poll, i) => {
      return <PollDisplay pollTitle={poll.title} pollOptions={poll.options} key={i}/>
    });
    return (
      <div className='pollContainer'>
          <div className='pollList'>
              <h3 id='innerText'>List of all polls:</h3>
              {pollList}
          </div>
      </div>
    );
  }
}
const PollDisplay = (props) => {
  let linkTo = '/polls/'+props.pollTitle;
  return (
    <Link to={linkTo} style={{textDecoration: 'none'}}><div className='pollDisplay'>
      <h2>{props.pollTitle}</h2>
    </div></Link>
  );
}

export default Home;
