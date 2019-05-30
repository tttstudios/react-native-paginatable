import { createActions, createReducer } from 'reduxsauce'
import PaginateService from './PaginateService'

export default class PaginationStateManager {
	constructor(
		name,
		url,
		onParsePaginationResponse = null,
		customizedReducerPath = null,
		requestHeaders = null
	) {
		this.name = name
		this.customizedReducerPath = customizedReducerPath
		
		this.paginateService = new PaginateService()
		this.paginateService.setEndpointUrl(url)
		this.paginateService.setHeader(requestHeaders)
		this.paginateService.setResponseParser(onParsePaginationResponse)
		console.log(this.paginateService)

		this.initialState = {
			items: []
		}

		this.actionObject = {
			loadMore: ['newItems'],
			refresh: ['newItems'],
			reset: [],
			setTotalPage: ['totalPagesNumber']
		}

		const { Types, Creators } = createActions(this.actionObject, {
			prefix: `${name.toUpperCase()}_`
		})

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
			},
			[Types['RESET']]: state => {
				return {
					...state,
					items: []
				}
			},
			[Types['SET_TOTAL_PAGE']]: (state, { totalPagesNumber }) => {
				return {
					...state,
					totalPagesNumber
				}
			}
		}
	}

	reducer = () => {
		return createReducer(this.initialState, this.actionHandlers)
	}

	setEndpointUrl = url => {
		if (this.paginateService) {
			this.paginateService.setEndpointUrl(url)
		}
		
	}

	addAction({ type, payload, handler }) {
		let handlerName = type
			.split(/(?=[A-Z])/)
			.join('_')
			.toUpperCase()

		this.actionObject[type] = payload
		const { Types, Creators } = createActions(this.actionObject, {
			prefix: `${this.name.toUpperCase()}_`
		})

		this.actionTypes = Types
		this.actions = Creators

		this.actionHandlers[Types[handlerName]] = handler

		Object.getPrototypeOf(this)[type] = args => {
			return dispatch => {
				dispatch(this.actions[type].apply(null, Object.values(args)))
			}
		}
	}

	addActions(actionArr) {
		actionArr.map(action => {
			this.addAction(action)
		})
	}

	loadMore = (
		{ pageNumberKey, pageSizeKey, pageNumber, pageSize, ...args },
		successCallback = () => {},
		errorCallback = () => {}
	) => {
		return async dispatch => {
			var headers = {}
			if (this.paginateService.getHeader()) {
				try {
					headers = await this.paginateService.getHeader()
					if (__DEV__)
						console.log(
							`HTTP Headers: ${JSON.stringify(
								headers,
								undefined,
								2
							)}`
						)
				} catch (err) {
					if (__DEV__)
						console.log(`No HTTP Headers Available: ${err}`)
				}
			}
			PaginateService.getItems({
				headers,
				pageNumberKey,
				pageSizeKey,
				pageNumber,
				pageSize,
				endpointUrl: this.paginateService.endpointUrl,
				...args
			})
				.then(response => {
					if (this.paginateService.responseParser) {
						const {
							items,
							totalPagesNumber
						} = this.paginateService.responseParser(response.data)
						dispatch(this.actions.loadMore(items || []))
						if (totalPagesNumber) {
							dispatch(
								this.actions.setTotalPage(totalPagesNumber)
							)
						}
						successCallback()
					} else {
						dispatch(this.actions.loadMore(response.data))
						successCallback()
					}
				})
				.catch(error => {
					if (__DEV__) console.log(JSON.stringify(error))
					errorCallback(error)
				})
		}
	}

	refresh = (
		{ pageNumberKey, pageSizeKey, pageNumber, pageSize, ...args },
		successCallback = () => {},
		errorCallback = () => {}
	) => {
		return async dispatch => {
			var headers = {}
			try {
				headers = await this.paginateService.getHeader()
				if (__DEV__)
					console.log(
						`HTTP Headers: ${JSON.stringify(headers, undefined, 2)}`
					)
			} catch (err) {
				if (__DEV__) console.log(`No HTTP Header Available: ${err}`)
			}
			PaginateService.getItems({
				headers,
				pageNumberKey,
				pageSizeKey,
				pageNumber,
				pageSize,
				endpointUrl: this.paginateService.endpointUrl,
				...args
			})
				.then(response => {
					if (this.paginateService.responseParser) {
						const {
							items,
							totalPagesNumber
						} = this.paginateService.responseParser(response.data)
						dispatch(this.actions.refresh(items || []))
						if (totalPagesNumber) {
							dispatch(
								this.actions.setTotalPage(totalPagesNumber)
							)
						}
						successCallback()
					} else {
						dispatch(this.actions.refresh(response.data))
						successCallback()
					}
				})
				.catch(error => {
					if (__DEV__) console.log(JSON.stringify(error))
					errorCallback(error)
				})
		}
	}

	reset = () => {
		return dispatch => {
			dispatch(this.actions.reset())
		}
	}

	setTotalPage = totalPagesNumber => {
		return dispatch => {
			dispatch(this.actions.setTotalPage(totalPagesNumber))
		}
	}
}
