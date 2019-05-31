import axios from 'axios'

export default class PaginateService {
	constructor(url, header = null, responseParser = null) {
		this.endpointUrl = url
		this.header = header
		this.responseParser = responseParser
	}
	static async getItems({
		headers,
		pageNumberKey,
		pageSizeKey,
		pageNumber = 0,
		pageSize = 5,
		endpointUrl,
		...args
	}) {
		if (__DEV__ && Object.keys(args).length > 0)
			console.log(
				`Extra params used in PaginateService getItems() : ${JSON.stringify(
					args,
					undefined,
					2
				)}`
			)
		var params = {
			...args
		}
		if (pageNumberKey) {
			params[pageNumberKey] = pageNumber
		}
		if (pageSizeKey) {
			params[pageSizeKey] = pageSize
		}

		requestConfig = {
			url: endpointUrl,
			params
		}
		if (headers) {
			if (__DEV__)
				console.log(
					`Pagination Request Header: ${JSON.stringify(
						headers,
						undefined,
						2
					)}`
				)
			requestConfig['headers'] = headers
		}
		return axios(requestConfig)
	}

	load({
		pageNumberKey,
		pageSizeKey,
		pageNumber = 0,
		pageSize = 5,
		endpointUrl,
		...args
	}, onSuccess = () => {}, onError = () => {}) {
		PaginateService.getItems({
			headers: this.getHeader(),
			pageNumberKey,
			pageSizeKey,
			pageNumber,
			pageSize,
			endpointUrl: this.endpointUrl,
			...args
		}).then((response) => {
			console.log(`pageNumber: ${pageNumber}`)
			console.log(response.data)
			if (this.responseParser) {
				const {
					items,
					totalPagesNumber
				} = this.responseParser(response.data)
				onSuccess({
					items,
					totalPagesNumber
				})
			} else {
				onSuccess({
					items: response.data
				})
			}
			
		}).catch(error => {
			if (__DEV__) console.log(JSON.stringify(error))
			onError(error)
		})
	}

	setEndpointUrl(url) {
		this.endpointUrl = url
	}

	setHeader(header) {
		this.header = header
	}

	getHeader() {
		if (__DEV__) {
			if (this.header) {
				console.log(
					`HTTP Headers: ${JSON.stringify(
						this.header,
						undefined,
						2
					)}`
				)
			} else {
				console.log(`No HTTP Headers Available`)
			}
		}
		return this.header
	}

	setResponseParser(onParsePaginationResponse = () => {}) {
		this.responseParser = onParsePaginationResponse
	}
}
