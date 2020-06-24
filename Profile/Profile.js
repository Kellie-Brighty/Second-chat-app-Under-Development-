import React, { Component } from 'react';
import firebase from '../../services/Firebase';
import SigninString from '../Signin/SigninString';
import {withStyles, createStyles} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import {Link} from 'react-router-dom';
import Avatar from '@material-ui/core/Avatar';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

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
    back: {
       marginLeft: '150px'
    },
    profile: {
        [theme.breakpoints.down('sm')]: {
            width: '90%',
            marginTop: '20px',
            backgroundColor: 'transparent',
            boxShadow: '0 0 5px 0 rgba(0, 0, 0, 0.37)',
        },
        backgroundColor: 'white',
        padding: '20px 0px',
        margin: '10px auto',
        marginTop: '-50px',
        width: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '20px'
    },
    avatar: {
        [theme.breakpoints.down('sm')]: {
            width: '100px',
            height: '100px',
        },
        width: '150px',
        height: '150px',
        marginBottom: '20px',
        margin: '10px auto'
    },
    input: {
        position: 'absolute',
        width: '40px',
        height: '40px',
        left: '0px',
        outline: '0',
        zIndex: '-1',
        opacity: 1
    },
    loading: {
        position: 'absolute'
    }
})

class Profile extends Component {
    constructor() {
        super()
        this.state = {
            loading: false,
            documentKey: localStorage.getItem(SigninString.FirebaseDocumentId),
            id: localStorage.getItem(SigninString.ID),
            name: localStorage.getItem(SigninString.Name),
            aboutMe: localStorage.getItem(SigninString.Description),
            photoUrl: localStorage.getItem(SigninString.PhotoURL),
        }
        this.newPhoto = null
        this.newPhotoUrl = ''
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleImageChange = this.handleImageChange.bind(this);
        this.uploadImage = this.uploadImage.bind(this);
        this.updateUserInfo = this.updateUserInfo.bind(this);
    }

    componentDidMount() {
        if(!localStorage.getItem(SigninString.ID)) {
            this.props.history.push('/')
        }
    }

    handleInputChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    handleImageChange = (e) => {
        if(e.target.files && e.target.files[0]) {
            const prefixFileType = e.target.files[0].type.toString();
            if(prefixFileType.indexOf(SigninString.PREFIX_IMAGE) !== 0 ) {
                this.props.showToast(0, 'This file is not an image.')
                return
            }
            this.newPhoto = e.target.files[0];
            this.setState({
                photoUrl: URL.createObjectURL(e.target.files[0])  
            })
        }else{
            this.props.showToast(0, 'Something went wrong with the file upload.')
        }
    }
    
    uploadImage = () => {
        this.setState({
            loading: true
        })
        if(this.newPhoto){
            const uploadTask = firebase.storage().ref().child(this.state.id).put(this.newPhoto);
            uploadTask.on(SigninString.UPLOAD_CHANGED, null, err => {
                this.setState({loading: false})
                this.props.showToast(0, err.message)
            },
            () => {
                uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
                    this.updateUserInfo(true, downloadURL)
                })
            }
            )
        }else{
            this.updateUserInfo(false, null)
        }
    }

    updateUserInfo = (updatedPhotoURL, downloadURL) => {
        let newinfo
        if(updatedPhotoURL) {
            newinfo = {
                name: this.state.name,
                description: this.state.aboutMe,
                URL: downloadURL
            }
        }else {
            newinfo = {
                name: this.state.name,
                description: this.state.aboutMe,
            }
        }
        firebase.firestore().collection('users').doc(this.state.documentKey).update(newinfo).then(data => {
            localStorage.setItem(SigninString.Name, this.state.name);
            localStorage.setItem(SigninString.Description, this.state.aboutMe);
            if(updatedPhotoURL) {
                localStorage.setItem(SigninString.PhotoURL, downloadURL)
            }
            this.setState({
                loading: false
            })
            this.props.showToast(1, 'Profile updated successfully.')
        })
    }

    render() {
        const {classes} = this.props;
        const {photoUrl, name, aboutMe, loading} = this.state;
        return (
            <div className={classes.root} >
               <AppBar position='fixed' style={{backgroundColor: 'transparent', boxShadow: 'none'}} >
                   <Toolbar>
                       <Link to='/chat' className={classes.back} >
                        <ArrowBackIcon style={{color: 'white'}}/>
                       </Link>
                   </Toolbar>
               </AppBar>

               <div className={classes.profile} >
                   <div style={{textAlign: 'center', margin: '10px auto', width: '70%'}} >
                       <div>
                        <Avatar src={photoUrl} alt='' className={classes.avatar} onClick={() => {this.refInput.click()}} />
                        <input 
                        ref = {el => {
                            this.refInput = el
                        }}
                        accept = 'image/*'
                        type ='file'
                        className={classes.input}
                        onChange={this.handleImageChange}
                        />
                       </div>
                   <TextField fullWidth variant='outlined' style={{padding: '10px', marginBottom: '20px'}} label='Username' type='text' name='name' value={name ? name : ''} onChange={this.handleInputChange} />
                   <TextField fullWidth variant='outlined' style={{padding: '10px', marginBottom: '20px'}} label='Tell us about yourself...' type='text' name='aboutMe' value={aboutMe ? aboutMe : ''} onChange={this.handleInputChange} />
                   <Button variant='contained' color='primary' style={{color: 'white', fontWeight: 'bold', fontFamily: 'Trebuchet MS'}} onClick={this.uploadImage} disabled={loading} >
                       Save
                       {loading && (
                           <CircularProgress className={classes.loading} />
                       )}
                    </Button>
                   </div>
               </div>
            </div>
        )
    }
}

export default withStyles(styles)(Profile);
