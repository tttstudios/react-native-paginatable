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

		describe('with a few items', () => {
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
				return <Text>Custom onRenderItem: {item.key}</Text>
			}

			const tree = TestRenderer.create(
				<PaginatableList
					onRenderItem={onRenderItem}
					store={reduxStore}
					customizedPaginationStateManager={paginationStateManager}
				/>
			).toJSON()

			expect(tree).toMatchSnapshot()
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
				<Text>Custom empty component</Text>
			)

			const tree = TestRenderer.create(
				<PaginatableList
					onRenderEmptyStatus={onRenderEmptyStatus}
					store={reduxStore}
					customizedPaginationStateManager={paginationStateManager}
				/>
			).toJSON()

			expect(tree).toMatchSnapshot()
		})
	})
})
