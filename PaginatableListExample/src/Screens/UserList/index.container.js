import React, { Component } from 'react';
import UserListComponent from './index.component';
import { connect } from 'react-redux';
import { customizedPaginationStateManager } from '@Reducers/CustomizedPaginationListReducer';

class UserListContainer extends Component {
    static navigationOptions = {
        title  : 'Paginatable User List'
    };

    constructor(props) {
        super(props);
    }

    onHighlightUser = (index) => {
        this.props.dispatch(customizedPaginationStateManager.highlightItem({ index: index, extra: 'extra' }))
    }

    onLoadMoreUsers = ({ ...args }, onCompleteLoadMore, onLoadError) => {
        this.props.dispatch(customizedPaginationStateManager.loadMore({ ...args, keyword: '123', isValid: true }, onCompleteLoadMore, onLoadError))
        //The keyword and isValid param is an example of querying more params other than pageNumber and pageSize. 
    }

    onRefreshUserList = ({ ...args }, onCompleteRefreshing, onLoadError) => {
        this.props.dispatch(customizedPaginationStateManager.refresh({ ...args, keyword: '123', isValid: true }, onCompleteRefreshing, onLoadError))
        //The keyword and isValid param is an example of querying more params other than pageNumber and pageSize. 
    }

    onCompleteLoadMore = () => {
        if (__DEV__) console.log('Customized completion handler of loading more items.')
    }

    onCompleteRefresh = () => {
        if (__DEV__) console.log('Customized completion handler of refreshing the list.')
    }

    render() {
        return (
            <UserListComponent
                paginatableListReducer={customizedPaginationStateManager}
                onHighlightItem={this.onHighlightUser}
                //onLoadMore={this.onLoadMoreUsers}
                //onCompleteLoadMore={this.onCompleteLoadMore}
                onRefresh={this.onRefreshUserList} 
                onCompleteRefresh={this.onCompleteRefresh}
            />
        )
    }
}

const mapDispatchToProps = (dispatch) => ({
    dispatch
});

export default connect(null, mapDispatchToProps)(UserListContainer);