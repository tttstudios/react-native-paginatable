import React from 'react'
import { combineReducers, applyMiddleware, compose, createStore } from 'redux'
import ReduxThunk from 'redux-thunk'
import 'react-native'
import { Text } from 'react-native'
import { shallow } from 'enzyme'

import PaginatableList from '../index'
import PaginationStateManager from '../PaginationStateManager'

import TestRenderer from 'react-test-renderer' // comes after react-native

const USER_ITEMS = [{ key: 'k1' }, { key: 'k2' }, { key: 'k3' }]
const STATE_NAME = 'users'
const URL = 'http://test.example.com/users'

describe('PaginatableList', () => {
	const paginationStateManager = new PaginationStateManager(STATE_NAME, URL)
	const getCombinedReducers = () => {
		return combineReducers({
			[STATE_NAME]: paginationStateManager.reducer()
		})
	}

	describe('.defaultProps', () => {
		describe('with no items', () => {
			it('renders empty state properly', () => {
				const reduxStore = createStore(
					getCombinedReducers(),
					{},
					compose(applyMiddleware(ReduxThunk))
				)
				const tree = TestRenderer.create(
					<PaginatableList
						store={reduxStore}
						customizedPaginationStateManager={
							paginationStateManager
						}
					/>
				).toJSON()

				expect(tree).toMatchSnapshot()
			})
		})

		describe('with three items', () => {
			it('renders list properly', () => {
				const reduxStore = createStore(
					getCombinedReducers(),
					{ [STATE_NAME]: { items: USER_ITEMS } },
					compose(applyMiddleware(ReduxThunk))
				)
				const tree = TestRenderer.create(
					<PaginatableList
						store={reduxStore}
						customizedPaginationStateManager={
							paginationStateManager
						}
					/>
				).toJSON()

				expect(tree).toMatchSnapshot()
			})

			it('renders three items with default render item component', () => {
				const reduxStore = createStore(
					getCombinedReducers(),
					{ [STATE_NAME]: { items: USER_ITEMS } },
					compose(applyMiddleware(ReduxThunk))
				)
				const testRenderer = TestRenderer.create(
					<PaginatableList
						store={reduxStore}
						customizedPaginationStateManager={
							paginationStateManager
						}
					/>
				)

				expect(
					testRenderer.root.findAll(
						el =>
							el.props.testID === 'default-render-item' &&
							el.type === 'View'
					).length
				).toBe(USER_ITEMS.length)
			})
		})
	})

	describe('#onRenderItem', () => {
		it('renders each item using onRenderItem', () => {
			const reduxStore = createStore(
				getCombinedReducers(),
				{ [STATE_NAME]: { items: USER_ITEMS } },
				compose(applyMiddleware(ReduxThunk))
			)
			const onRenderItem = ({ item }) => {
				return (
					<Text testID="custom-on-render-item">
						Custom onRenderItem: {item.key}
					</Text>
				)
			}

			const testRenderer = TestRenderer.create(
				<PaginatableList
					onRenderItem={onRenderItem}
					store={reduxStore}
					customizedPaginationStateManager={paginationStateManager}
				/>
			)

			expect(testRenderer.toJSON()).toMatchSnapshot()
			expect(
				testRenderer.root.findAll(
					el =>
						el.props.testID === 'custom-on-render-item' &&
						el.type === 'Text'
				).length
			).toBe(USER_ITEMS.length)
		})
	})

	describe('#onRenderEmptyStatus', () => {
		it('renders empty state using onRenderEmptyStatus', () => {
			const reduxStore = createStore(
				getCombinedReducers(),
				{},
				compose(applyMiddleware(ReduxThunk))
			)
			const onRenderEmptyStatus = () => (
				<Text testID="custom-empty">Custom empty component</Text>
			)

			const testRenderer = TestRenderer.create(
				<PaginatableList
					onRenderEmptyStatus={onRenderEmptyStatus}
					store={reduxStore}
					customizedPaginationStateManager={paginationStateManager}
				/>
			)

			expect(testRenderer.toJSON()).toMatchSnapshot()
			expect(
				testRenderer.root.findAll(
					el =>
						el.props.testID === 'custom-empty' && el.type === 'Text'
				).length
			).toBe(1)
		})
	})

	describe('#onLoadMore', () => {
		describe('without custom onLoadMore', () => {
			it('calls paginationStateManager.loadMore with proper parameters', () => {
				const reduxStore = createStore(
					getCombinedReducers(),
					{},
					compose(applyMiddleware(ReduxThunk))
				)
				const pageNumberKey = 'pageNumber'
				const pageSizeKey = 'pageSize'
				const pageSize = 10
				const onCompleteLoadingMore = jest.fn()
				const onLoadError = jest.fn()
				const wrapper = shallow(
					<PaginatableList
						store={reduxStore}
						customizedPaginationStateManager={
							paginationStateManager
						}
						pageNumberKey={pageNumberKey}
						pageSizeKey={pageSizeKey}
						pageSize={pageSize}
						onCompleteLoadingMore={onCompleteLoadingMore}
						onLoadError={onLoadError}
					/>
				).dive()
				const instance = wrapper.instance()
				const loadMore = jest.fn(() => () => Promise.resolve())
				instance.paginationStateManager = { loadMore }

				instance.onLoadMore()

				expect(loadMore.mock.calls[0][0].pageNumberKey).toBe(
					pageNumberKey
				)
				expect(loadMore.mock.calls[0][0].pageSizeKey).toBe(pageSizeKey)
				expect(loadMore.mock.calls[0][0].pageSize).toBe(pageSize)
				expect(loadMore.mock.calls[0][0].pageNumber).toEqual(
					expect.any(Number)
				)
				expect(loadMore.mock.calls[0][1]).toBe(
					instance.onCompleteLoadingMore
				)
				expect(loadMore.mock.calls[0][2]).toBe(instance.onLoadError)
			})
		})

		describe('with custom onLoadMore', () => {
			it('calls onLoadMore with proper parameters', () => {
				const reduxStore = createStore(
					getCombinedReducers(),
					{},
					compose(applyMiddleware(ReduxThunk))
				)
				const pageNumberKey = 'pageNumber'
				const pageSizeKey = 'pageSize'
				const pageSize = 10
				const onLoadMore = jest.fn()
				const onCompleteLoadingMore = jest.fn()
				const onLoadError = jest.fn()
				const wrapper = shallow(
					<PaginatableList
						store={reduxStore}
						customizedPaginationStateManager={
							paginationStateManager
						}
						onLoadMore={onLoadMore}
						pageNumberKey={pageNumberKey}
						pageSizeKey={pageSizeKey}
						pageSize={pageSize}
						onCompleteLoadingMore={onCompleteLoadingMore}
						onLoadError={onLoadError}
					/>
				).dive()
				const instance = wrapper.instance()

				instance.onLoadMore()

				expect(onLoadMore.mock.calls[0][0].pageNumberKey).toBe(
					pageNumberKey
				)
				expect(onLoadMore.mock.calls[0][0].pageSizeKey).toBe(
					pageSizeKey
				)
				expect(onLoadMore.mock.calls[0][0].pageSize).toBe(pageSize)
				expect(onLoadMore.mock.calls[0][0].pageNumber).toEqual(
					expect.any(Number)
				)
				expect(onLoadMore.mock.calls[0][1]).toBe(
					instance.onCompleteLoadingMore
				)
				expect(onLoadMore.mock.calls[0][2]).toBe(instance.onLoadError)
			})
		})

		// Test the two core functionalities, which are loadMore and refresh in the PaginatableList. In order to achieve the testing, mock-up API responses need to be used in the test.

		// [] When loadMore method is called, mock-up API response, and check if the API call is properly called once with the correct parameters (pageNumber, pageSize, headers).

		// [DONE] If onLoadMore props exist, test the value of onLoadMore, which is a function, is called properly with correct params (including additional query params).

		// [] When refresh method is called, mock-up API response, and check if the API call is made with the first page, along with correct parameters(pageSize, headers).

		// [] When onRefresh props exist, test the value of onRefresh to be called with proper params(pageSize, headers, additional query params).
	})
})
