import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useDispatch } from 'react-redux';
import { CSSTransition } from "react-transition-group";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./PaymentModal.css";
import { Product } from "../../models/models";
import './OrderNameModal.css';
import toast, { Toaster } from "react-hot-toast";

export interface Props {
  show: boolean;
  onClose(result: boolean): void;
  products: Product[];
}

const OrderNameModal: React.FC<Props> = ({ show, onClose, products }) => {

  const dispatch = useDispatch();

  const [name, setName] = useState('');

  function uuidv4() { 
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    .replace(/[xy]/g, function (c) { 
        const r = Math.random() * 16 | 0,  
            v = c === 'x' ? r : (r & 0x3 | 0x8); 
        return v.toString(16); 
    }); 
}

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

  return ReactDOM.createPortal(
    <CSSTransition
      in={show}
      unmountOnExit
      timeout={{ enter: 0, exit: 300 }}>
      <div className="modal" onClick={() => onClose(false)}>
        <div className="modal-content" style={{ width: '500px' }} onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <button
              type="button"
              className="close"
              onClick={() => onClose(false)}>
              &times;
            </button>
          </div>
          <div className="modal-body">
            <input
              type='search'
              placeholder='Nombre'
              className='search-input'
              onChange={(e) => setName(e.target.value)}
            />
            <br />
            <br />
            <button className='btn btn-primary' onClick={() => {
              if(name === ''){
                toast.error('Debe ingresar un nombre');
                return;
              }
              dispatch({ type: 'ADD_TO_ORDER', payload: { id:uuidv4(), name: name, products: products, date: Date.now()} })
              onClose(true);
            }}>
              Guardar
            </button>
          </div>
        </div>
        <Toaster />
      </div>
    </CSSTransition>,
    document.getElementById("root")!
  );
};

export default OrderNameModal;
