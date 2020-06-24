import React, { Component } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import {withStyles, createStyles} from '@material-ui/core/styles';
import ImageIcon from '@material-ui/icons/Image';
import SentimentSatisfiedOutlinedIcon from '@material-ui/icons/SentimentSatisfiedOutlined';
import SendIcon from '@material-ui/icons/Send';
import moment from 'moment';
import SigninString from '../Signin/SigninString';
import images from '../../components/images';
import firebase from '../../services/Firebase';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button'



import './chatbox.css'


const styles = theme => createStyles({
    root: {
        
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#392493',
        padding: '8px',
        position: 'fixed',
        width: '100%'
    },
    avatar: {
        width: '50px',
        height: '50px'
    },
    footer: {
        position: 'fixed',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        padding: '8px',
        bottom: '0',
        padding: '20px',
        width: '71.3%'
    },
    icons: {
        margin: '0px 5px',
        cursor: 'pointer'
    },
    input: {
        margin: '0px 20px',
        width: '75%',
        padding: '10px 15px',
        outline: 'none',
        border: 'none',
        borderRadius: '20px',
        boxShadow: '0 0 5px 0 grey'
    },
    render: {
        marginTop: '80px',
        display: 'flex',
        flex: '1',
        flexDirection: 'column',
        // overflowY: 'scroll',
        paddingTop: '10px',
        paddingBottom: '0px',
        // marginBottom: '-200px'
    },
    mainLoading: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
    },
    fileinput: {
        display: 'none'
    }
})

class Chatbox extends Component {
    constructor(props) {
        super(props)
        this.state = {
            showSticker: false,
            inputVal: '',
            loading: false,
            subscribed: false,
            status: ''
        }
        this.currentUsername = localStorage.getItem(SigninString.Name);
        this.currentUserId = localStorage.getItem(SigninString.ID);
        this.currentUserPhoto = localStorage.getItem(SigninString.PhotoURL);
        this.currentUserDocumentId = localStorage.getItem(SigninString.FirebaseDocumentId);
        this.stateChange = localStorage.getItem(SigninString.UPLOAD_CHANGED);
        this.groupChatId = null;
        this.listMessages = [];
        this.currentPeerUserMessages = [];
        this.removeListener = null;
        this.currentPhotoFile = null;
        this.currentPeerUser = this.props.currentPeerUser;

        firebase.firestore().collection('users').doc(this.currentPeerUser.documentKey).get().then(docRef => {
            this.currentPeerUserMessages = docRef.data().messages
        });
        firebase.messaging().onTokenRefresh(this.onTokenRefresh)
    }

    renderSticker = () => {
        return(
            <div className='viewStickers'>
                {images.map(image => {
                    return(
                        <div key={image.src}  >
                        <img
                        src={image.src}
                        alt='sticker'
                        className='imgSticker'
                        onClick={() => {
                            this.sendMessage(image.name, 2)
                        }}
                        />
                    </div>
                    )  
                })}
                
            </div>
        )
    }

    componentDidUpdate = () => {
        this.scrollToBottom()
        this.showTyping()
    }

    componentWillReceiveProps = (newProps) => {
        if(newProps.currentPeerUser) {
            this.currentPeerUser = newProps.currentPeerUser;
            this.getHistory()
        }
        
    }

    componentDidMount = () => {
        if(this.currentPeerUser.online === true) {
            console.log(`${this.currentPeerUser.name} is online`)
            this.setState({loading: false, status: 'online'})
            this.props.showToast(1, `${this.currentPeerUser.name} is online.`)
        }else if(this.currentPeerUser.online === false) {
            this.props.showToast(1, `${this.currentPeerUser.name} is offline.`)
            this.setState({
                loading: false,
                status: 'offline'
            })
        }

        this.getHistory()
        this.scrollToBottom()
        this.checkSubcription()
    }
    componentWillMount = () => {
        if(this.removeListener) {
            this.removeListener()
        }
       
    }

    showTyping = () => {
        if(this.state.inputVal.length > 0) {
            firebase.firestore().collection('users').doc(this.currentUserDocumentId).update({
                typing: true
            }).then(() => {
                return;
            }).catch(e => {
                console.error(e)
            })
        }else{
            firebase.firestore().collection('users').doc( this.currentUserDocumentId).update({
                typing: false
            })
        }
    }

    getHistory = () => {
        if(this.removeListener) {
            this.removeListener()
        }
        this.listMessages.length = 0;
        this.setState({
            loading: true
        })
        if(this.hashString(this.currentUserId) <= this.hashString(this.currentPeerUser.id)) {
            this.groupChatId =  `${this.currentUserId}-${this.currentPeerUser.id}`
        }else{
            this.groupChatId = `${this.currentPeerUser.id}-${this.currentUserId}`
        }
        this.removeListener = firebase.firestore().collection('messages').doc(this.groupChatId).collection(this.groupChatId).onSnapshot(snapshot => {
            snapshot.docChanges().forEach(change => {
                if(change.type === SigninString.DOC){
                    this.listMessages.push(change.doc.data())
                }
                console.log(change.doc.data())
            })
            this.setState({
                loading: false
            })
        },
        err => {
            this.props.showToast(0, err.toString())
        }
        )
    }

    hashString = (str) => {
        let hash = 0;
        for(let i = 0; i < str.length; i++) {
            hash += Math.pow(str.charCodeAt(i) * 31, str.length - i)
            hash = hash & hash //Convert to 32 bit integer
        }
        return hash
    }

    sendMessage = (content, type) => {
        let notificationMessages = [];
        if(this.state.showSticker && type === 2){
            this.setState({
                showSticker: false
            })
        }
        if(content.trim() === ''){
            return
        }
        const timeStamp = moment().valueOf().toString()
        const itemMessage = {
            usernameFrom: this.currentUsername,
            usernameTo: this.currentPeerUser.name,
            idFrom: this.currentUserId,
            idTo: this.currentPeerUser.id,
            timeStamp: timeStamp,
            content: content.trim(),
            type: type,
            photoUrl: this.currentUserPhoto
        }
        firebase.firestore().collection('messages').doc(this.groupChatId).collection(this.groupChatId).doc(timeStamp).set(itemMessage).then(() => {
            this.setState({
                inputVal: ''
            })
        })
        this.currentPeerUserMessages.map(item => {
            console.log(item)
            if(item.notificationId !== this.currentUserId){
                notificationMessages.push({
                    notificationId: item.notificationId,
                    number: item.number
                })
            }
        })
        firebase.firestore().collection('users').doc(this.currentPeerUser.documentKey).update({
            messages: notificationMessages
        }).then(data => {

        }).catch(e => {
            this.props.showToast(0, e.toString())
        })
    } 

    scrollToBottom = () => {
        if(this.messageEnd)
        {
        this.messageEnd.scrollIntoView({ behavior: "smooth" });
        }
        
    }

    onKeyPress = (e) => {
        if(e.key === 'Enter'){
            this.sendMessage(this.state.inputVal, 0)
        }
    }
    openSticker = () => {
        this.setState({
            showSticker: !this.state.showSticker
        })
    }

    renderMessageList = () => {
        if(this.listMessages.length > 0){
            let viewMessageList = [];
            this.listMessages.forEach((item, index) => {
                 if(item.idFrom === this.currentUserId) {
                     if(item.type === 0){
                         viewMessageList.push(
                             <div className='viewItemRight' key={index} >
                                 <span className='textContentItem' >{item.content}</span>
                             </div>
                         )
                     }else if(item.type === 1) {
                         viewMessageList.push(
                             <div className='viewItemRight2' key={index} >
                                 <img 
                                 className='imgItemRight'
                                 src={item.content}
                                 alt=''
                                 />
                             </div>
                         )
                     }else{
                         viewMessageList.push(
                             <div className='viewItemRight3' key={index} >
                                 <img
                                 className='imgItemRight'
                                 src={this.getGifImage(item.content)}
                                 alt='Content message'
                                 />
                             </div>
                         )
                     }
                 }else{
                     if(item.type === 0){
                         viewMessageList.push(
                             <div className='viewWrapItemLeft' key={index} >
                                 <div className='viewWrapItemLeft3' >
                                    {this.isLastMessageLeft(index) ? (
                                        <img 
                                        src={this.currentPeerUser.URL}
                                        alt='avatar'
                                        className='peerAvatarLeft'
                                        />
                                    ) : (
                                        <div className='viewPaddingLeft' />
                                    )}
                                    <div className='viewItemLeft' >
                                    <span className='textContentItem' >{item.content}</span>
                                    </div>
                                 </div>
                                    {this.isLastMessageLeft(index) ? (
                                        <span className='textTimeLeft' >
                                            <div className='time' >
                                                {moment(Number(item.timeStamp)).format("ddd, h:mm:ss a, YYYY")}
                                            </div>
                                        </span>
                                    ) : null}
                             </div>
                         )
                     }else if(item.type === 1){
                        viewMessageList.push(
                            <div className='viewWrapItemLeft2' key={index} >
                                <div className='viewWrapItemLeft3' >
                                   {this.isLastMessageLeft(index) ? (
                                       <img 
                                       src={this.currentPeerUser.URL}
                                       alt='avatar'
                                       className='peerAvatarLeft'
                                       />
                                   ) : (
                                       <div className='viewPaddingLeft' />
                                   )}
                                   <div className='viewItemLeft2' >
                                   <img 
                                       src={item.content}
                                       alt='Content message'
                                       className='imgItemLeft'
                                       />
                                   </div>
                                   </div>
                                   {this.isLastMessageLeft(index) ? (
                                        <span className='textTimeLeft' >
                                            <div className='time' >
                                                {moment(Number(item.timeStamp)).format("ddd, h:mm a, YYYY")}
                                            </div>
                                        </span>
                                    ) : null}
                                   </div>
                                   )
                     }else{
                         viewMessageList.push(
                            <div className='viewWrapItemLeft2' key={index} >
                                <div className='viewWrapItemLeft3' >
                                {this.isLastMessageLeft(index) ? (
                                    <img 
                                    src={this.currentPeerUser.URL}
                                    alt='avatar'
                                    className='peerAvatarLeft'
                                    />
                                ) : (
                                    <div className='viewPaddingLeft' />
                                )}
                                <div className='viewItemLeft3' key={index} >
                                    <img
                                    className='imgItemRight'
                                    src={this.getGifImage(item.content)}
                                    alt='Content message'
                                    />
                                </div>
                               </div>
                               {this.isLastMessageLeft(index) ? (
                                        <span className='textTimeLeft' >
                                            <div className='time' >
                                                {moment(Number(item.timestamp)).format("ddd, h:mm a, YYYY")}
                                            </div>
                                        </span>
                                    ) : null}
                            </div>
                         )
                     }
                 }
            })
            return viewMessageList
        }else{
            return (
                <div className='viewWrapSayHi' >
                    <span className='textSayHi' >Say hi to new friend</span>
                    <img
                    className='imgWaveHand'
                    src='wave.png'
                    alt='Wave Hand'
                    />
                </div>
            )
        }
    }

    isLastMessageLeft(index) {
        if(
            (index + 1 < this.listMessages.length && this.listMessages[index + 1].idFrom === this.currentUserId) || index ===this.listMessages.length - 1
        ) {
            return true
        }else {
            return false
        }
    }
    isLastMessageRight(index) {
        if(
            (index + 1 < this.listMessages.length && this.listMessages[index + 1].idFrom !== this.currentUserId) || index ===this.listMessages.length - 1
        ) {
            return true
        }else {
            return false
        }
    }

    getGifImage = (value) => {
            switch(value) {
                case 'tenor':
                    return images[0].src
                case 'tenor1':
                    return images[1].src
                case 'tenor2':
                    return images[2].src
                case 'tenor3':
                    return images[3].src
                case 'tenor4':
                    return images[4].src
                case 'tenor5':
                    return images[5].src
                case 'tenor6':
                    return images[6].src
                case 'tenor7':
                    return images[7].src
                case 'tenor8':
                    return images[8].src
                case 'tenor9':
                    return images[9].src
                case 'tenor10':
                    return images[10].src
                case 'tenor11':
                    return images[11].src
                case 'tenor12':
                    return images[12].src
                case 'tenor13':
                    return images[13].src
                case 'tenor14':
                    return images[14].src
                case 'tenor15':
                    return images[15].src
                case 'tenor16':
                    return images[16].src
                case 'tenor17':
                    return images[17].src
                case 'tenor18':
                    return images[18].src
                        
                default: 
                        return null
                
            }
        
    }

    choosePhoto = (event) => {
        if(event.target.files && event.target.files[0]) {
            this.setState({loading: true})
            this.currentPhotoFile = event.target.files[0]

            const prefixFileType = event.target.files[0].type.toString();
            if(prefixFileType.indexOf('image/') === 0) {
                this.uploadPhoto()
            }else {
                this.setState({loading: false})
                this.props.showToast(0, 'The file type does not qualify as an image' )
            }
        }else{
            this.setState({loading: false})
        }
    }

    
    uploadPhoto = () => {
        if(this.currentPhotoFile) {
            const timestamp = moment().valueOf().toString()

            const uploadTask = firebase.storage().ref().child(timestamp).put(this.currentPhotoFile)

            uploadTask.on(
                SigninString.UPLOAD_CHANGED,
                null,
                err => {
                    this.setState({loading: false})
                    this.props.showToast(0, err.message)
                },
                () => {
                    uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
                        console.log(downloadURL)
                        this.setState({loading: false})
                        this.sendMessage(downloadURL, 1)
                    })
                }
            )
        }else {
            this.setState({loading: false})
            this.props.showToast(0, 'File is null.')
        }
    }

    notification = () => {
        this.setState({loading: true})
        firebase.messaging().requestPermission().then(() => {
            this.onTokenRefresh();
            this.setState({subscribed: true, loading: false})
            this.props.showToast(1, 'Congratulations! You have subscribed to Chatty messaging notifictions.')
        }).catch(e => console.error(e))
    }

    onTokenRefresh = () => {
        
        return firebase.messaging().getToken().then(token => {
            firebase.firestore().collection('token').doc(this.currentUsername).set({
                token: token,
                uid: firebase.auth().currentUser.uid,
               email: firebase.auth().currentUser.email
            })
        }).catch(e => console.error(e))
    }

    cancelNotification = () => {
        this.setState({loading: true})
        firebase.messaging().getToken().
        then(token => firebase.messaging().deleteToken(token))
        .then(() => firebase.firestore().collection('token').doc(this.currentUsername).get())
        .then(doc => {
            const key = Object.keys(doc.data())[0];
            return firebase.firestore().collection('token').doc(this.currentUsername).delete()
        }).then(() => {
            this.checkSubcription();
            this.setState({subscribed: false, loading: false})
            this.props.showToast(1, 'You have unsubscribed from Chatty messaging notifications.')
        })
    }

    checkSubcription = () => {
        firebase.firestore().collection('token').doc(this.currentUsername).get()
        .then(doc => {
            if(doc.exists) {
                this.setState({subscribed: true})
            }else{
                this.setState({subscribed: false})
            }
        })
    }
    









    render() {
        const {classes} = this.props;
        const {showSticker, inputVal, loading, subscribed} = this.state;
        return (
            <div className={classes.root} >
                <header className={classes.header} >
                    <div>
                    <Avatar src={this.currentPeerUser.URL} alt='' className={classes.avatar} />
                    <Typography variant='caption' style={{color: 'white', fontFamily: 'Trebuchet MS'}} >{this.currentPeerUser.description}</Typography>
                    </div>
                    {subscribed ? (
                        <Button disabled={loading} style={{marginRight: '400px'}} variant='contained' color='primary' onClick={this.cancelNotification} >{loading ? (<CircularProgress color='inherit' style={{position: 'absolute'}} />) : (<Typography variant='body2' color='inherit'style={{fontFamily: 'Trebuchet MS', fontWeight: 'bold'}}  >Cancel Notifications</Typography>)}</Button>
                    ) : (
                        <Button disabled={loading} style={{marginRight: '400px'}} variant='contained' color='primary' onClick={this.notification} >{loading ? (<CircularProgress color='inherit' style={{position: 'absolute'}} />) : (<Typography variant='body2' color='inherit' style={{fontFamily: 'Trebuchet MS', fontWeight: 'bold'}} >Receive Notifications</Typography>)}</Button>
                    )}   
                </header>

                        
                <div className={'viewListContentChat'} >
                <div className={classes.render} >
                    {this.renderMessageList()}
                    <div ref={(el) => this.messageEnd = el} ></div>
                </div>
                </div>
                    

                
                {showSticker ? this.renderSticker() : null}

                <footer className={classes.footer} >
                    <ImageIcon id='icons' className={classes.icons} onClick={() => {this.refInput.click()}}  />
                    <input 
                        ref = {el => {
                            this.refInput = el
                        }}
                        accept = 'image/*'
                        type ='file'
                        className={classes.fileinput}
                        onChange={this.choosePhoto}
                        />
                    <SentimentSatisfiedOutlinedIcon id='icons' className={classes.icons} onClick={this.openSticker}/>
                    <input className={classes.input} type='text' placeholder='Type a message...' value={inputVal} onChange={(e) => {this.setState({
                        inputVal: e.target.value
                    })}} onKeyPress={this.onKeyPress} />
                    <SendIcon className={classes.icons} onClick={() => {this.sendMessage(inputVal, 0)}} />
                </footer>
                    {loading ? (
                        <div className={classes.mainLoading} >
                            <div>
                            <CircularProgress />
                            <div style={{fontWeight: 'bold', fontFamily: 'Trebuchet MS'}} >Loading conversation...</div>
                            </div>
                        </div>
                    ) : null}
            </div>
        )
    }
}

export default withStyles(styles)(Chatbox);
