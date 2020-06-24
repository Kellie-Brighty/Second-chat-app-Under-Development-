import React, { Component } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import Typography from '@material-ui/core/Typography';
import {withStyles, createStyles} from '@material-ui/core/styles';

import './home.css'

const styles = theme => createStyles({
    body: {
        height: '100%',
        width: '80%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '100px',
        paddingBottom: '0px',
        margin: '0px auto',
        marginTop: '0px'
    },
    img: {
        width: '90%',
        height: '100%',
        flexBasis: '50%'
    },
    text: {
        flexBasis: '50%',
        marginTop: '-20px',
        marginLeft: '0px'
    }
})


class Home extends Component {
    render() {
        const {classes} = this.props;
        return (
            <div>
                <Header />
                 <div id='body' className={classes.body} >
                     <div>
                     <img className={classes.img} src='chat-app-design.jpg' />
                     <Typography variant='body2' color='primary' style={{fontFamily: 'Trebuchet MS', fontWeight: 'bold', fontSize: '18px', textAlign: 'center', marginLeft: '-70px', marginTop: '20px' }}  >The Arrival of Exquisite Designs.</Typography>
                     </div>
                     <div className={classes.text} >
                         <Typography id='mainText' variant='body2' style={{fontFamily: 'Trebuchet MS', fontWeight: 'bold', fontSize: '15px' }} >Welcome to "Chatty" Online Web App, developed by Kelly Owoju, using React and Firebase. <br /><br /> This is going to be initially, a 'test' chat app.<br/> You will not have the full experience you would expect to enjoy on a normal chat app.<br/> <br/> I am currently working on the notifications. But I have implemented and online/offline icon status viewer for those online or offline. Just that for now, you will have to make a full page refresh, to see the latest state.<br/><br/> But that's just temporary.<br/><br/> You also will not be able to view this app on your mobile device. This chat app might not be supportive of a mobile device view.<br/><br/> Let's happily test this out together! <br /> Sign Up and meet friends and even new friends!</Typography>
                     </div>
                 </div>
                <Footer />
            </div>
        )
    }
}

export default withStyles(styles)(Home);
