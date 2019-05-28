import React, { Component } from 'react'
import { View } from 'react-native'
import { reduxStore } from '@Components/Store'
import { Provider } from 'react-redux'
import AppWithNavigationState from '@Components/Router'

console.disableYellowBox = true

// To see all the requests in the chrome Dev tools in the network tab.
XMLHttpRequest = GLOBAL.originalXMLHttpRequest
	? GLOBAL.originalXMLHttpRequest
	: GLOBAL.XMLHttpRequest

class App extends Component {
	constructor() {
		super()
		this.state = { rehydrated: false }
	}

	render() {
		return (
			<View style={{ flex: 1 }}>
				<Provider store={reduxStore}>
					<AppWithNavigationState />
				</Provider>
			</View>
		)
	}
}

export default App
