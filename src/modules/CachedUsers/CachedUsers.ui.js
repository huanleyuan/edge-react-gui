import React, { Component } from 'react'
import { connect } from 'react-redux'

import { Actions } from 'react-native-router-flux'
import { View, ScrollView, Text, StyleSheet, TouchableHighlight, TouchableOpacity } from 'react-native'
import { InputGroup, Input, Button, Card, CardItem, Content} from 'native-base'

import { selectUserToLogin } from './CachedUsers.action'
// import { deleteUserToCached } from './CachedUsers.middleware'
import { openLoginUsingPin } from '../Login/Login.action'




class UserList extends Component {

  handleLoginUserPin = (user) => {
    this.props.dispatch(selectUserToLogin(user))
  }

  handleDeleteUserCache = (user) => {
    console.log('foo')
    // this.props.dispatch(deleteUserToCached(user))
  }

  listUsers = () => {
    const checkIfLastElementStyle = index => {
      const lastIndex = this.props.users.length - 1
      if (lastIndex !== index) {
        return [style.row, style.border]
      }

      if (lastIndex === index) {
        return style.row
      }
    }

    return this.props.users.map((user, index) => {
      return (
        <View key={index} style={checkIfLastElementStyle(index)}>
          <View style={style.cachedItem}>
            <TouchableOpacity style={style.textContainer} onPress={() => this.handleLoginUserPin(user)}>
              <Text style={style.text}>{ user }</Text>
            </TouchableOpacity>
            <TouchableHighlight onPress={() => this.handleDeleteUserCache(user)} color='#222222' style={style.xbutton}><Text style={style.xbuttontext}>X</Text></TouchableHighlight>
          </View>
        </View>
      )
    })
  }

  render () {
    return (
      <ScrollView
        keyboardShouldPersistTaps
        style={style.container}
        contentContainerStyle={style.contentContainer}>
        { this.listUsers() }
      </ScrollView>
    )
  }
}

const style = StyleSheet.create({

  container: {
    position: 'absolute',
    maxHeight: 150,
    left:0,
    right:0,
    top: 40,
    flex: 1,
    alignSelf: 'flex-end',
    backgroundColor: '#FFF',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FF0000'
  },
  contentContainer: {
    alignItems: 'stretch'
  },

  row: {
    flexDirection: 'column',
    padding: 16,
    alignItems: 'stretch',
    height: 40,
    flex: 1
  },
  textContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40
  },
  text: {
    flex: 1,
    color: '#222',
    fontSize: 18
  },

  xbuttontext: {
    fontSize: 18
  },
  xbutton: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    padding: 10
  },

  border: {
    borderBottomColor: '#AAA',
    borderBottomWidth: 1,
    borderStyle: 'solid'
  },

  cachedItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start'
  }
})

export default connect(state => ({

  users: state.cachedUsers.users

}))(UserList)
