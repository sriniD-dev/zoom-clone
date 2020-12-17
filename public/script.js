const socket = io('/');

const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;
var peer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '443',
});
let myVideoStream;
const peers = {};
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);
    peer.on('call', (call) => {
      call.answer(stream);
      const video = document.createElement('video');
      call.on('stream', (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });
    socket.on('user-connected', (userId) => {
      connectToNewUser(userId, stream);
    });
    let text = $('input');
    $('html').keydown((e) => {
      if (e.which == 13 && text.val().length !== 0) {
        console.log(text.val());
        socket.emit('message', text.val());
        text.val('');
      }
    });
    socket.on('createMessage', (message) => {
      console.log('createMessage', message);
      $('.messages').append(
        `<li class="message"<b>user</b><br/>${message}</li>`
      );
      scrollToBottom();
    });
  });
peer.on('open', (id) => {
  //   console.log(id);
  socket.emit('join-room', ROOM_ID, id);
});

const connectToNewUser = (userId, stream) => {
  //   console.log(userId);
  var call = peer.call(userId, stream);
  const video = document.createElement('video');
  call.on('stream', (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
};

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGrid.append(video);
};
const scrollToBottom = () => {
  let d = $('.main__chat_window');
  d.scrollTop(d.prop('scrollHeight'));
};

// mute our video
const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

const setMuteButton = () => {
  const html = `<i class="fas fa-microphone"></i>
    <span>Mute</span>`;
  console.log(html);
  document.querySelector('.main__mute__button').innerHTML = html;
};

const setUnmuteButton = () => {
  const html = `<i class="unmute fas fa-microphone-slash"></i><span>Unmute</span>`;
  document.querySelector('.main__mute__button').innerHTML = html;
};
const playstop = () => {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};
// set play video
const setStopVideo = () => {
  const html = `<i class="fas fa-video"></i>
    <span>Play Video</span>`;
  document.querySelector('.main__video__button').innerHTML = html;
};
// set stop video
const setPlayVideo = () => {
  const html = `<i class="fas fa-video-slash stop"></i>
    <span>Play Video</span>`;
  document.querySelector('.main__video__button').innerHTML = html;
};
