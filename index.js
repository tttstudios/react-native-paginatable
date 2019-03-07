import React, { Component } from 'react';
import { FlatList, RefreshControl, View, Text, Image } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import PaginationStateManager from './PaginationStateManager';
import style from './style';

class PaginatableList extends Component {
    static propTypes = {
        refName                 : PropTypes.string,
        onRenderItem            : PropTypes.func,
        onRenderEmptyStatus     : PropTypes.func,
        onRenderSeparator       : PropTypes.func,
        numColumns              : PropTypes.number,
        extraData               : PropTypes.object, //extraData is used to make sure Flatlist will rerender when the object that passed in changes. Otherwise, Flatlist acts as PureComponent.
        key                     : PropTypes.string,
        keyExtractor            : PropTypes.func,
        pageNumberKey           : PropTypes.string,
        pageNumberStartFrom     : PropTypes.number,
        pageSizeKey             : PropTypes.string,
        pageSize                : PropTypes.number,
        paginatableSourceUrl    : PropTypes.string, // This is the endpoint url that could take pageSize and pageNumber as query params.
        customizedPaginationStateManager       : PropTypes.instanceOf(PaginationStateManager),
        onLoadMore              : PropTypes.func, //If you need to handle loadMore on your own. For examplem, you might need to query with more parmas than pageNumber and pageSize. 
        onRefresh               : PropTypes.func, //If you need to handle refresh on your own.
        onLoadError             : PropTypes.func,
        style                   : PropTypes.object,
        showsVerticalScrollIndicator            : PropTypes.bool,            
        contentContainerStyle   : PropTypes.object
    }

    static defaultProps = {
        refName             : "",
        numColumns          : 1,
        pageNumberStartFrom : 1, 
        pageSize            : 5,
        style               : { width: '100%' },
        contentContainerStyle           : {}, 
        showsVerticalScrollIndicator    : true
    }

    constructor(props) {
        super(props)

        this.state = {
            pageNumber: this.props.pageNumberStartFrom,
            isRefreshing: false,
            loading: false,
        }
    }

    renderItem = ({ index, item }) => {
        return (
            <View style={style.defaultCell}>
                <Text style={style.defaultCellText}>{`Item ${index}`}</Text>
                <Text style={style.defaultCellHint}>Use 'onRenderItem' props to overwrite the default cell.</Text>
                <Image style={style.defaultCellLogo} resizeMode={'contain'} source={require('./assets/TTTLogo_white.png')} />
            </View>
        )
    }

    componentDidMount() {
        if (this.props.onRef) {
            this.props.onRef(this)
        }
        this.onLoad()
    }

    componentWillMount() {
        this.configureReducer()
        // this.onLoad()
    }

    componentWillUnmount() {
        if (this.props.onRef) {
            this.props.onRef(null)
        }
        
        this.props.dispatch(this.paginationStateManager.reset())
    }

    configureReducer() {
        if (this.props.customizedPaginationStateManager) {
            this.paginationStateManager = this.props.customizedPaginationStateManager
        }
    }

    onReachedListEnd = () => {
        this.onLoadMore() 
    }

    onLoad = () => {
        this.onLoadMore()
    }

    onLoadMore = () => {
        const pageNumber = this.state.pageNumber

        if (this.state.loading) {
            return 
        }

        if (this.props.totalPagesNumber && pageNumber > this.props.totalPagesNumber) {
            if (__DEV__) console.log('List had been loaded completely!')
            return
        }

        this.setState({
            loading: true
        }, () => {
               
            const { pageNumberKey, pageSizeKey, pageSize } =  this.props
            if (this.props.onLoadMore) {
                this.props.onLoadMore({ pageNumberKey, pageSizeKey, pageNumber, pageSize })
            } else {
                this.props.dispatch(this.paginationStateManager.loadMore({ pageNumberKey, pageSizeKey, pageNumber, pageSize }, this.onCompleteLoadingMore, this.onLoadError))
            }

            this.setState({
                loading: false,
                pageNumber: this.state.pageNumber + 1
            })
        })
    }

    onRefresh = (refreshControl = true) => {
        const { pageNumberKey, pageSizeKey, pageSize } =  this.props
        this.setState({
            pageNumber: this.props.pageNumberStartFrom,
            isRefreshing: refreshControl ? true : false
        }, () => {
            if (this.props.onRefresh) {
                this.props.onRefresh({ onCompleteRefreshing: this.onCompleteRefreshing, pageNumberKey, pageSizeKey, pageNumber: this.state.pageNumber, pageSize })
            } else {
                this.props.dispatch(this.paginationStateManager.refresh({ pageNumberKey, pageSizeKey, pageNumber: this.state.pageNumber, pageSize }, this.onCompleteRefreshing, this.onLoadError))
            }

            this.setState({
                pageNumber: this.state.pageNumber + 1
            })
        })
    }

    onCompleteLoadingMore = () => {
        if (__DEV__) console.log('Load More Items Completed')
    }

    onCompleteRefreshing = () => {
        if (__DEV__) console.log('Refresh List Completed')
        this.setState({ isRefreshing: false })
    }

    onLoadError = (error) => {
        if (this.props.onLoadError) {
            this.props.onLoadError(error)
        }
        this.setState({ isRefreshing: false })
    }

    keyExtractor = (item, index) => item.id;

    renderList = () => {
        return (
            <FlatList
                data={this.props.items || []}
                key={this.props.key || undefined}
                keyExtractor={this.props.keyExtractor || undefined}
                extraData={this.props.extraData || undefined}
                renderItem={this.props.onRenderItem || this.renderItem}
                onEndReached={this.onReachedListEnd}
                onEndReachedThreshold={0.5}
                numColumns={this.props.numColumns}
                refreshControl={
                    <RefreshControl onRefresh={this.onRefresh} refreshing={this.state.isRefreshing}/>
                }
                ItemSeparatorComponent={this.props.onRenderSeparator || undefined}
                ListEmptyComponent={this.renderEmptyStatus}
                showsVerticalScrollIndicator={this.props.showsVerticalScrollIndicator}
                style={this.props.style}
                contentContainerStyle={this.props.contentContainerStyle}
            />
        )
    }

    renderEmptyStatus = () => {
        if (this.props.onRenderEmptyStatus) {
            return this.props.onRenderEmptyStatus()
        }
        return (
            <View style={style.defaultEmptyStatusContainer}>
                <Image style={style.defaultEmptyStatusLogo} resizeMode={'contain'} source={require('./assets/TTTLogo_white.png')} />
                <Text style={style.defaultCellText}>There is no items in the list.</Text>
            </View>
        )
    }

    render() {
        return this.renderList()
    }
}

const mapStateToProps = (state, props) => {
    let reducerName = props.customizedPaginationStateManager.name
    var items = []
    var totalPagesNumber = null
    if (props.customizedPaginationStateManager.customizedReducerPath) {
        var parentPath = props.customizedPaginationStateManager.customizedReducerPath.replace(/\s/g,'')
        if (parentPath && parentPath !== '') {
            pathPartials = parentPath.split('.')
            if (pathPartials.length > 0) {
                var targetObj = null
                pathPartials.filter(partial => partial && partial !== '').map((partial, index) => {
                    if (index === 0) {
                        targetObj = state[partial]
                    } else {
                        targetObj = targetObj[partial]
                    }
                })
                if (targetObj) {
                    items = targetObj.items || []
                    totalPagesNumber = targetObj.totalPagesNumber || null
                }
                return { items, totalPagesNumber }
            }
        } else {
            return {items, totalPagesNumber}
        }
        return {items, totalPagesNumber}
    }
    items = state[reducerName] && state[reducerName].items || []
    totalPagesNumber = state[reducerName] && state[reducerName].totalPagesNumber || null
    return {items, totalPagesNumber}
};

const mapDispatchToProps = (dispatch) => ({
    dispatch
});

export { PaginationStateManager }
export default connect(mapStateToProps, mapDispatchToProps)(PaginatableList);
