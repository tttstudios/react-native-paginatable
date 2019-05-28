import { getRootReducer } from '@Reducers'
import { applyMiddleware, compose, createStore } from 'redux'
import ReduxThunk from 'redux-thunk'
import { ReactNavigationReduxMiddleware } from '@Components/Router'

export let reduxStore = configureStore()

export function configureStore(initialState = {}) {
	const store = createStore(
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
	store.asyncReducers[name] = asyncReducer

	const rootReducer = getRootReducer(store.asyncReducers)
	store.replaceReducer(rootReducer)

	reduxStore = store
}
