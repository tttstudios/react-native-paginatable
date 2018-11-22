import { combineReducers } from 'redux';
import { createActions, createReducer, Types as ReduxSauceTypes } from 'reduxsauce';
import NavigationReducer from './NavigationReducer';
import { reducer as CustomizedPaginatableListReducer } from './CustomizedPaginationListReducer';

const getCombinedReducers = (asyncReducers) => {
    return combineReducers({
        users      : CustomizedPaginatableListReducer,
        nav        : NavigationReducer,
        ...asyncReducers
    });
}

const { Types, Creators: Actions } = createActions({
    resetApp: []
})

const getRootReducer = (asyncReducers) => {
    const appReducer = getCombinedReducers(asyncReducers)

    return createReducer([], {
        [Types.RESET_APP]: (state, action) => {
            return appReducer(undefined, action)
            //Passing undefined as state will make all the reducers using their initial states.
        },
        [ReduxSauceTypes.DEFAULT]: (state, action) => {
            return appReducer(state, action)
        }
    })
}

const resetReduxStore = () => {
    return (dispatch) => {
        dispatch(Actions.resetApp())
    }
}


export {getRootReducer, resetReduxStore, getCombinedReducers, CustomizedPaginatableListReducer}
