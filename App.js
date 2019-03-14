/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  CameraRoll,
  StyleSheet,
  Text,
  Image,
  View,
  Alert,
  TouchableOpacity,
  PermissionsAndroid,
  ScrollView,
  Slider,
} from 'react-native';
import Spinner from 'react-native-gifted-spinner';
import ImageResizer from 'react-native-image-resizer';
import RNFetchBlob from 'rn-fetch-blob';

console.disableYellowBox = true;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  image: {
    width: 250,
    height: 250,
  },
  resizeButton: {
    color: '#333333',
    fontWeight: 'bold',
    marginBottom: 5,
  },
});


export default class ResizerExample extends Component {
  constructor() {
    super();

    this.state = {
      resizedImageUri: '',
      loading: true,
      imageInfos: '',
      imageResizdInfos: '',
      quality: 50,
    };
  }

  async componentDidMount() {
    await this.requestCameraPermission();
  }

  requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Cool Photo App Camera Permission',
          message:
            'Cool Photo App needs access to your camera ' +
            'so you can take awesome pictures.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the camera');
        this.getPhotos();
      } else {
        console.log('Camera permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  }

  getPhotos = async () => {
    CameraRoll.getPhotos({ first: 1 })
    .then(photos => {
      debugger;
      if (!photos.edges || photos.edges.length === 0) {
        return Alert.alert(
          'Unable to load camera roll',
          'Check that you authorized the access to the camera roll photos and that there is at least one photo in it'
        );
      }
      const image = photos.edges[0].node.image;

      this.setState({ image});
      this.getImageInfos();
    })
    .catch(() => {
      return Alert.alert(
        'Unable to load camera roll',
        'Check that you authorized the access to the camera roll photos'
      );
    });
  }

  resize = async () => {
    const { quality } = this.state;
    ImageResizer.createResizedImage(this.state.image.uri, 1000, 1000, 'JPEG', quality)
      .then(({ uri }) => {
        this.setState({
          resizedImageUri: uri,
        });
        this.getImageResizedInfos()
      })
      .catch(err => {
        console.log(err);
        return Alert.alert('Unable to resize the photo', 'Check the console for full the error message');
      });
  }

  getImageSize = async (uri) => {
    const data = await RNFetchBlob.fs.stat(uri);
    data.sizeInKbs = this.bytesToSize(data.size);
    return JSON.stringify(data, null, 2);
  }

  getImageInfos = async () => {
    const { image } = this.state;
    const imageInfos = await this.getImageSize(image.uri);
    this.setState({ imageInfos});
  }


  getImageResizedInfos = async () => {
    const { resizedImageUri } = this.state;
    const imageResizdInfos = await this.getImageSize(resizedImageUri);
    this.setState({ imageResizdInfos });
    this.setState({ imageInfos});
  }

  bytesToSize = (bytes) => {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
  };


  render() {
    const {
      imageInfos,
      imageResizdInfos,
      quality,
    } = this.state;
    return (
      <View style={styles.container}>
        <ScrollView>
          <Text style={styles.welcome}>Image Resizer example</Text>

          <Slider
            minimumValue={0}
            maximumValue={110}
            step={10}
            value={quality}
            onSlidingComplete={text => this.setState({ quality: text })}
          />
          <Text style={{alignSelf: 'center'}}>{quality}</Text>

          <Text style={styles.instructions}>This is the original image:</Text>
          {this.state.image ? <Image style={styles.image} source={{ uri: this.state.image.uri }} /> : <Spinner />}
          <Text>{ imageInfos }</Text>

          <Text style={styles.instructions}>Resized image:</Text>
          <TouchableOpacity onPress={() => this.resize()}>
            <Text style={styles.resizeButton}>Click me to resize the image</Text>
          </TouchableOpacity>
          {this.state.resizedImageUri ? (
            <Image style={styles.image} source={{ uri: this.state.resizedImageUri }} />
          ) : null}
          <Text>{ imageResizdInfos }</Text>
        </ScrollView>
      </View>
    );
  }
}