import { produce } from 'immer';
import { Product, SaveOrder } from '../../../../models/models';

export interface Action {
    type: string;
    payload: SaveOrder;
}

export default function saveOrder(state = [] as SaveOrder[], action: Action) {
    switch (action.type) {
        case 'ADD_TO_ORDER':
            return produce(state, (draft: SaveOrder[]) => {
                const prodIndex = draft.findIndex((p: SaveOrder) => action.payload.id === p.id);

                draft.push({
                    ...action.payload
                });
            });

        case 'DELETE_FROM_ORDER':
            return produce(state, (draft: SaveOrder[]) => {
                const prodIndex = draft.findIndex((p: SaveOrder) => action.payload.id === p.id);

                if (prodIndex >= 0) {
                    draft.splice(prodIndex, 1);
                }
            });
        case 'CLEAN':
            return produce(state, (draft: Product[]) => {
                draft.splice(0, draft.length);;
            });
        default:
            return state;
    }
}