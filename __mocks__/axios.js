import { data as users } from './users.json'

export default jest.fn(() => {
    console.log('Default Mocked Axios.GET')
    return Promise.resolve({ data: users })
})