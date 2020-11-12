import React, { useState, useEffect } from 'react';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import {Animated, StyleSheet} from "react-native";
import Constants from "expo-constants";
import timer from "react-native-timer";

const Clock = ({timerid}) => {
  const [remain, setremain] = useState(1)
  const [key,setkey] = useState(0)
  var getRemain = () => {
    var currentSecond = new Date().getSeconds()
    if(currentSecond > 30){
      setremain(30 - (currentSecond - 30))
    }else if(currentSecond != 0){
      setremain( 30 - currentSecond)
    }else{
      setremain(0)
    }
    if(remain === 0){
      setkey(oldkey => oldkey + 1)
    }
  }

  timer.setInterval(`${timerid}`,getRemain,1000)

  return(
      <CountdownCircleTimer
          size={40}
          key={key}
          strokeWidth={2}
          isPlaying={true}
          duration={30}
          initialRemainingTime={(() => {
            var currentSecond = new Date().getSeconds()
            if(currentSecond > 30){
              return 30 - (currentSecond - 30)
            }else if(currentSecond != 0){
              return 30 - currentSecond
            }else{
              return 0
            }
          })()}
          colors={[['#004777', 0.33], ['#F7B801', 0.33], ['#A30000']]}
          onComplete={(elapsed)=>{
            return [true]
          }}
      >
        {
          ({ remainingTime, animatedColor }) => (
              <Animated.Text
                  style={{ ...styles.remainingTime, color: animatedColor }}>
                {/*{remain - 1 < 0 ? 29 : remain - 1}*/}
                {remainingTime}
              </Animated.Text>
          )
        }
      </CountdownCircleTimer>
  )
}

const styles = StyleSheet.create({
  text: {
    fontSize: 30
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderTopColor:'#ecf0f1',
    borderTopWidth:1,
  },
  headerText: {
    textAlign: 'left',
    fontSize: 35,
    fontWeight: '300',
    flex:1
  },
  passCode:{
    fontSize:40,
    fontWeight:'300',
    flex:1,
    marginLeft:10,
  },
  smcode:{
    fontSize:20,
    fontWeight:'300',
    flex:1,
    marginTop:15
  },
  container: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection:'column',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
    padding: 0,
  },
  content: {
    padding: 15,
    paddingBottom:35,
    backgroundColor: '#fff',
    flexDirection: 'row'
  },
  remainingTime: {
    fontSize: 15,
  },
});

export default Clock;