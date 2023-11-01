import React, { Component }  from 'react';
import './App.css';
import Navigation from './components/Navigation/Navigation.js';
import Logo from './components/Logo/Logo.js';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm.js';
import FaceRecognition from './components/FaceRecognition/FaceRecognition.js';
import Signin from './components/Signin/Signin.js';
import Register from './components/Register/Register.js';
import Rank from './components/Rank/Rank.js';
import ParticlesBg from 'particles-bg'


const returnClarifaiRequest=(imageUrl)=>{
  const PAT = process.env.REACT_APP_PAT_KEY;
  const USER_ID = 'xum8qd5t98nk';       
  const APP_ID = 'test';
  const MODEL_ID = 'face-detection';   
  const IMAGE_URL = imageUrl;

  const raw = JSON.stringify({
    "user_app_id": {
        "user_id": USER_ID,
        "app_id": APP_ID
    },
    "inputs": [
        {
            "data": {
                "image": {
                    "url": IMAGE_URL
                }
            }
        }
    ]
});

const requestOptions = {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Authorization': 'Key ' + PAT
    },
    body: raw
};

return requestOptions;

}




// NOTE: MODEL_VERSION_ID is optional, you can also call prediction with the MODEL_ID only
// https://api.clarifai.com/v2/models/{YOUR_MODEL_ID}/outputs
// this will default to the latest version_id
const initialState={
      input:'',
      imageUrl:'',
      box:'',
      route: 'Signin',
      isSignedIn: false,
      user:{
          id:'',
          name:'',
          email:'',
          entries:0,
          joined:''

      }
}


class App extends Component {
  constructor(){
    super();
    this.state=initialState;
  }

   loadUser = ([data]) => {
    this.setState( { user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
} 

  calculateFaceLocation=(data)=>{
  const clarifaiFace=data.outputs[0].data.regions[0].region_info.bounding_box;
  const image=document.getElementById('inputimage');
  const width=Number(image.width);
  const height=Number(image.height);
  return(
  {
    leftCol:clarifaiFace.left_col * width,
    topRow: clarifaiFace.top_row * height,
    rightCol: width-(clarifaiFace.right_col* width),
    bottomRow: height-(clarifaiFace.bottom_row * height)
  }
  )
}



displayBox=(box)=>{
  console.log(box);
  this.setState({box:box})
}


onInputChange=(event)=>{
  this.setState({input:event.target.value})
}

onRouteChange=(route)=>{
  if(route==='Signout')
  {
    this.setState(initialState)
  }
  else if(route==='Home')
  {
    this.setState({isSignedIn:true})
  }
  this.setState({route:route})
}



onButtonSubmit=(event)=>{
  this.setState({imageUrl:this.state.input})
  fetch("https://api.clarifai.com/v2/models/" + "face-detection" + "/outputs", returnClarifaiRequest(this.state.input))
    .then(response => response.json())
    .then(result => this.displayBox(this.calculateFaceLocation(result)))
    .catch(error => console.log('error', error))
    fetch('https://mybackend-us1y.onrender.com/image', {
      method: 'put',
      headers: {'Content-Type': 'application/json'},
      body:JSON.stringify({
          id:this.state.user.id})
    })
    .then(response=>response.json())
    .then(count=>{this.setState(Object.assign(this.state.user, {entries:count}))})

}



 render(){
  return(
    <div className="App">
    <ParticlesBg  className='particles' color="#3CA9D1" num={200} type="tadpole" bg={true}  />
    <Navigation onRouteChange={this.onRouteChange} isSignedIn={this.state.isSignedIn}/>
     {
            this.state.route ==='Home'
          ? <div>
          <Logo />
           <Rank name={this.state.user.name} entries={this.state.user.entries}/>
           <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit}/>
           <FaceRecognition box={this.state.box} imageUrl={this.state.imageUrl} />
         </div>
          : (this.state.route ==='Signin' 
            ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
            : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
            )
        }

    
    </div>
  );
}
}

export default App;
