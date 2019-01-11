![PaginatableList](https://raw.githubusercontent.com/Twotalltotems/react-native-paginatable/develop/assets/paginatablelist_banner.jpg?token=AP1X8MZ26iYe8ToP9Rrvc0l7d4ZFYai-ks5cISTxwA%3D%3D)
# PaginatableList

**PaginatableList** is a list component developed by **TTT Studios** Mobile Team. The purpose is to avoid repetitive logic that handles "loading more" and "pull-to-refresh" actions in a list, via pagination using a REST API. **PaginatableList** is built on top of React Native's `FlatList`, but it's available to manage the list items automatically and store them in Redux store. 

By default, it provides:

*  Reaching the list bottom to load more items after making a GET API call.
*  Pull-to-refresh the whole list.

However, the item cell appearance is customizable and more actions can be added, independently from the two default actions coming by default in the package.

<a href="https://imgflip.com/gif/2nvebz"><img src="https://i.imgflip.com/2nvebz.gif" title="made at imgflip.com"/></a>

## Installation
1. Install paginatable-list
`yarn add @twotalltotems/paginatable-list` or `npm install @twotalltotems/paginatable-list --save` 
2. Install dependencies
`yarn add react-redux && yarn add redux-thunk && yarn add reduxsauce && yarn add axios && yarn add prop-types` or `npm install react-redux && npm install redux-thunk && npm install reduxsauce && npm install axios && npm install prop-types`


## Dependencies

This project needs the follow dependencies inside your project.

1. `react-redux`
1. `reduxsauce`
2. `redux-thunk`
1. `prop-types`
1. `axios`


## Basic Usage

#### Initialize PaginationStateManager Instance

In order to use `PaginatableList`, first create a `PaginationStateManager` instance. There are two required parameters:


```
import { PaginationStateManager } from '@twotalltotems/paginatable-list';

const BASE_URL = 'http://myapi.endpoint';
const paginationStateManager = new PaginationStateManager('users', `${BASE_URL}/users`);

```

| Parameter   | Description |
|-------------|-------------|
| key         |  Redux store key that will be used to store list items. In this example, `users` is the key that will be used to store the item list in the Redux store.  |
| endpointUrl |  The paginatable endpoint URL for requesting content for each page with pageNumber and pageSize. In this example, `${BASE_URL}/users` is the endpointUrl. |

#### Link Redux Store

```
import { combineReducers, applyMiddleware, compose } from 'redux';
import Reactotron from 'reactotron-react-native'

const getCombinedReducers = () => {
    return combineReducers({
        users : paginationStateManager.reducer(), // 'users' should be kept the same as the first param in PaginationStateManager instance created in the last step.
    });
}

const reduxStore = Reactotron.createStore(
	getCombinedReducers(),
	{}, //Initial State of Redux Store
	compose(
		applyMiddleware(ReduxThunk)
	)
)
```
*Notice: The key used in `combineReducers` need to be consistant with the key that is used to initialize `PaginationStateManager` in the last step, which in this example, is `users`.*

#### Use PaginatableList Component

Inside your component, you can use this code. 

```
render() {
    return (
        <View style={{ flex:1 }}>
            <PaginatableList
                onRenderItem={this.renderListItem}
                customizedPaginationStateManager={paginationStateManager}
            />
        </View>
    )
}

renderListItem = ({ index, item }) => {
    return (
        <TouchableOpacity>
            <Text>User ID:{item.id}</Text>
            <Text>Email: {item.email}</Text>
        </TouchableOpacity>
    )
}
```

1. `renderListItem` is used to render a specific list item. `PaginatableList` exists as the scrollable container of the list items that will complete for you, the two package operations: loading more items and pull-to-refresh. With this in mind, you can use this `PaginatableList` container to holder whatever you prefer. It could be `View`, `TouchableOpacity`, or your customized component.
2. In this example, `renderListItem` params `item` is the object within the array that is stored in Redux store. Currently, `PaginationStateManager` is storing whatever the server response is. In this example, the local server is returning an array of objects, and each object contains `id`, `email`, and `password`. Therefore, Redux store is storing by default the exact same format of the object.


### Customization

If you need more than loading more items and pull-to-refresh, continue reading.

For many lists in real life situations, you would need more than only two common operations for the list. Example for an extra operation could be click a heart icon to like an item, delete an item, or highlight an item. Below there's an explanation for the highlighting example.

#### Subclass PaginationStateManager

To customize, first subclass from `PaginatableListReducer`.

```
import { PaginationStateManager } from '@twotalltotems/paginatable-list';

export default class CustomizedPaginationStateManager extends PaginationStateManager {
    constructor(name, url) {
        super(name, url)
    }
}
```

#### Add Extra Action

Initialize instance of `CustomizedPaginationStateManager`, and add extra action to it.

```
export const customizedPaginationStateManager = new CustomizedPaginationStateManager('customized_users', 'users')

customizedPaginationStateManager.addActions([
    {
        type: 'highlightItem',
        payload: ['index'],
        handler: (state, { index }) => {
            return {
                ...state,
                highlightedItemIndex: index
            }  
        }
    }
])
```

#### Dispatch The Extra Action

First, let's make the list item clickable, and make it call `onHighlightItem` when the item is clicked.

```
renderListItem = ({ index, item }) => {
    return (
        <TouchableOpacity 
       		onPress={() => {
                this.onHighlightItem(index) 
            	}}
        >
            	<Text>User ID:{item.id}</Text>
            	<Text>Email: {item.email}</Text>
        </TouchableOpacity>
    )
}

onHighlightItem = (index) => {
    this.props.dispatch(customizedPaginationStateManager.highlightItem({ index: index }))
}
```

```
render() {
    return (
        <UserListComponent
           	paginatableListReducer={customizedPaginationStateManager}
            	onHighlightItem={this.onHighlightItem}
        />
    )
}
   
```

#### Overwrite the Extra Action Handler

Whenever you add extra actions to the subclass instance of `PaginationStateManager`, this library will generate a default handler for you which will dispatch the action directly. However, if you would like to do more before dispatching the action (e.g. make an API call), you can overwrite the default handler. 
  
```
import { PaginationStateManager } from '@twotalltotems/paginatable-list';

export default class CustomizedPaginationStateManager extends PaginationStateManager {
    constructor(name, url) {
        super(name, url)
    }

    highlightItem = ({ index, extra }) => {
        console.log('Overwrite Default highlightItem() function. For example, you might need to do network call before dispatch an action.')
        // This is where you could add the API call.
        return (dispatch) => {
            dispatch(this.actions.highlightItem(index, extra))
        }
    }; 
}
```

#### Customize Empty Status
Customize empty status for PaginatableList via `onRenderEmptyStatus` props.

```
renderEmptyStatus = () => {
    return (
        <View style={{ flex:1, alignItems: 'center', justifyContent: 'center' }}>
            <View>
              	<Image 
            		style={style.emptyStatusLogo} 
            		resizeMode={'contain'} 
            		source={require('path/to/image.png')} 
            	/>
                <Text>Customized Empty Status</Text>
            </View>
        </View>
    )
}

    
render() {
    return (
        <View style={{ flex:1 }}>
            <PaginatableList
                onRenderItem={this.renderListItem}
                onRenderEmptyStatus={this.renderEmptyStatus}
                customizedPaginationStateManager={this.props.paginatableListReducer}
            />
        </View>
    )
}
```

## Roadmap

* [x] Customizable list empty status.
* [ ] Remove `reduxsauce` dependency.
* [x] Make the `endpointUrl` param take a full URL.
* [ ] Remove Redux as a dependency (also up for public discussion).

 
