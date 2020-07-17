import * as React from 'react';
import { View, Text, Button ,Image} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/HomeScreen'
import Scanner from './src/Scanner'
import Base from './src/Base'

function Profile({navigation}) {
  return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Profile Screen</Text>
          <Button title={"goto home"} onPress={()=> navigation.navigate('Home')}/>
      </View>
  );
}

function LogoTitle() {
    return (
        <View style={{height:40,overflow:'hidden'}}>
            <Image
                style={{ width: 150, height: 50,marginLeft:15}}
                source={require('./assets/softdomain.jpeg')}
            />
        </View>
    );
}

const Stack = createStackNavigator();
function App() {
  return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName={"Home"}>
            <Stack.Screen name="Home"
                          options={{
                              // title:"软域动态令牌",
                              headerTitle: props => <LogoTitle {...props} />
                              // headerRight: ({navigate}) => (
                              //     <Button
                              //         onPress={()=> navigate('Scanner')}
                              //         title="添加"
                              //         color="red"
                              //     />
                              // ),
                          }}
                          component={HomeScreen}

            />
            <Stack.Screen name="Profile" component={Profile} />
            <Stack.Screen name="Scanner" component={Scanner} />
            <Stack.Screen name="Base" component={Base} />
        </Stack.Navigator>
      </NavigationContainer>
  );
}

export default App;