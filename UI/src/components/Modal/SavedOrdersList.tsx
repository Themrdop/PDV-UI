import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { CSSTransition } from "react-transition-group";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./PaymentModal.css";
import { useSelector, useDispatch } from 'react-redux';
import * as s from './SavedOrderList';
import { SaveOrder, SavedOrders } from "../../models/models";

export interface Props {
    show: boolean;
    onClose(result: boolean): void
}

const SavedOrdersList: React.FC<Props> = ({ show, onClose }) => {

    function closeOnEscapeKeyDown(e: { charCode: any; keyCode: any; }) {
        if ((e.charCode || e.keyCode) === 27) {
            onClose(false);
        }
    }

    useEffect(() => {
        document.body.addEventListener("keydown", closeOnEscapeKeyDown);
        return function cleanup() {
            document.body.removeEventListener("keydown", closeOnEscapeKeyDown);
        };
    });

    const dispatch = useDispatch();

    const orders = useSelector((state: SavedOrders) => state.saveOrder.map((order) => ({
        ...order,
    })));

    function handleClick(selectedOrder: SaveOrder): void {
        selectedOrder.products.map((p) => {
            dispatch({ type: 'ADD_TO_CART', payload: p });
        });

        dispatch({ type: 'DELETE_ORDER', payload: selectedOrder });

        onClose(false);
    }

    function handleDelete(selectedOrder: SaveOrder, event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
        event.stopPropagation();
        dispatch({ type: 'DELETE_ORDER', payload: selectedOrder });
        if (orders.length === 1) {
            onClose(false);
        }
    }

    return ReactDOM.createPortal(
        <CSSTransition
            in={show}
            unmountOnExit
            timeout={{ enter: 0, exit: 300 }}>
            <div className="modal">
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <div className="card">
                        <div className="container" style={{ padding: '10px' }}>
                            <div className="row row-cols-auto">
                                {orders.map((o, index) => (
                                    <div className="col" style={{ paddingBottom: '10px' }} onClick={() => handleClick(o)}>
                                        <s.Receipt>
                                            <div className="row" style={{paddingBottom: '5px'}}>
                                                <div className="col-8"><h4 >{o.name}</h4></div>
                                                <div className="col-4"><s.SmallButton onClick={(e) => handleDelete(o, e)}>x</s.SmallButton></div>
                                            </div>
                                            <s.Item>
                                                <div>Descripción</div>
                                                <div>Cantidad</div>
                                            </s.Item>
                                            {o.products.map((p, index) => (
                                                <s.Item>
                                                    <div>{p.name}</div>
                                                    <div>{p.amount}</div>
                                                </s.Item>
                                            ))}
                                        </s.Receipt>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button onClick={() => onClose(false)} className="btn btn-primary">
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </CSSTransition>,
        document.getElementById("root")!
    );
};

export default SavedOrdersList;