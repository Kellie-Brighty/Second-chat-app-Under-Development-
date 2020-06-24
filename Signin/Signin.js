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
import './signin.css'

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
        margin: '50px auto',
        marginTop: '0px',
        width: '500px',
        textAlign: 'center'
    },
    textfield: {
        margin: '20px auto',
        borderColor: 'white'
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

class Signin extends Component {
    constructor() {
        super()
        this.state = {
            email: '',
            password: '',
            error: '',
            loading: false,
            status: ''
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        this.currentUserDocumentId = localStorage.getItem(SigninString.FirebaseDocumentId);;
    }

    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    componentDidMount() {
        if(localStorage.getItem(SigninString.ID)) {
            this.setState({loading: false}, () => {
                this.setState({loading: false, status: 'online'})
                this.props.showToast(1, 'Sign In Success.')
                this.props.history.push('/chat')
            })
        }else{
            this.setState({
                loading: false,
                status: 'offline'
            })
        }
    }

    async handleSubmit(e){
        e.preventDefault();
        const {email, password} = this.state;
        this.setState({loading: true})

        await firebase.auth().signInWithEmailAndPassword(email, password).then(async res => {
            let user = res.user;
            if(user) {
                await firebase.firestore().collection('users').where('id', '==', user.uid).get()
                .then((querySnapshot)=> {
                    querySnapshot.forEach(doc => {
                        const currentData = doc.data();
                        localStorage.setItem(SigninString.FirebaseDocumentId, doc.id)
                        localStorage.setItem(SigninString.ID, currentData.id)
                        localStorage.setItem(SigninString.Name, currentData.name)
                        localStorage.setItem(SigninString.Email, currentData.email)
                        localStorage.setItem(SigninString.Password, currentData.password)
                        localStorage.setItem(SigninString.PhotoURL, currentData.URL)
                        localStorage.setItem(SigninString.Description, currentData.description)
                        firebase.firestore().collection('users').doc(localStorage.getItem(SigninString.FirebaseDocumentId)).update({online: true}).then(() => {
                            this.setState({status: 'online'})
                        })
                        firebase.firestore().collection('users').doc(localStorage.getItem(SigninString.FirebaseDocumentId)).update({typing: false}).then(() => {
                            return;
                        })
                        localStorage.setItem(SigninString.online, currentData.online)
                        localStorage.setItem(SigninString.typing, currentData.typing)
                    })
                   
                })
            }
            this.props.history.push('/chat')
        })
        .catch(e => {
            console.error(e);
            this.setState({
                loading: false
            })
            if(e.message === 'The email address is badly formatted.') {
                this.setState({
                    error: 'Email not accepted. Please input a valid address.',
                })
            }
            if(e.message === 'The password is invalid or the user does not have a password.') {
                this.setState({
                    error: 'Wrong password/No password inputed.'
                })
            }
            if(e.message === 'There is no user record corresponding to this identifier. The user may have been deleted.') {
                this.setState({
                    error: 'No account of this user is recorded.'
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
                    <Typography variant='h4' color='primary' style={{fontFamily: 'Trebuchet MS', fontWeight: 'bold', marginBottom: '30px'}} >Welcome Back.</Typography>
                        </div>
                    <Typography variant='h4' style={{fontFamily: 'Trebuchet MS', color: 'white'}} >Sign In</Typography>
                    <ValidationTextField type='email' name='email' value={this.state.email} onChange={this.handleChange} className={classes.textfield} required variant='outlined' label='Email' color='primary' fullWidth ></ValidationTextField>
                    <ValidationTextField type='password' name='password' value={this.state.password} onChange={this.handleChange} className={classes.textfield} required variant='outlined' label='Password' color='primary' fullWidth ></ValidationTextField>
                    <div>
                    <Button
                     type='submit'
                     variant='contained' 
                     className={classes.btn}
                     disabled={loading}
                      >
                     Sign In
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
                    <Typography variant='caption' style={{color: 'white'}} >Do not have an account? <Link to='/signup' style={{color: 'black'}} >Sign Up</Link></Typography>
                    </div>
                    </form>
                </div>
            </div>
        )
    }
}

export default withStyles(styles)(Signin);
