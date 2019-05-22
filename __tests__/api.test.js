import { combineReducers, applyMiddleware, compose, createStore } from 'redux'
import ReduxThunk from 'redux-thunk'

import PaginationStateManager from '../PaginationStateManager'
import mockAxios from 'axios'

import PaginateService from '../PaginateService';

const USER_ITEMS = [{ key: 'k1' }, { key: 'k2' }, { key: 'k3' }]
const STATE_NAME = 'users'
const URL = 'http://test.example.com/users'

describe('PaginatableList-API', () => {
	const paginationStateManager = new PaginationStateManager(STATE_NAME, URL)
	const getCombinedReducers = () => {
		return combineReducers({
			[STATE_NAME]: paginationStateManager.reducer()
		})
    }
    const reduxStore = createStore(
        getCombinedReducers(),
        {},
        compose(applyMiddleware(ReduxThunk))
    )

	describe('onLoadMore()', () => {
		describe('Default', () => {
			it('PaginateService.getItems() is called with correct query params.', async () => {
                mockGetItems = jest.fn(({ ...args }) => {
                    PaginateService.getItems({ ...args })
                })

                mockAxios.mockImplementationOnce(({ url, ...params }) => {
                    mockGetItems({ url, params })
                    return Promise.resolve({
                        data: {
                            items: USER_ITEMS
                        }
                    })
                })

                const mockQueryParams = {
                    pageNumberKey: 'page',
                    pageSizeKey: 'size',
                    pageNumber: 1,
                    pageSize: 5
                }
                
                await reduxStore.dispatch(paginationStateManager.loadMore(mockQueryParams))
                expect(mockGetItems).toHaveBeenCalled()
                expect(mockGetItems).toHaveBeenCalledTimes(1)
                expect(mockGetItems).toHaveBeenCalledWith({
                    url: URL,
                    params: {
                        headers: {},
                        params: {
                            page: 1,
                            size: 5
                        }
                    }
                })
            })
            it('Triggers onCompleteLoadMore() properly', async () => {
                mockAxios.mockImplementationOnce(({ url, ...params }) => {
                    return Promise.resolve({
                        data: {
                            items: USER_ITEMS
                        }
                    })
                })

                mockSuccessCallback = jest.fn()

                const mockQueryParams = {
                    pageNumberKey: 'page',
                    pageSizeKey: 'size',
                    pageNumber: 1,
                    pageSize: 5
                }
                
                await reduxStore.dispatch(paginationStateManager.loadMore(mockQueryParams, mockSuccessCallback))

                expect(mockSuccessCallback).toHaveBeenCalled()
                expect(mockSuccessCallback).toHaveBeenCalledTimes(1)
                expect(mockSuccessCallback).toHaveBeenCalledWith()
            })
		})
	})
})
