import { Pressable, StyleSheet, Text, View, Button, Image, SafeAreaView, FlatList } from "react-native";
import { useState, useEffect } from "react";
import { Alert, Linking } from "react-native";

import React, { useCallback } from "react";

import { ResponseType, useAuthRequest } from "expo-auth-session";
import { myTopTracks, albumTracks } from "./utils/apiOptions";
import { REDIRECT_URI, SCOPES, CLIENT_ID, ALBUM_ID } from "./utils/constants";
import Colors from "./Themes/colors"
import millisToMinuteAndSeconds from './utils/millisToMinuteSeconds';

// Endpoints for authorizing with Spotify
// Endpoints for authorizing with Spotify
const discovery = {
  authorizationEndpoint: "https://accounts.spotify.com/authorize",
  tokenEndpoint: "https://accounts.spotify.com/api/token"
};
const supportedURL = "https://google.com";

const OpenURLButton = ({ url, children }) => {
  const handlePress = useCallback(async () => {
    // Checking if the link is supported for links with custom URL scheme.
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      // Opening the link with some app, if the URL scheme is "http" the web link should be opened
      // by some browser in the mobile
      await Linking.openURL(url);
    } else {
      Alert.alert(`Don't know how to open this URL: ${url}`);
    }
  }, [url]);

  return <Pressable style={{width:30,height:40}} title="spotify" onPress={handlePress}>
    <Image style= {{width:30,height: 30, marginTop:7}} source={require("./assets/spotify-logo.png")}/>
  </Pressable>;
};

const Item = ({title, albumImage, artist,album, duration,index, url}) => (
  <View style = {styles.box}>
    <Text style = {{color:Colors.gray,paddingRight:15, paddingLeft:15}} numberOfLines={1}>{index}</Text>
    <Image source={{uri: albumImage}} style= {{width: 90, height:90}}/>
    <View style = {{flexDirection: 'column', paddingLeft: 5, flex: 1}}>
      <Text style = {{color:'white',width:100}} numberOfLines={1}>{title}</Text >
      <Text style = {{color:Colors.gray,paddingTop:4,width:100}} numberOfLines={1}>{artist}</Text>
      <OpenURLButton url={url}>Open Supported URL</OpenURLButton>
    </View>
    <View style= {{paddingLeft: 100, flexDirection: "row"}}>
    <Text style = {{color:'white', width:100}} numberOfLines={1}>{album}</Text>
    <Text  style = {{color:'white',paddingLeft: 10}} numberOfLines={1}>{duration}</Text>
    </View>
  </View>
);


let contentDisplayed = null;
export default function App() {
  const [token, setToken] = useState("");
  const [tracks, setTracks] = useState([]);
  
  const renderItem = ({ item }) => (
    
    <Item title={item.name} 
    albumImage={item.album.images[0].url}
    artist={item.album.artists[0].name} 
    album={item.album.name}
    duration={millisToMinuteAndSeconds(item.duration_ms)}
    index = {tracks.indexOf(item)+1}
    url = {item.external_urls.spotify}
    />
  );

/*
  const renderItem = ({item}) => (
    <Item
      name = {item.album.name}
      albumImage={item.album.images[0].url}
    />
);*/
  
  


  const SpotifyAuthButton = () => {
    return (
      
      <Pressable 
                onPress={() => {
                  promptAsync();
                }}
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed
                      ? '#1ED760'
                      : '#1DB954',
                      borderRadius: 9999,
                      height: 30,
                      width: 200,
                  },
                  styles.wrapperCustom
                ]}>
  
                {({ pressed }) => (
                  <View style = {{display: 'flex', flexDirection: "row", justifyContent: 'center', alignItems:'center'}}>
                  <Image style= {{width:15,height: 15, marginTop:7}} source={require("./assets/spotify-logo.png")}/>
                  <Text style={{paddingLeft: 7, color: 'white', fontWeight: 'bold', marginTop:7}}>
                    {pressed ? 'CONNECT WITH SPOTIFY' : 'CONNECT WITH SPOTIFY'}
                  </Text>
                  </View>
                  
                )}
                
            </Pressable>
    );
  }
  



  const [request, response, promptAsync] = useAuthRequest(
    {
      responseType: ResponseType.Token,
      clientId: CLIENT_ID,
      scopes: SCOPES,
      // In order to follow the "Authorization Code Flow" to fetch token after authorizationEndpoint
      // this must be set to false
      usePKCE: false,
      redirectUri: REDIRECT_URI
    },
    discovery
  );



  useEffect(() => {
    if (response?.type === "success") {
      const { access_token } = response.params;
      setToken(access_token);
    }
  }, [response]);

  useEffect(() => {
    const fetchTracks = async () => {
      // TODO: Comment out which one you don't want to use
      // myTopTracks or albumTracks

      const res = await myTopTracks(token);
      //const res = await albumTracks('0FHpjWlnUmplF5ciL84Wpa?si=LW1QU1cdTHOPM74faZse9Q', token);
      setTracks(res);
      

      
      
    };
    
    if (token) {
     fetchTracks();
     
      
    }
  }, [token]);


  if(token){

    contentDisplayed = <View>    
    <Text style = {{color:Colors.spotify, width:'100%', height: 40, fontSize: 30,fontWeight:'bold'}} >My Top Tracks!</Text>
    <FlatList
      data={tracks}
      renderItem={renderItem}
      keyExtractor={item => item.id}
    /></View>;
  }else{
    contentDisplayed = <View><SpotifyAuthButton/></View>
  }
  

  return (
    

    <SafeAreaView style={styles.container}>
      {contentDisplayed}
    </SafeAreaView>

  );

  
}


const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    flex: 1
  },
  box: {
    display: 'flex',
    flexDirection: 'row',
    height:100,
    backgroundColor: Colors.background,
    alignItems: "center",
    flex: 1
  },
  text: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1
  },
  homeScreen: {
    alignItems: 'center', 
    justifyContent: 'center',
  },
  homeScreenText: {
    fontSize: 12,
  },
});
