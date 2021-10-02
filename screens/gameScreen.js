import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Animated,
  Text,
  StyleSheet,
  PanResponder,
  Dimensions,
  Image,
} from 'react-native';
import * as Progress from 'react-native-progress'
import db from '../config'
import items from '../list';
import itemName from '../itemName';

const GameScreen = ({navigation, route}) => {
  const pan = useState(new Animated.ValueXY())[0]; 
  //item names and answers
  const images = items;
  const answers = itemName;
//num items to play with and type of game mode
  var numItems = route.params.num

  var len = answers.length //number of elements
  var index1 = 0 //temp index
  var percent1 = 0 //temp percent
  var corr = 0; //temp 
  var incorr = 0;
  var seen = []
  var percentAdd = 1/numItems

  var sec = 0;
  var min = 0;
  var hour = 0;

  const [correct, setCorrect] = useState(0)
  const [incorrect, setIncorrect] = useState(0)
  const [index, setIndex] = useState(Math.floor(Math.random()*100) % len);
  const [percent, setPercent] = useState(0)

  //return the answer for a given object
  function check(object) {
    var word = object
    var facts = []
    db.ref(word+'/').on('value', data => {
      var useData = data.val()
      for(var fact in useData) {
        facts.push(useData[fact])
      }
    })
    return facts[0]
  }

  //initialize game
  function initGame() {
    index1 = 0
    percent1 = 0
    corr = 0;
    incorr = 0;
    seen = []
    sec = 0;
    min = 0;
    hour = 0;

   setCorrect(0)
    setIncorrect(0)
    setPercent(0)
  }

  //create panResponder
  const panResponder = useState(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => { //move image
        pan.setOffset({ x: pan.x._value, y: pan.y._value });
      },
      onPanResponderMove: (_, gesture) => {//set image value
        pan.x.setValue(gesture.dx);
        pan.y.setValue(gesture.dy);
      },
      onPanResponderRelease: async () => {// on release
        var object = answers[index1]
        var answer = check(object)
        if (pan.y._value >= 180) {
          if (pan.x._value >= 81) {
            if (answer == 'recyclable') {
              corr ++
              setCorrect(corr)
            } else {
              incorr ++;
              setIncorrect(incorr)
            }
          } else if (pan.x._value <= -81) {
            if (answer == 'compostable') {
              corr ++
              setCorrect(corr)
            } else {
              incorr ++;
              setIncorrect(incorr)
            }
          } else {
            if (answer == 'landfill') {
              corr ++
              setCorrect(corr)
            } else {
             incorr ++;
              setIncorrect(incorr)
            }
          }
          
          index1 = Math.floor(Math.random()*100) % len
          while(seen.indexOf(index1) >= 0) {
            index1 = Math.floor(Math.random()*100) % len
          }

          seen.push(index1)
          setIndex(index1)

          percent1 = percent1+percentAdd
          setPercent(percent1)
          //console.log("PERCENT: "+percent1)
          if(percent1 > percentAdd * (numItems - 1)) {
            navigation.navigate("Summary Screen", {num: numItems})
            initGame()
          }

          Animated.timing(pan, {
            toValue: {
              x: 2 / Dimensions.get('window').height,
              y: 2 / Dimensions.get('window').width,
            },
            duration: 500,
            useNativeDriver: false,
          }).start();
          
        } else {
          Animated.timing(pan, {
            toValue: {
              x: 2 / Dimensions.get('window').height,
              y: 2 / Dimensions.get('window').width,
            },
            duration: 1000,
            useNativeDriver: false,
          }).start();
        }
        pan.flattenOffset();
      },
    })
  )[0];

  return (
    <View style={styles.container}>
      <Progress.Bar progress={percent} width={Dimensions.get('window').width * 4/5} style = {{position:'absolute', top:50}}/>
      <Animated.Image
        source={images[index]}
        style={[
          {
            width: 150,
            height: 150,
            justifyContent: 'center',
            alignSelf: 'center',
            transform: [
              {
                translateX: pan.x,
              },
              { translateY: pan.y },
            ],
          },
        ]}
        {...panResponder.panHandlers}
      />

      <Text style = {styles.count}>Correct: {correct} Incorrect: {incorrect}</Text>

      <View style={styles.binContainer}>
        <Image style={styles.bins} source={require('../photos/bins.png')} />
      </View>
    </View>
  );
};

export default GameScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "#D0F1DD"
  },
  binContainer: {
    flex:1,
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
  },
  bins: {
    width: Dimensions.get('window').width,
    height: (Dimensions.get('window').height * 1) / 4,
    opacity: 0.5,
  },
  count: {
    textAlign:'center',
    fontSize:25,
    fontWeight:'bold',
    color: "#262626",
    marginTop:10
  }
});