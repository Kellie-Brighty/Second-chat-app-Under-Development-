import React, { Component } from 'react';
import TextField from '@material-ui/core/TextField';
import {withStyles, createStyles} from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import {Link} from 'react-router-dom';
import firebase from '../../services/Firebase';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import HomeIcon from '@material-ui/icons/Home';

import SigninString from '../Signin/SigninString';
import './signup.css'

const styles = theme => createStyles({
    root: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url("bg.jpg")',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        height: '100vh',
        overflowY: 'hidden'
    },
    signupBox: {
        backgroundColor: 'transparent',
        padding: '20px',
        margin: '30px auto',
        marginTop: '0px',
        width: '500px',
        textAlign: 'center'
    },
    textfield: {
        margin: '20px auto'
    },
    btn: {
        backgroundImage: 'linear-gradient(to left, #5b43c4, black)',
        border: 'none',
        padding: '10px 60px',
        fontWeight: 'bold',
        fontFamily: 'Trebuchet MS',
        color: 'white',
        outline: 'none',
        cursor: 'pointer',
        margin: '20px auto',
        borderRadius: '20px'
    },
    divider: {
        borderColor: 'white'
    },
    spinner: {
        position: 'absolute',
        color: 'white'
    }
})

const ValidationTextField = withStyles({
    root: {
      '& input:valid + fieldset': {
        borderColor: 'rgb(23, 240, 23)',
        borderWidth: 2,
        
      },
      '&:hover': {
        borderColor: 'blue',
      },
      '& input:invalid + fieldset': {
        borderColor: 'white',
        borderWidth: 2,
      },
      '& input:valid:focus + fieldset': {
        borderLeftWidth: 6,
        padding: '4px !important', // override inline-style
      },
    },
  })(TextField);

class Signup extends Component {
    constructor() {
        super()
        this.state = {
            name: '',
            email: '',
            password: '',
            error: '',
            loading: false
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    async handleSubmit(e){
        e.preventDefault();
        const {name, email, password} = this.state;
        this.setState({loading: true})
        await
            firebase.auth().createUserWithEmailAndPassword(email, password).then(async res => {
                firebase.firestore().collection('users').add({
                    name,
                    id: res.user.uid,
                    email,
                    password,
                    URL: '',
                    messages: [{notificationId: '', number: 0}],
                    description: '',
                    online: true,
                    typing: false
                }).then(ref => {
                    localStorage.setItem(SigninString.ID, res.user.uid);
                    localStorage.setItem(SigninString.Name, name);
                    localStorage.setItem(SigninString.Email, email);
                    localStorage.setItem(SigninString.Password, password);
                    localStorage.setItem(SigninString.PhotoURL, '');
                    localStorage.setItem(SigninString.UPLOAD_CHANGED, 'state_changed');
                    localStorage.setItem(SigninString.Description, '');
                    localStorage.setItem(SigninString.FirebaseDocumentId, ref.id);
                    localStorage.setItem(SigninString.online, true);
                    localStorage.setItem(SigninString.typing, false);
                    this.setState({
                        name: '',
                        email: '',
                        password: '',
                        url: '',
                        loading: false
                    });
                    this.props.history.push('/chat')
                }).catch(e => {
                    this.setState({
                        loading: false,
                        error: e
                    })
                })
            }).catch(e => {
                console.error(e);
                this.setState({
                    loading: false,
                })
                if(e.message === 'The email address is badly formatted.') {
                    this.setState({
                        error: 'No Name, Email or Password inputed Or Wrong email format.',
                    })
                }
                if(e.message === 'The email address is already in use by another account.') {
                    this.setState({
                        error: 'Email already exists.'
                    })
                }
                if(e.message === 'A network error (such as timeout, interrupted connection or unreachable host) has occurred.') {
                    this.setState({
                        error: 'Sorry. Something happened either on our server or from your end. Please check your network connection to be sure.'
                    })
                }
            })
    };

    render() {
        const {classes} = this.props;
        const {loading, error} = this.state;
        return (
            <div className={classes.root} >
                <div className={classes.signupBox} >
                    <form noValidate onSubmit={this.handleSubmit} >
                        <div >
                        <Link to='/' ><HomeIcon id='icon' color='primary' style={{marginBottom: '30px', fontSize: '30px',
                    padding: '10px', borderRadius: '50px', transition: '.5s'}} /></Link>
                        </div>
                        <div>
                    <Typography variant='h4' color='primary' style={{fontFamily: 'Trebuchet MS', fontWeight: 'bold', marginBottom: '30px'}} >It's cool having you here.</Typography>
                        </div>
                    <Typography variant='h4' style={{fontFamily: 'Trebuchet MS', color: 'white'}} >Sign Up</Typography>
                    <ValidationTextField type='text' name='name' value={this.state.name} onChange={this.handleChange} className={classes.textfield} required variant='outlined' label='Name' color='primary' fullWidth ></ValidationTextField>
                    <ValidationTextField type='email' name='email' value={this.state.email} onChange={this.handleChange} className={classes.textfield} required variant='outlined' label='Email' color='primary' fullWidth ></ValidationTextField>
                    <ValidationTextField type='password' name='password' value={this.state.password} onChange={this.handleChange} className={classes.textfield} required variant='outlined' label='Password' color='primary' fullWidth ></ValidationTextField>
                    <Typography variant='caption' style={{color: 'white'}} >Password must be at least 6 characters</Typography>
                    <div>
                    <Button
                     type='submit'
                     variant='contained' 
                     className={classes.btn}
                     disabled={loading}
                      >
                     Sign Up
                     {loading && (
                         <CircularProgress size={30} className={classes.spinner} color='primary' />
                     )}
                     </Button>
                    </div>
                    <div>
                        {error ? (
                            <p id='1' style={{color: 'red'}} >{error}</p>
                        ): ''}
                    </div>
                    <div>
                    <Divider className={classes.divider} />
                    <Typography variant='caption' style={{color: 'white'}} >Already have an account? <Link to='/signin' style={{color: 'black'}} >Sign In</Link></Typography>
                    </div>
                    </form>
                </div>
            </div>
        )
    }
}

export default withStyles(styles)(Signup);
