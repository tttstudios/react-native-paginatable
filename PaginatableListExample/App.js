import React, { Component } from 'react'
import { View } from 'react-native'
import { reduxStore } from '@Components/Store';
import { Provider } from 'react-redux'
import  AppWithNavigationState from '@Components/Router';

console.disableYellowBox = true

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

export default App;