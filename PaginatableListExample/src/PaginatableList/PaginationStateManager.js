import { createActions, createReducer } from 'reduxsauce';
import PaginateService from './PaginateService';

export default class PaginationStateManager {
    constructor(name, url) {
        this.name = name
        this.endpointUrl = url
        this.initialState = {
            items: []
        }

        this.actionObject = {
            'loadMore'  : ['newItems'],
            'refresh'   : ['newItems']
        }

        const { Types, Creators } = createActions(this.actionObject, { prefix: `${name.toUpperCase()}_` })

        this.actionTypes = Types
        this.actions = Creators

        this.actionHandlers = {
            [Types['LOAD_MORE']]: (state, { newItems }) => {
                return {
                    ...state,
                    items: state.items.concat(newItems)
                }
            },
            [Types['REFRESH']]: (state, { newItems }) => {
                return {
                    ...state,
                    items: newItems
                }
            }
        }
    }

    reducer = () => {
        return createReducer(this.initialState, this.actionHandlers)
    }

    addAction({ type, payload, handler }) {
        let handlerName = type.split(/(?=[A-Z])/).join('_').toUpperCase();

        this.actionObject[type] = payload
        const { Types, Creators } = createActions(this.actionObject, { prefix: `${this.name.toUpperCase()}_` })
    
        this.actionTypes = Types
        this.actions = Creators

        this.actionHandlers[Types[handlerName]] = handler

        Object.getPrototypeOf(this)[type] = (args) => {
            return (dispatch) => {
                dispatch(this.actions[type].apply(null, Object.values(args)))
            }
        }
    }

    addActions(actionArr) {
        actionArr.map((action) => {
            this.addAction(action)
        })
    }

    loadMore = ({ pageNumberKey, pageSizeKey, pageNumber, pageSize, ...args }) => {
        return (dispatch) => {
            PaginateService.getItems({ pageNumberKey, pageSizeKey, pageNumber, pageSize, endpointUrl: this.endpointUrl, ...args })
            .then(response => {
                dispatch(this.actions.loadMore(response.data))
            })
            .catch(error => {
                if (__DEV__) console.tron.log(error)
            })
        }
    };

    refresh = ({ pageNumberKey, pageSizeKey, pageSize, ...args }, successCallback = () => {}) => {
        return (dispatch) => {
            PaginateService.getItems({ pageNumberKey, pageSizeKey, pageNumber: 1, pageSize, endpointUrl: this.endpointUrl, ...args })
            .then(response => {
                dispatch(this.actions.refresh(response.data))
                successCallback()
            })
            .catch(error => {
                if (__DEV__) console.tron.log(error)
            })
        }
    }

}