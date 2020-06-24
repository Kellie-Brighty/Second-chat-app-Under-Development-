import React, { Component } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import {withStyles, createStyles} from '@material-ui/core/styles';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import  AppBar  from '@material-ui/core/AppBar';
import  Toolbar  from '@material-ui/core/Toolbar';
import  Button  from '@material-ui/core/Button';
import {Link} from 'react-router-dom';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import PermIdentityIcon from '@material-ui/icons/PermIdentity';

const styles = theme => createStyles({
    root: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url("bg.jpg")',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
    },
    aboutBody: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url("aboutBG.jpg")',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        margin: '25px auto',
        width: '80%',
        height: '620px',
        overflow: 'hidden'
    },
    avatar: {
        width: '290px',
        height: '290px',
        border: '5px solid white',
        marginTop: '-150px',
        marginLeft: '10px'
    },
    typography1: {
        fontFamily: 'Trebuchet MS',
        fontWeight: 'bold',
    },
    typography2: {
        fontFamily: 'Trebuchet MS',
        maxWidth: '300px'
    },
    text: {
        marginTop: '20px',
        marginLeft: '20px'
    },
    skillSet: {
        display: 'flex',

    },
    skillAvatar: {
        width: '80px',
        height: '80px',
        padding: '10px'
    },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 150px'
    },
    btn: {
        fontFamily: 'Trebuchet MS',
        marginLeft: '10px'
    }
});

class About extends Component {
    render() {
        const {classes} = this.props;
        return (
            <div className={classes.root} >
                <AppBar style={{position: 'fixed', top: '0', left: '0', backgroundColor: 'transparent', boxShadow: 'none'}} >
                    <Toolbar className={classes.toolbar} >
                    <Link to='/' >
                    <ArrowBackIcon style={{fontSize: '30px', color: 'white'}}  />
                    </Link>
                    <div>
                    <Button variant='contained' className={classes.btn} color='primary' component={Link} to='/' >Hire Me</Button>
                    <Button variant='contained' className={classes.btn} color='primary' component={Link} to='/signin' ><LockOpenIcon />Sign In</Button>
                    <Button variant='contained' className={classes.btn} color='primary' component={Link} to='/signup' ><PermIdentityIcon />Sign Up</Button>
                    </div>
                    </Toolbar>
                </AppBar>
                <div className={classes.aboutBody} >
                    <Typography variant='h5' color='primary' style={{position: 'absolute', left: '13.8em', top: '4em', fontFamily: 'Trebuchet MS', textDecoration: 'underline'}} >About Me</Typography>
                    <div className={classes.text} >
                        <Typography className={classes.typography1} style={{fontSize: '30px'}} variant='h5' color='primary' >Hi, I am Kelly Owoju.</Typography>
                        <Typography variant='body2' className={classes.typography2} >Since I started my venture into the world of design and development, I have never been less sure of the fact that one's public identity in life and business, amplified by each sect's designs, is extremely an important part of human success. <br/> I am a Web designer and developer. I am mostly concerned with my client's public identity. I am quite influencial where business strategizing is concerned.<br/> I sure won't let you down.</Typography><br/>

                        <Typography variant='h6' color='primary' style={{fontFamily: 'Trebuchet MS', fontWeight: 'bold'}} >My Skill Set: </Typography>

                        <div className={classes.skillSet} >
                            <div>
                                <Avatar className={classes.skillAvatar} src='react-logo.png' alt='' />
                            </div>
                            <div>
                                <Avatar className={classes.skillAvatar} src='firebase logo.png' alt='' />
                            </div>
                            <div>
                                <Avatar className={classes.skillAvatar} src='node-js-icon.png' alt='' />
                            </div>
                            <div>
                                <Avatar className={classes.skillAvatar} src='photoshop.png' alt='' />
                            </div>
                        </div>
                    </div>
                    <Avatar className={classes.avatar} src='kelly.jpg' alt='' variant='circle' />
                </div>
            </div>
        )
    }
}

export default withStyles(styles)(About);
