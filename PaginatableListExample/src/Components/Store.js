import Reactotron from 'reactotron-react-native'
import { getRootReducer, getCombinedReducers } from '@Reducers'
import { applyMiddleware, compose } from 'redux'
import ReduxThunk from 'redux-thunk'
import { ReactNavigationReduxMiddleware } from '@Components/Router';
import { createActions, createReducer, Types as ReduxSauceTypes } from 'reduxsauce';

export let reduxStore = configureStore()

export function configureStore(initialState = {}) {
    console.tron.log('CONGIFURE STORE')
    const store = Reactotron.createStore(
        getRootReducer(),
        initialState,
        compose(
            applyMiddleware(ReduxThunk),
            applyMiddleware(ReactNavigationReduxMiddleware)
        )
    )
    store.asyncReducers = {}

    reduxStore = store

    return store
}

export const injectAsyncReducer = (store, name, asyncReducer) => {
    console.tron.log('INJECT ASYNC REDUCER')
    store.asyncReducers[name] = asyncReducer

    const rootReducer = getRootReducer(store.asyncReducers)
    store.replaceReducer(rootReducer)

    reduxStore = store
}

