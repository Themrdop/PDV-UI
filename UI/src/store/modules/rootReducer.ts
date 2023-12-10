import { combineReducers } from 'redux';
import cart from './cart/reducer';
import saveOrder from './saveOrder/reducer';

export default combineReducers({
  cart,saveOrder
});
