![PaginatableList](https://raw.githubusercontent.com/Twotalltotems/react-native-paginatable/master/assets/paginatablelist_banner.jpg?token=AP1X8BHCtNdfoIF-umaN5b9-3Ih4G2Q9ks5cTl8WwA%3D%3D)
# PaginatableList

**PaginatableList** is a list component developed by **TTT Studios** Mobile Team. The purpose is to avoid repetitive logic that handles "loading more" and "pull-to-refresh" actions in a list, via pagination using a REST API. **PaginatableList** is built on top of React Native's `FlatList`, but it's available to manage the list items automatically and store them in Redux store. 

By default, it provides:

*  Reaching the list bottom to load more items after making a GET API call.
*  Pull-to-refresh the whole list.
*  Store list items with Redux store. 

However, the item cell appearance is customizable and more actions can be added, independently from the two default actions coming by default in the package.

<a href="https://imgflip.com/gif/2nvebz"><img src="https://i.imgflip.com/2nvebz.gif" title="made at imgflip.com"/></a>

## Installation
1. Install paginatable-list
`yarn add @twotalltotems/paginatable-list` or `npm install @twotalltotems/paginatable-list --save` 
2. Install dependencies
`yarn add redux && yarn add react-redux && yarn add redux-thunk && yarn add reduxsauce && yarn add axios && yarn add prop-types` or `npm install redux && npm install react-redux && npm install redux-thunk && npm install reduxsauce && npm install axios && npm install prop-types`


## Dependencies

This project needs the follow dependencies inside your project.

1. `redux`
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

const onParseResponseData = (data) => {
    const { results } = data
    return {
        items: results
    }
}

const paginationStateManager = new PaginationStateManager('users', `${BASE_URL}/users`, onParseResponseData);

```

| Parameter   | Description |
|-------------| -------------|
| name        |Redux store key that will be used to store list items. In this example, `users` is the key that will be used to store the item list in the Redux store.  |
| endpointUrl |  The paginatable endpoint URL for requesting content for each page with pageNumber and pageSize. In this example, `${BASE_URL}/users` is the endpointUrl. |
| onParsePaginationResponse | Depends on the different structure of the API response, this method is required to parse list item out of the whole response data. This method needs to return a javascript object that contains key `items` which holds the array of items in the list. |
| customizedReducerPath | Optional. This paramter is required unless you'd like to embed pagination reducer into another reduer. Please refer Customization section for more details.|
| requestHeaders | Optional. Pass in this paramter if the pagination server needs HTTP headers. This parameter requires a Promise.|

#### Link Redux Store

```
import { combineReducers, applyMiddleware, compose, createStore } from 'redux';
import ReduxThunk from 'redux-thunk';

const getCombinedReducers = () => {
    return combineReducers({
        users : paginationStateManager.reducer(), // 'users' should be kept the same as the first param in PaginationStateManager instance created in the last step.
    });
}

const reduxStore = createStore(
	getCombinedReducers(),
	{}, //Initial State of Redux Store
	compose(
		applyMiddleware(ReduxThunk)
	)
)
```
*Notice: The key used in `combineReducers` need to be consistant with the key that is used to initialize `PaginationStateManager` in the last step, which in this example, is `users`.*

#### Use PaginatableList Component

Inside your component, you can use this code. Don't forget to import PaginatableList at the top of the component first.

```
import PaginatableList from '@twotalltotems/paginatable-list';

```

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

#### Props of PaginatableList

| Props   | Description |
|---------| -------------|
| customizedPaginationStateManager | Instance of PaginationStateManager that manager the items in the list.|
| onRenderItem | Render list item. |
| onRenderEmptyStatus | Render the empty status of the list when there's no items loaded in the list. |
| onRenderSeparator | Render separator of the list. | 
| pageNumberKey | The key of page number in HTTP request. |
| pageSizeKey | The key of page size in HTTP request. |
| pageSize | Maximum amount of items that are returned in each request. |
| pageNumberStartFrom | starting page of the list. |
| onLoadMore | Overwrite list loading more items if you need to handle loadMore on your own. For examplem, you might need to query with more parmas than pageNumber and pageSize.  |
| onRefresh | Overwrite list refreshing method if you need to handle refresh on your own. |
| onLoadError | Handle the loading error. |


Besides, PaginatableList accpets props of FlatList that include `numColumns`, `extraData`, `keyExtractor`, `style`, and `showsVerticalScrollIndicator`.

### Customization

If you need more than loading more items and pull-to-refresh, continue reading.

#### Overwrite onLoadMore/onRrefresh

Defaultly, PaginatableList will only use `pageSize` and `pageNumber` as query parameters to make HTTP request to dynamically load more items and refresh the full list. However, if you need extra params, for example, you'd like to add keyword searching for the list, then the HTTP request will need extra param `keyword`. In this case, you need to overwrite `onLoadMore` and `onRefresh` for `PaginatableList`. 

```
<PaginatableList
    onRenderItem={this.renderListItem}
    customizedPaginationStateManager={paginationStateManager}
    onLoadMore={this.onLoadMore}
    onRefresh={this.onRefresh}
/>
```

```
onLoadMore = ({ ...args }) => {
    this.props.dispatch(paginationStateManager.loadMore({		 ...args,
        keyword: 'keyword'
    }))
}

onRefresh = ({onCompleteRefreshing, ...args}) => {
    this.props.dispatch(paginationStateManager.refresh({
        ...args,
        keyword: 'keyword'
    }, (data) => {
        onCompleteRefreshing(data)
    }))
}

```

#### Subclass PaginationStateManager

For many lists in real life situations, you would need more than only two common operations for the list. Example for an extra operation could be click a heart icon to like an item, delete an item, or highlight an item. Below there's an explanation for the highlighting example.

To customize, first subclass from `PaginatableListReducer`.

```
import { PaginationStateManager } from '@twotalltotems/paginatable-list';

export default class CustomizedPaginationStateManager extends PaginationStateManager {
    constructor(name, endpointUrl, onParsePaginationResponse, customizedReducerPath = null) {
        super(name, endpointUrl, onParsePaginationResponse, customizedReducerPath)
    }
}
```

#### Add Extra Action

Initialize instance of `CustomizedPaginationStateManager`, and add extra action to it.

```
const onParsePaginationData = (data) => {
    const { results } = data
    return {
        items: results
    }
}

export const customizedPaginationStateManager = new CustomizedPaginationStateManager('customized_users', 'users', onParsePaginationData)

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

#### Customize HTTP Request Headers
When accessing a paginatable endpoint that requires HTTP headers, we need to pass in the `requestHeader` parameter in the constructor of PaginationStateManager. For example, the endpoint needs a token from the headers to access. 

```
const getRequestHeaders = async() => {
    const token = await AsyncStorage.getItem('TOKEN')
    if (token) {
        const headers = {
            Accept : 'application/json', 
            Authorization : `Bearer ${token}`
        }
        return headers
    }

    return {
        Accept : 'application/json'
    }
}

const paginationStateManager = new PaginationStateManager('users', `${BASE_URL}/users`, onParseResponseData, 'users', getRequestHeaders );

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

#### Embed Pagination Reducer into Another Reducer

By default, parameter `customizedReducerPath` is not required, and the `name` paramter will be used as the key to store the list items in the Redux store. However, if you'd like to embed pagination reducer into another reducer. 

For exmaple, if we use a paginatale list to load students of a certain teacher. Teacher is already stored in the Redux store, and we need to store the students in the same object with teacher. So we'd like the app state stored in Redux store looks like the javacript object below. 

```
{
	teacher: {
		students: {
			items: ['student 1', 'student 2', 'student 3']
		}
	}
} 
```
In this case, we need to pass `'teacher.students'` as the `customizedReducerPath` parameter, and the `name` parameter will not be used as the `key` of paginatable reducer anymore. 

```
const reduxStore = createStore(
  	combineReducers({
  		teacher: combineReducers({
  			students : paginationStateManager.reducer()
  		})
  	}),
	{}, //Initial State of Redux Store
	compose(
		applyMiddleware(ReduxThunk)
  ),
)
```


## Roadmap

* [x] Customizable list empty status and list separator.
* [x] Customizable HTTP headers and HTTP response parsing. 
* [ ] Remove `reduxsauce` dependency.
* [ ] Remove Redux as a dependency.

## Premium Support By TTT Studio

PaginatableList is presented by [TTT Studio](https://ttt.studio) Mobile Development Team. We build experiences and solutions for industry leaders and those with their sights set on the future.

<div align="right">
	<img src="https://ttt.studio/wp-content/themes/tttwordpresstheme/imgs/ttt-colour.png" width="200px"/>
	<h5>Empowering Business Through Technology</h5>
</div>

<table>
    <tr border="0" style="border: none; ">
        <th border="0" style="border-left: none; border-right: none;">
        <div>
        	<img src="https://avatars3.githubusercontent.com/u/16603120?s=460&v=4" width="60px;" style="border-radius: 50%;"/>
        	<br />
        	<sub><a href="https://github.com/BeckyWu220">Becky Wu</a></sub> <br />
        </div>
        </th>
        <th border="0" style="border-left: none; border-right: none;">
        	<img src="https://avatars3.githubusercontent.com/u/440097?s=460&v=4" width="60px;" style="border-radius: 50%;"/>
        	<br />
        	<sub><a href="https://github.com/fpena">Felipe Peña</a></sub> <br />
        </th>
    </tr>
</table>


