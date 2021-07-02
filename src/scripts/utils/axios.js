import axios from 'axios'

// create an axios instance
const service = axios.create({
    baseURL: process.env.VUE_APP_BASE_API,
    timeout: 60000
})

// request interceptor
service.interceptors.request.use(
    config => {
        // do something before request is sent
        return config
    },
    error => {
        // do something with request error
        console.log(error)
        return Promise.reject(error)
    }
)

// response interceptor
service.interceptors.response.use(
    response => {
        return response.data
    },
    error => {
        console.log('err' + error) // for debug
        return Promise.reject(error)
    }
)

export default service
