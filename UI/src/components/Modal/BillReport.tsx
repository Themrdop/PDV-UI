import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { CSSTransition } from "react-transition-group";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./PaymentModal.css";
import api from "../../service/api";
import { get } from "https";

export interface Bill {
  consecutive: number;
  date: string;
  total: number;
  medioPago: number[];
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
  });

  const [startDate, setStartDate] = useState(new Date(Date.now()));
  const [endDate, setEndDate] = useState(new Date(Date.now()));
  const [bills, setBills] = useState<Bill[]>([]); 
  const [totalEfectivo, setTotalEfectivo] = useState<number>(0);
  const [totalTarjeta, setTotalTarjeta] = useState<number>(0);
  const [totalSINPE, setTotalSINPE] = useState<number>(0);

  async function handlePay(){
    const response = await api.get<Bill[]>(
      '/GetAllBills', { params: { dateBeginig: startDate, dateEnd: endDate } }
    );
    if(response.status === 200){
      setBills(response.data);
      setTotalEfectivo(getBills(0, response.data));
      setTotalTarjeta(getBills(1, response.data));
      setTotalSINPE(getBills(2, response.data));
    }
  }

  const divStyle = {
    display: 'flex',
  };

  function getBills(medioPago: number, input: Bill[]){
    let result = 0
    input.forEach(bill =>{
      if(bill.medioPago.includes(medioPago)){
        result += bill.total;
      }
    });

    return result;
  }

  return ReactDOM.createPortal(
    <CSSTransition
      in={show}
      unmountOnExit
      timeout={{ enter: 0, exit: 300 }}>
      <div className="modal">
        <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="card">
  <div className="card-body mx-4">
    <div className="container">
      <p className="my-5 mx-5" style={{fontSize: 30}}>Cierre de caja</p>
      <div className="row">
        <hr/>
        <div className="col-xl-10">
          <p>Ventas en efectivo</p>
        </div>
        <div className="col-xl-2">
          <p className="float-end">{totalEfectivo}
          </p>
        </div>
        <hr/>
      </div>
      <div className="row">
        <div className="col-xl-10">
          <p>Ventas por tarjeta</p>
        </div>
        <div className="col-xl-2">
          <p className="float-end">{totalTarjeta}
          </p>
        </div>
        <hr/>
      </div>
      <div className="row">
        <div className="col-xl-10">
          <p>Ventas por SINPE</p>
        </div>
        <div className="col-xl-2">
          <p className="float-end">{totalSINPE}
          </p>
        </div>
        <hr style={{border: 2 }}/>
      </div>
      <div className="row text-black">

        <div className="col-xl-12">
          <p className="float-end fw-bold">Total: {totalSINPE + totalTarjeta + totalEfectivo}
          </p>
        </div>
        <hr style={{border: 2}}/>
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