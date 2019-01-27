import axios from 'axios';

export default class PaginateService {
    static async getItems({ headers, pageNumberKey, pageSizeKey, pageNumber = 0, pageSize = 5, endpointUrl, ...args}) {
        if (__DEV__ && Object.keys(args).length > 0) console.log(`Extra params used in PaginateService getItems() : ${JSON.stringify(args, undefined, 2)}`)
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
            if (__DEV__) console.log(`Pagination Request Header: ${JSON.stringify(headers, undefined, 2)}`)
            requestConfig['headers'] = headers
        }
        

        return axios(requestConfig);
    }
}