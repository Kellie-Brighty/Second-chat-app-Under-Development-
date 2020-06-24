import React, {Component} from 'react';
import {BrowserRouter as Router, Route, Redirect, Switch} from 'react-router-dom';
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {ThemeProvider as MuiThemeProvider} from '@material-ui/core';
import {createMuiTheme} from '@material-ui/core/styles';
import {withStyles, createStyles} from '@material-ui/core/styles';
import Hidden from '@material-ui/core/Hidden';

import Home from './pages/Home/Home';
import Chat from './pages/Chat/Chat';
import Profile from './pages/Profile/Profile';
import Signup from './pages/Signup/Signup';
import Signin from './pages/Signin/Signin';
import About from './pages/About/About';
import firebase from './services/Firebase';



import './App.css';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#392493'
    },
    secondary: {
      main: '#F6C31E'
    }
  }
});

const styles = theme => createStyles({
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '100px',
    textAlign: 'center',
  },
  loadingText: {
     fontWeight: 'bold',
     fontFamily: 'Trebuchet MS' 
  }
})


class App extends Component {

  showToast = (type, message) => {
    switch(type) {
      case 0: 
      toast.warning(message);
      break;
      case 1:
        toast.success(message);
        break;
        default:
          break;
    }
  }

  constructor() {
    super()
    this.state = {
      authenticated: false,
      loading: true
    }
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if(user){
        this.setState({
          authenticated: true,
          loading: false
        })
      }else {
        this.setState({
          authenticated: false,
          loading: true
        })
      }
    })
  }

  render() {
    const {classes} = this.props;
    return(
      <MuiThemeProvider theme={theme} >
        <Hidden smDown>
        <Router>
        <ToastContainer
        autoClose={3000}
        hideProgressBar={true}
        position={toast.POSITION.TOP_CENTER}
        />
          <Switch>
            <Route exact path='/' component={Home} />
            <Route exact path='/signin' render = {props => <Signin showToast={this.showToast} {...props}/>} />
            <Route exact path='/signup' render = {props => <Signup showToast={this.showToast} {...props}/>} />
            <Route exact path='/profile' render = {props => <Profile showToast={this.showToast} {...props}/>} />
            <Route exact path='/chat' render = {props => <Chat showToast={this.showToast} {...props}/>} />
            <Route exact path='/about' render = {props => <About showToast={this.showToast} {...props}/>} />
          </Switch>
        </Router>
        </Hidden>
        <Hidden mdUp>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}} >
            <p>Device not supported</p>
          </div>
        </Hidden>
      </MuiThemeProvider>
    )
  }
}

export default withStyles(styles)(App);

// render = {props => <Home {...props}/>}