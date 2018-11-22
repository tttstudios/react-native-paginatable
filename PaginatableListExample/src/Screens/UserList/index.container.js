import React, { Component } from 'react';
import UserListComponent from './index.component';
import { connect } from 'react-redux';
import { customizedPaginationStateManager } from '@Reducers/CustomizedPaginationListReducer';

class UserListContainer extends Component {
    static navigationOptions = {
        title  : 'User List'
    };

    constructor(props) {
        super(props);
    }

    onHighlightUser = (index) => {
        this.props.dispatch(customizedPaginationStateManager.highlightItem({ index: index, extra: 'extra' }))
    }

    onLoadMoreUsers = ({ ...args }) => {
        this.props.dispatch(customizedPaginationStateManager.loadMore({ ...args, keyword: '123', isValid: true }))
        //The keyword and isValid param is an example of querying more params other than pageNumber and pageSize. 
    }

    onRefreshUserList = ({onCompleteRefreshing, ...args}) => {
        this.props.dispatch(customizedPaginationStateManager.refresh({ ...args, keyword: '123', isValid: true }, onCompleteRefreshing))
        //The keyword and isValid param is an example of querying more params other than pageNumber and pageSize. 
    }

    render() {
        return (
            <UserListComponent
                paginatableListReducer={customizedPaginationStateManager}
                onHighlightItem={this.onHighlightUser}
                // onLoadMore={this.onLoadMoreUsers}
                // onRefresh={this.onRefreshUserList} 
            />
        )
    }
}

const mapDispatchToProps = (dispatch) => ({
    dispatch
});

export default connect(null, mapDispatchToProps)(UserListContainer);