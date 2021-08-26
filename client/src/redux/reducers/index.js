import connectReducer from './connectReducer';
import { combineReducers } from 'redux';;

const rootReducer = combineReducers({
    connect: connectReducer
});

export default rootReducer;