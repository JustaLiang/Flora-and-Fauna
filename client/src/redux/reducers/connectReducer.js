import { CONNECTED } from '../actions'
const initialState = {
    isConnected: false,
    userAccount: null
  };

const connectReducer = (state = initialState, action) => {
    switch (action.type){
        case CONNECTED:
            console.log("action.payload",action)
            return {...state,isConnected:true,userAccount:action.payload}
        default:
            return state
    }
}

export default connectReducer