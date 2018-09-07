import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios'
import Konva from 'konva';
import { Stage, Layer, Group, Text, Rect, Image, Line } from 'react-konva';

class App extends Component {
  state = {
    matchId: '01de542a-d03e-40d5-8f38-9d8e4cab9df3',
    Deaths: [],
    image: new window.Image(),
    search: "",
    selectedOption: "all",
    gamertag: ""
  }
  componentDidMount() {
    this.state.image.src = 'https://content.halocdn.com/media/Default/community/Halo5MapOverheads/truth-ce12aa021ef843a39d498cb84ebe1d99.png';
    this.state.image.onload = () => {
      // calling set state here will do nothing
      // because properties of Konva.Image are not changed
      // so we need to update layer manually
      this.imageNode.getLayer().batchDraw();
    };
  }
  loadKills() {
    axios.get(`https://www.haloapi.com/stats/h5/matches/${this.state.matchId}/events`,
      {
        headers: {
          'Ocp-Apim-Subscription-Key': '0e873481fc064b63bc08f41e5b7b844d'
        }
      }).then(({data}) => {
        let { IsCompleteSetOfEvents, GameEvents } = data;
        let Deaths = GameEvents.filter(({EventName})=> EventName === "Death");

        this.setState({
          IsCompleteSetOfEvents,
          Deaths
        });
        
      });
  }
  getGame(gamertag) {
    console.log('getting game for : ', gamertag);
    this.setState({gamertag})
    axios.get(`https://www.haloapi.com/stats/h5/players/${encodeURIComponent(gamertag)}/matches`,
        {
          headers: {
            'Ocp-Apim-Subscription-Key': '0e873481fc064b63bc08f41e5b7b844d'
          }
        }
      ).then(({data})=>{
        console.log(data)
        let onlyTruthHCS = data.Results.filter(({MapId}) => MapId === "ce1dc2de-f206-11e4-a646-24be05e24f7e")
        console.log(onlyTruthHCS)
        if (onlyTruthHCS.length > 0) {
          this.setState({matchId: onlyTruthHCS[0].Id.MatchId})
          this.loadKills();
        }else {
          alert("It looks like Truth HCS wasn't one of your last 25 games...")
        }
      }).catch(err => {
        alert('oops, something went wrong')
      })
  }

  render() {
    var deaths = this.state.Deaths;
    if (this.state.selectedOption === "mykills") {
      deaths = deaths.filter((death)=>{
        return death.Killer.Gamertag.toLowerCase() === this.state.gamertag.toLowerCase()
      })
    } else if (this.state.selectedOption === "mydeaths") {
      deaths = deaths.filter((death)=>{
        return death.Victim.Gamertag.toLowerCase() === this.state.gamertag.toLowerCase()
      })
    }
    return (
        <div>
          <h6>Enter your GT to find your latest game on Truth</h6>
          <input value={this.state.search} onKeyDown={(e)=>{e.keyCode == 13 ? this.getGame(this.state.search) : null}} onChange={(e)=>{this.setState({search: e.target.value})}} />
          <form>
            <input  type="radio" value="all" onChange={(e)=>{this.setState({selectedOption: e.target.value})}} checked={this.state.selectedOption === 'all'} /><span>all kills</span>
            <input  type="radio" value="mykills" onChange={(e)=>{this.setState({selectedOption: e.target.value})}} checked={this.state.selectedOption === 'mykills'} /><span>my kills</span>
            <input  type="radio" value="mydeaths" onChange={(e)=>{this.setState({selectedOption: e.target.value})}} checked={this.state.selectedOption === 'mydeaths'} /><span>my deaths</span>
          </form>
          <Stage width={window.innerWidth} height={window.innerHeight}>
            <Layer>
              <Image
                image={this.state.image}
                width={794}
                height={736}
                ref={node => {
                  this.imageNode = node;
                }}
              />
            </Layer>
            <Layer>
              {deaths.map((death, i)=>{
                let { KillerWorldLocation, VictimWorldLocation } = death;
    
                let scale = 16.4771319;
                let normx = x => (-1*x*scale)+390
                let normy = y => (-1*y*scale)+296
             
                return (
                  <Group key={i}>
                    <Rect
                      x={normx(KillerWorldLocation.y)}// don't want to rotate the image, sorry...
                      y={normy(KillerWorldLocation.x)}
                      width={10}
                      height={10}
                      fill="red"
                      shadowBlur={5}
                    />
                    <Rect
                      x={normx(VictimWorldLocation.y)}
                      y={normy(VictimWorldLocation.x)}
                      width={10}
                      height={10}
                      fill="blue"
                      shadowBlur={5}
                    />
                    <Line
                      points={[
                          normx(KillerWorldLocation.y)+5,
                          normy(KillerWorldLocation.x)+5,
                          normx(VictimWorldLocation.y)+5,
                          normy(VictimWorldLocation.x)+5
                        ]}
                       stroke="grey"
                       opacity={0.5}
                    />
                  </Group>
                )
              })}
             
            </Layer>
          </Stage>
        </div>
    );
  }
}

export default App;
