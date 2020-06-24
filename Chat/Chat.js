import React, { Component } from 'react';
import SigninString from '../Signin/SigninString';
import firebase from '../../services/Firebase';
import Button from '@material-ui/core/Button';
import Drawer from '@material-ui/core/Drawer';
import {withStyles, createStyles} from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';



import './chat.css';
import Welcome from '../Welcome/Welcome';
import Chatbox from '../Chatbox/Chatbox';


const styles = theme => createStyles({
    root:{
        display: 'flex',
    },
    drawer: {
        width: '350px',
        overflowY: 'scroll',
        overflowX: 'hidden',
        // display: 'none'
    },
    toolbar: {
        backgroundColor: '#392493',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '15px',
        position: 'fixed',
        top: 0,
        width: '305px'
    },
    viewAvatarItem: {
        width: '40px',
        height: '40px'
    },
    searchbar: {
        padding: '10px 0px',
        width: '335px', 
        marginBottom: '10px', 
        backgroundColor: '#f7f7f7',
        position: 'fixed',
        top: '5em'
    },
    search: {
        padding: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width: '90%',
        backgroundColor: 'rgb(199, 199, 199)',
        margin: '1px auto'
      },
    input: {
        marginLeft: theme.spacing(1),
        flex: 1,
    },
    iconButton: {
        padding: 10,
    },
    divider: {
        height: 28,
        margin: 4,
    },
    chatbox: {
        marginLeft: '350px',
        flexBasis: '80%'
    },
    welcome: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        marginTop: '100px'
    },
    contact: {
        marginTop: '160px',
        zIndex: '-1'
    }
})


class Chat extends Component {
    constructor() {
        super()
        this.currentUsername = localStorage.getItem(SigninString.Name);
        this.currentUserId = localStorage.getItem(SigninString.ID);
        this.currentUserPhoto = localStorage.getItem(SigninString.PhotoURL);
        this.currentUserDocumentId = localStorage.getItem(SigninString.FirebaseDocumentId);

        this.currentUserMessages = [];
        this.searchUsers = [];
        this.notificationMessageErase = [];
        this.displayedContact = [];
        this.docChanged = [];

        this.logout = this.logout.bind(this);
        this.profilePage = this.profilePage.bind(this);
        this.removeListener = this.removeListener.bind(this);
        this.renderUserList = this.renderUserList.bind(this);
        this.userAndNotificationClass = this.userAndNotificationClass.bind(this);
        this.notificationErase = this.notificationErase.bind(this);
        this.updateRenderList = this.updateRenderList.bind(this);
        this.handleSearch = this.handleSearch.bind(this);

        this.state = {
            loading: false,
            logoutDialogOpen: false,
            currentPeerUser: null,
            displayNotification: [],
            displayedContact: [],
            typing: false,
            status: ''
        }
    }

    logout() {
        firebase.firestore().collection('users').doc(this.currentUserDocumentId).update({online: false}).then(() => {
            this.setState({status: 'offline'})
        })
        firebase.auth().signOut();
        this.props.history.push('/');
        localStorage.setItem(SigninString.online, false)
        localStorage.clear();
    }

    profilePage = () => {
        this.props.history.push('/profile')
    }

    userAndNotificationClass = (itemId) => {
        let number = 0;
        let className = '';
        let check = false;
        if(this.state.currentPeerUser && this.state.currentPeerUser.Id === itemId) {
            className = 'viewWrapItemFocused'
        }else{
            this.state.displayNotification.forEach(item => {
                if(item.notificationId.length > 0) {
                if(item.notificationId === itemId) {
                    check = true
                    number = item.number
                }
                }
            })
            if(check === true){
                className = 'viewWrapItemNotification'
            }else{
                className = 'viewWrapItem'
            }
        }
        return className
    }

    removeListener = () => {firebase.firestore().collection('users').onSnapshot(snapshot => {
        snapshot.docChanges().forEach((change, index) => {
                this.docChanged.push({
                    key: index,
                    documentKey: change.doc.id,
                    id: change.doc.data().id,
                    name: change.doc.data().name,
                    messages: change.doc.data().messages,
                    URL: change.doc.data().URL,
                    description: change.doc.data().description,
                    online: change.doc.data().online,
                    typing: change.doc.data().typing  
                })
            console.log(change.doc.data())
        })
        this.setState({
            loading: false
        })
        this.renderUserList()
    }
    ) 
}

    // getUserList = async() => {
    //     const users = await firebase.firestore().collection('users').get();
    //     if(users.docs.length > 0) {
    //         let usersList = [];
    //         usersList = [...users.docs];
    //         usersList.forEach((item, index) => {
    //             this.searchUsers.push({
    //                 key: index,
    //                 documentKey: item.id,
    //                 id: item.data().id,
    //                 name: item.data().name,
    //                 messages: item.data().messages,
    //                 URL: item.data().URL,
    //                 description: item.data().description,
    //                 online: item.data().online,
    //                 typing: item.data().typing  
    //             })
    //         })
    //         this.setState({
    //             loading: false,
    //         })
    //     }
    //     this.renderUserList()
    // }

    notificationErase = (itemId) => {
        this.state.displayNotification.forEach(el => {
            if(el.notificationId.length > 0){
                if(el.notificationId !== itemId) {
                    this.notificationMessageErase.push(
                        {
                            notificationId: el.notificationId,
                            number: el.number
                        }
                    )
                }
            }
        })
        this.updateRenderList()
    }

    updateRenderList = ()=> {
        firebase.firestore().collection('users').doc(this.currentUserDocumentId).update(
            {messages: this.notificationMessageErase }
        )
        this.setState({
            displayNotification: this.notificationMessageErase
        })
    }

    renderUserList = () => {
        if(this.docChanged.length > 0 ) {
            let viewUserList = [];
            let classname = ''

            this.docChanged.map((item, index) => {
                if(item.id !== this.currentUserId){
                    classname = this.userAndNotificationClass(item.id);
                    viewUserList.push(
                        <>
                        <Button 
                        style={{padding: '20px'}}
                        id={item.key}
                        key={index}
                        className={classname}
                        onClick={() => {
                            this.notificationErase(item.id)
                            this.setState({currentPeerUser: item})
                            // document.getElementById(item.key).style.backgroundColor = '#392493'
                            // document.getElementById(item.key).style.color = 'white'
                        }}
                        >
                        <div>
                        <Avatar style={{width: '50px', height: '50px'}} src={item.URL} className='viewAvatarItem' alt='' />
                        {localStorage.getItem(SigninString.online) && item.online  ? (
                            <Avatar src='online.png' alt='' style={{position: 'absolute', width: '20px', height: '20px',marginLeft: '55px', marginTop: '-18px'}} />
                        ) : <Avatar src='offline.png' alt='' style={{position: 'absolute', width: '16px', height: '16px',marginLeft: '55px', marginTop: '-18px'}} />}
                        </div>
                        <div className='viewWrapContentItem' >
                            <span className='textItem' >
                                {item.name}
                            </span>
                            <span >
                                {item.typing ? (
                                    <p style={{marginLeft: '0px',
                                position: 'absolute', textTransform: 'lowercase', marginTop: '-5px'}} >typing...</p>
                                ) : null}
                            </span>
                        </div>
                        {classname === 'viewWrapItemNotification' ? 
                        <div className='notificationpragraph' >
                        <p id={item.key} key={index} className='newmessages' >New Messages</p>
                        </div> : null}
                        </Button>
                        <Divider />
                        </>
                    )
                }
            })
            this.setState({
                displayedContact: viewUserList
            })
        }else{
            console.log('No user is available.')
        }
    }

    handleSearch = (e) => {
        let displayedContact;
        let searchQuery = e.target.value.toLowerCase()
        displayedContact = this.searchUsers.filter(el => {
            let searchValue = el.name.toLowerCase()
            return searchValue.indexOf(searchQuery) !== -1
        })
        this.displayedContact = displayedContact
        this.displaySearchedContact()
    }

    displaySearchedContact = () => {
        if(this.searchUsers.length > 0 ) {
            let viewUserList = [];
            let classname = ''

            this.displayedContact.map(item => {
                if(item.id !== this.currentUserId){
                    classname = this.userAndNotificationClass(item.id);
                    viewUserList.push(
                        <>
                        <Button 
                        style={{padding: '20px'}}
                        id={item.key}
                        key={item.key}
                        className={classname}
                        onClick={() => {
                            this.notificationErase(item.id)
                            this.setState({currentPeerUser: item})
                        }}
                        >
                        <Avatar style={{width: '50px', height: '50px'}} src={item.URL} className='viewAvatarItem' alt='' />
                        {this.state.currentPeerUser.online === true ? (
                                <Avatar src='online.png' />
                            ) : null }
                        <div className='viewWrapContentItem' >
                            <span className='textItem' >
                                {item.name}
                            </span>
                        </div>
                        {classname === 'viewWrapItemNotification' ? 
                        <div className='notificationpragraph' >
                        <p id={item.key} key={item.key} className='newmessages' >New Messages</p>
                        </div> : null}
                        </Button>
                        <Divider />
                        </>
                    )
                }
            })
            this.setState({
                displayedContact: viewUserList
            })
        }else{
            console.log('No user is available.')
        }
    }

    componentDidMount = () => {
        firebase.firestore().collection('users').doc(this.currentUserDocumentId).get().then(doc => {
            doc.data().messages.map(message => {
                this.currentUserMessages.push({
                    notificationId: message.notificationId,
                    number: message.number
                })
            })
            this.setState({
                displayNotification: this.currentUserMessages
            })
        })
        this.removeListener()
    }
    render() {
        const {classes} = this.props;
        const {currentPeerUser} = this.state;
        return (
            <div className={classes.root} >
               <Drawer
               anchor='left'
               variant='permanent'
               classes={{
                   paper: classes.drawer
               }}
               >
                   <div className={classes.toolbar} >
                    <Avatar src={this.currentUserPhoto} alt='' variant='circle' style={{width: '60px', height: '60px', cursor: 'pointer' }} onClick={this.profilePage} />
                    <div>
                        <Button onClick={this.logout} variant='contained' color='primary' style={{fontWeight: 'bold', fontFamily: 'Trebuchet MS'}} >Sign Out</Button>
                    </div>
                   </div>

                    <div className={classes.searchbar} >
                        <Paper className={classes.search} >
                        <InputBase
                            className={classes.input}
                            type='text'
                            placeholder="Search Your Contacts"
                            inputProps={{ 'aria-label': 'search google maps' }}
                            onChange={this.handleSearch}
                        />
                        <IconButton type="submit" className={classes.iconButton} aria-label="search">
                            <SearchIcon />
                        </IconButton>
                        </Paper>
                    </div>

                   {this.state.displayedContact.length > 0 ? (
                       <div className={classes.contact} >
                           {this.state.displayedContact}
                       </div>
                   ): 
                   <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '300px', textAlign: 'center' }}>
                       <div style={{textAlign: 'center'}} >
                        <CircularProgress />
                        <p style={{fontFamily: 'Trebuchet MS', fontWeight: 'bold'}} >Loading Contact...</p>
                       </div>
                   </div>
                   }
               </Drawer>
               <div className={classes.chatbox} >
                   {currentPeerUser ? (
                           <Chatbox currentPeerUser={currentPeerUser} showToast={this.props.showToast} />
                   ) : (
                    <div className={classes.welcome} >
                    <Welcome currentUserPhoto={this.currentUserPhoto} currentUserName={this.currentUsername} />
                    </div>
                   )}
               </div>
            </div>
        )
    }
}

export default withStyles(styles)(Chat);
