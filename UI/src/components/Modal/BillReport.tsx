import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { CSSTransition } from "react-transition-group";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./PaymentModal.css";
import api from "../../service/api";

export interface Bill {
  consecutive: number;
  date: string;
  total: number;
  tax: number;
}

export interface Props {
  show: boolean;
  onClose(result: boolean): void
}

const BillReport: React.FC<Props> = ({show, onClose}) => {
  
  function closeOnEscapeKeyDown (e: { charCode: any; keyCode: any; }){
    if ((e.charCode || e.keyCode) === 27) {
      onClose(false);
    }
  }

  useEffect(() => {
    document.body.addEventListener("keydown", closeOnEscapeKeyDown);
    return function cleanup() {
      document.body.removeEventListener("keydown", closeOnEscapeKeyDown);
    };
  }, []);

  const date = new Date()

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [bills, setBills] = useState<Bill[]>([]); 

  async function handlePay(){
    console.log(startDate);
    console.log(endDate);
    const response = await api.get<Bill[]>(
      '/GetAllBills', { params: { dateBeginig: startDate, dateEnd: endDate } }
    );
    if(response.status === 200){
      console.log(response.data);
      setBills(response.data);
    }
  }

  const divStyle = {
    display: 'flex',
  };

  return ReactDOM.createPortal(
    <CSSTransition
      in={show}
      unmountOnExit
      timeout={{ enter: 0, exit: 300 }}>
      <div className="modal">
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="h2">Informe de facturacion</h2>
          </div>
          <div className="App container mt-1">
            <div className="mb-1" style={divStyle}>
            </div>
            <div id="divToPrint" className="m-1">
            <div className="row d-flex justify-content-center">
              <div className="col-md-3">
                  <div className="card">
                      <div className="products p-2">
                      <input type="date" onChange={(e) => setStartDate(new Date(e.target.value))} />
                      <input type="date" onChange={(e) => setEndDate(new Date(e.target.value))} />
                          <table className="table table-borderless">
                              <tbody>
                                  <tr className="add">
                                      <td>Consecutivo</td>
                                      <td>Fecha</td>
                                      <td>Total</td>
                                      <td>Impuesto</td>
                                  </tr>
                                  {bills.map((item, index) => {
                                    return (
                                      <tr key={index}>
                                        <td>{item.consecutive}</td>
                                        <td>{item.date}</td>
                                        <td>{item.total}</td>
                                        <td>{item.tax}</td>
                                      </tr>
                                    );
                                  })}
                              </tbody>
                          </table>
                      </div>
                  </div>
              </div>
          </div>
        </div>
      </div>
          <div className="modal-footer">
          <button onClick={handlePay} className="btn btn-primary">
              Consultar
            </button>
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

export default BillReport;