import React from 'react'
import { combineReducers, applyMiddleware, compose, createStore } from 'redux'
import ReduxThunk from 'redux-thunk'
import 'react-native'
import { Text } from 'react-native'

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
})
