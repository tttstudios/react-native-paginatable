import React, { Component } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import PaginatableList from '../../PaginatableList';

export default class UserListComponent extends Component {

    constructor(props){
        super(props)
    }

    state = {
        highlightedItemIndex: null
    }

    renderListItem = ({ index, item }) => {
        return (
            <TouchableOpacity
                style={{ height: 150, borderBottomColor: 'black', borderBottomWidth: 1, padding: 5, backgroundColor: index == this.state.highlightedItemIndex ? 'yellow' : undefined }}
                onPress={() => {
                    this.setState({
                        highlightedItemIndex: index
                    })
                    if (this.props.onHighlightItem) {
                        this.props.onHighlightItem(index)
                    }   
                }}
            >
                <Text>User ID:{item.id}</Text>
                <Text>Email: {item.email}</Text>
            </TouchableOpacity>
        )
    }

    render() {
        return (
            <View style={{ flex:1 }}>
                <PaginatableList
                    onRenderItem={this.renderListItem}
                    customizedPaginationStateManager={this.props.paginatableListReducer}
                    extraData={this.state.highlightedItemIndex}
                    // pageSize={10}
                    // pageSizeKey={'size'}
                    // pageNumberKey={'page'}
                    onLoadMore={this.props.onLoadMore}
                    onRefresh={this.props.onRefresh}
                />
            </View>
        )
    }
}