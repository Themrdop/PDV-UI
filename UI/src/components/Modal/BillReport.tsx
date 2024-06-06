import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { CSSTransition } from "react-transition-group";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./PaymentModal.css";
import type { Bill } from "../../models/models";
import { ProductList } from "../ProductList";
import { ListGroup } from "react-bootstrap";

export interface Props {
  show: boolean;
  bill: Bill;
  onClose(result: boolean): void
}

const BillReport: React.FC<Props> = ({ show, bill, onClose }) => {

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
      <div className="modal">
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="card">
            <div className="container" style={{ padding: '10px' }}>
              <div className="row">
                <div className="col">
                  <label>Consecutivo:</label>&nbsp;<label>{bill.consecutive}</label><br /><br />
                  <label>Total:</label>&nbsp;<label>{bill.total}</label><br /><br />
                  <label>Medio de pago:</label>&nbsp;<label>{toReadible(bill.medioPago)}</label><br /><br />
                  <label>Fecha:</label>&nbsp;<label>{bill.date}</label><br /><br />
                </div>
                <div className="col">
                  <ProductList>
                    {
                      bill.products.map((product, index) => (
                        <ListGroup key={index}>
                          <ListGroup.Item action key={index}>
                            {product.name} {product.amount}
                          </ListGroup.Item>
                        </ListGroup>
                      ))}
                  </ProductList>
                </div>
              </div>
              {bill.electronicBill.clave != '' &&
                <>
                  <br />
                  <hr className="mt-1 mb-1" />
                  <br />
                  <div className="card">
                    <div className="card-body">
                      <div className="row">
                        <div className="col">
                          <label>Clave:</label>&nbsp;<label>{bill.electronicBill.clave}</label><br /><br />
                          <label>Enviada a:</label>&nbsp;<label>{bill.electronicBill.recipient.name}</label><br /><br />
                          <label>Correo de destino:</label>&nbsp;<label>{bill.electronicBill.recipient.email}</label><br /><br />
                          <label>Cedula:</label>&nbsp;<label>{bill.electronicBill.recipient.numeroIdentificacion}</label><br /><br />
                          <label>Locacion de factura:</label>&nbsp;<a href="{bill.electronicBill.location}" className="card-link">{bill.electronicBill.location}</a><br /><br />
                        </div>
                      </div>
                    </div>
                  </div>
                </>}
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

  function toReadible(medioPago: number[]) {
    let concat = '';
    medioPago.map((x: number) => {
      switch (x) {
        case 0:
          concat += 'SINPE'
          break;
        case 1:
          concat += 'Tarjeta'
          break;
        case 3:
          concat += 'Efectivo'
          break;
        default:
          break;
      }
    });
    return concat;
  }
};

export default BillReport;