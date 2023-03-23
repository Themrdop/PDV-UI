/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable no-param-reassign */
import produce from 'immer';
import { Product } from '../../../../models/models';

export interface Action {
  type: string;
  payload: Product
}

export default function cart(state = [] as Product[], action: Action) {
  switch (action.type) {
    case 'ADD_TO_CART':
      return produce(state, (draft: Product[]) => {
        const prodIndex = draft.findIndex((p: Product) => action.payload.id === p.id);

        if (prodIndex >= 0) {
          draft[prodIndex].amount += 1;
        } else {
          draft.push({
            ...action.payload,
            amount: 1,
          });
        }
      });

    case 'DELETE_FROM_CART':
      return produce(state, (draft: Product[]) => {
        const prodIndex = draft.findIndex((p: Product) => action.payload.id === p.id);

        if (prodIndex >= 0){
          if(draft[prodIndex].amount > 1){
            draft[prodIndex].amount -= 1
          }else{
            draft.splice(prodIndex,1);
          }
          
        } 
      });
      case 'CLEAN':
        return produce(state,(draft: Product[])=> {
          draft.splice(0,draft.length);;
        });
    default:
      return state;
  }
}
