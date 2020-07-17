import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import AsyncStorage from '@react-native-community/async-storage';
import URL from 'url-parse'

const parse = (urlstring) => {
    let url = new URL(urlstring)
    let user,secret
    user = url.pathname.slice(1)
    secret = url.query.split('&')[0].slice(8)
    return [user,secret]
}

const addToStorage = async (secret,name) => {
    let type = 'sha';
    let re;
    if(type == 'sm3') {
        // 16进制SM3
        re= /^[A-Fa-f0-9]+$/
    }else if(type == 'sha'){
        //32进制SHA
        re = /^[2-7A-Za-z]+$/;
    }
    if(!re.test(secret)) {
        alert('密钥异常，请检查密钥格式');
        return
    }

    // do this once
    // first get the storage, see if it is empty
    let keys = []
    try {
        keys = await AsyncStorage.getAllKeys()
    } catch(e) {
        console.log(`error occurred: ${e}`)
    }
    let originalValue
    if(!keys.includes('los')){
        originalValue = {}
    }else{
        const jsonValue = await AsyncStorage.getItem('los')
        originalValue = JSON.parse(jsonValue)
    }
    if(originalValue[secret]) alert('您已经添加过了')
    originalValue[secret] = name
    await AsyncStorage.setItem('los',JSON.stringify(originalValue))
}

export default function Scanner({navigation}) {
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        (async () => {
            const { status } = await BarCodeScanner.requestPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    const handleBarCodeScanned = ({ type, data }) => {
        setScanned(true);
        let [name,secret] = parse(data)
        addToStorage(secret,name).then((loadPreset =>{
            navigation.goBack()
        }))
    };

    if (hasPermission === null) {
        return <Text>Requesting for camera permission</Text>;
    }
    if (hasPermission === false) {
        return <Text>No access to camera</Text>;
    }

    return (
        <View
            style={{
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'flex-end',
            }}>
            <BarCodeScanner
                onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                style={StyleSheet.absoluteFillObject}
            />

            {scanned && (
                <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />
            )}
        </View>
    );
}
