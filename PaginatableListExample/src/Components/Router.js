import React, { Component } from 'react'
import { View, Alert } from 'react-native'
import { connect } from 'react-redux'
import { createStackNavigator } from 'react-navigation'
import {
	reduxifyNavigator,
	createReactNavigationReduxMiddleware
} from 'react-navigation-redux-helpers'
import UserListScreen from '@Screens/UserList/index.container'

const modalRouteConfig = {
	UserList: {
		screen: UserListScreen
	}
}

const modalNavigatorConfig = {
	cardStyle: {
		opacity: 1
	},
	navigationOptions: {
		initialRouteName: 'UserList',
		headerMode: 'screen'
	}
}

export const ModalStack = createStackNavigator(
	modalRouteConfig,
	modalNavigatorConfig
)

export const ReactNavigationReduxMiddleware = createReactNavigationReduxMiddleware(
	'root',
	state => state.nav
)

const App = reduxifyNavigator(ModalStack, 'root')
const mapStateToProps = state => ({
	state: state.nav
})
const AppWithNavigationState = connect(mapStateToProps)(App)

export default AppWithNavigationState
