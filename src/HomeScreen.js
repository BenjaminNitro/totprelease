import React, { useState, useEffect } from 'react';
import { View, Text ,StyleSheet, Button, FlatList, Animated,TouchableOpacity, Alert} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import jsSHA from '../sha';
import { useFocusEffect } from '@react-navigation/native';
import timer from 'react-native-timer'
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import Constants from "expo-constants";
import Accordion from 'react-native-collapsible/Accordion';
import { FontAwesome } from '@expo/vector-icons';
import {sm3} from 'sm-crypto'

const TOTP = function() {

    var dec2hex = function(s) {
        return (s < 15.5 ? "0" : "") + Math.round(s).toString(16);
    };

    var hex2dec = function(s) {
        return parseInt(s, 16);
    };

    var leftpad = function(s, l, p) {
        if(l + 1 >= s.length) {
            s = Array(l + 1 - s.length).join(p) + s;
        }
        return s;
    };

    var base32tohex = function(base32) {
        var base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
        var bits = "";
        var hex = "";
        for(var i = 0; i < base32.length; i++) {
            var val = base32chars.indexOf(base32.charAt(i).toUpperCase());
            bits += leftpad(val.toString(2), 5, '0');
        }
        for(var i = 0; i + 4 <= bits.length; i+=4) {
            var chunk = bits.substr(i, 4);
            hex = hex + parseInt(chunk, 2).toString(16) ;
        }
        return hex;
    };

    var hextoString = function (hex) {
        var arr = hex.split("")
        var out = ""
        for (var i = 0; i < arr.length / 2; i++) {
            var tmp = "0x" + arr[i * 2] + arr[i * 2 + 1]
            var charValue = String.fromCharCode(tmp);
            out += charValue
        }
        return out
    };

    this.getOTP = function(secret) {
        try {
            var epoch = Math.round(new Date().getTime() / 1000.0);
            var time = leftpad(dec2hex(Math.floor(epoch / 30)), 16, "0");
            var hmacObj = new jsSHA(time, "HEX");
            var hmac = hmacObj.getHMAC(base32tohex(secret), "HEX", "SHA-1", "HEX");
            var offset = hex2dec(hmac.substring(hmac.length - 1));
            var otp = (hex2dec(hmac.substr(offset * 2, 8)) & hex2dec("7fffffff")) + "";
            otp = (otp).substr(otp.length - 6, 6);
        } catch (error) {
            console.log('无法getOTP，错误值',error)
            return "错误"
        }
        return otp;
    };

    this.get_SM3_OTP = function (secret) {
        try {
            var epoch = Math.round(new Date().getTime() / 1000.0);
            var time = hextoString(leftpad(dec2hex(Math.floor(epoch / 30)), 16, "0")); //get timestamp
            var hex_secret = hextoString(base32tohex(secret));
            var hashData = sm3(hex_secret + time); // 杂凑
            var otp = 0;
            for (let i = 0; i < 8; i++) {
                let str = hashData.substr(8 * i, 8)
                otp = otp + hex2dec(str);
            }
            otp = (otp % Math.pow(2, 32)) % Math.pow(10, 6) + "";
        } catch (error) {
            console.log('there is an error',error);
            return "错误"
        }
        return otp;
    };

    this.get_SM3_OTP16 = function (secret, timeStamp, c = 0, q = 0) {
        try {
            var hex_secret = hextoString(secret);
            var time = hextoString(leftpad(dec2hex(timeStamp), 16, "0")); //get timestamp
            if(c == 0)
            {
                var c_str = hextoString("00000000")
            }
            else
            {
                var c_str = hextoString(leftpad(dec2hex(c), 8, "0")); //get timestamp
            }
            if(q == 0)
            {
                var q_str = hextoString("00000000")
            }
            else
            {
                var q_str = "" + q;
            }
            var temp_str = hex_secret + time + c_str + q_str;

            var hashData = sm3(temp_str);
            var otp = 0;
            for (let i = 0; i < 8; i++) {
                let str = hashData.substr(8 * i, 8)
                otp = otp + hex2dec(str);
            }
            otp = (otp % Math.pow(2, 32)) % Math.pow(10, 6);
            otp = leftpad(otp + "", 6, "0");
        } catch (error) {
            console.log('异常',error)
            return "错误"
        }
        return otp;
    };

}




const HomeScreen = ({navigation}) => {
    let totpObj = new TOTP()
    const [slist, setslist] = useState([])
    const [remain, setremain] = useState(0)

    // AsyncStorage.removeItem('los').then(res=>{
    //     console.log('removed')
    //     setslist('')
    // })
    // console.log('slist is ', slist)

    useFocusEffect(React.useCallback(()=>{
        AsyncStorage.getItem('los').then((res)=>{
            let arr = Object.entries(JSON.parse(res))
            setslist(arr)
        }).catch((e)=>{
            console.log(e)
        })
    },[]))


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
            console.log('时间到啦')
        }
    }

    var getInitialTime = (() => {
        var currentSecond = new Date().getSeconds()
        if(currentSecond > 30){
            return 30 - (currentSecond - 30)
        }else if(currentSecond != 0){
            return 30 - currentSecond
        }else{
            return 0
        }
    })()

    var getCountDown = (initialTime) => {
        return <CountdownCircleTimer
            size={40}
            strokeWidth={2}
            isPlaying={true}
            duration={30}
            initialRemainingTime={initialTime}
            colors={[['#004777', 0.33], ['#F7B801', 0.33], ['#A30000']]}
            onComplete={(elapsed)=>{
                return [true]
            }}
        >
            {
                ({ remainingTime, animatedColor }) => (
                    <Animated.Text
                        style={{ ...styles.remainingTime, color: animatedColor }}>
                        {remain - 1 < 0 ? 29 : remain - 1}
                    </Animated.Text>
                )
            }
        </CountdownCircleTimer>
    }
    timer.setInterval("MyTimer",getRemain,1000)

    const [active, setactive] = useState([])

    var deleteSecret = async (secret) => {
        var originalSecrets = await AsyncStorage.getItem('los')
        originalSecrets = JSON.parse(originalSecrets)
        delete originalSecrets[secret]
        await AsyncStorage.setItem('los',JSON.stringify(originalSecrets))
        setslist(Object.entries(originalSecrets))
    }

    var _renderHeader = section => {
        return (
            <View style={styles.header}>
                <Text style={styles.headerUname}>用户名</Text>
                <View style={{flexDirection:'row'}}>
                    <Text style={styles.headerText}>
                        {section[1]}
                    </Text>
                    <FontAwesome.Button
                        name="trash-o"
                        size={24}
                        color="black"
                        backgroundColor="white"
                        onPress={()=>{
                            Alert.alert(
                                "确认删除此密钥？",
                                "此操作不可撤消",
                                [
                                    {
                                        text: "取消",
                                        style: "cancel"
                                    },
                                    { text: "确认", onPress: () => deleteSecret(section[0]) }
                                ],
                            )
                        }}
                    />
                </View>
            </View>
        );
    };

    var _renderContent = section => {
        let passwd = totpObj.getOTP(section[0])
        // let sm = totpObj.get_SM3_OTP(section[0])

        // var epoch = Math.round(new Date().getTime() / 1000.0);
        // let sm16 = totpObj.get_SM3_OTP16(section[0],Math.floor(epoch / 30))

        return (
            <View>
            <View style={styles.content}>
                <Text style={styles.passCode}>{passwd}</Text>
                <View style={{alignSelf:'center'}}>
                    {getCountDown(getInitialTime - 1)}
                </View>
            </View>
            </View>
        );
    };

    var _updateSections = activeSections => {
        setactive( activeSections );
    };

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Button
                    title="扫码添加"
                    color="rgb(31, 132, 219)"
                    onPress={()=> navigation.navigate('Scanner')} />
            ),
                headerStyle: {
                    backgroundColor: 'white',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
        },
            );
    }, [navigation]);

        return (
            <View style={{ flex: 1, alignItems: 'stretch', justifyContent: 'flex-start', flexDirection:'column'}}>
                {slist.length === 0 ? <Text>您还没有添加密钥，点击右上方添加</Text> :
                    <Accordion
                    sections={slist}
                    activeSections={active}
                    renderHeader={_renderHeader}
                    renderContent={_renderContent}
                    onChange={_updateSections}
                />
                }
                {/*<Button*/}
                {/*    title="清除缓存"*/}
                {/*    color="rgb(31, 132, 219)"*/}
                {/*    onPress={()=> AsyncStorage.removeItem('los').then(res=>alert('清除成功'))} />*/}
            </View>
        );
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

export default HomeScreen;
