import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { CSSTransition } from "react-transition-group";
import 'bootstrap/dist/css/bootstrap.min.css';
import Table from "react-bootstrap/Table";
import "./PaymentModal.css";
import api from "../../service/api";

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

  async function RequestBills(){
    const response = await api.get<Bill[]>(
      '/GetAllBills', { params: { dateBeginig: startDate, dateEnd: endDate } }
    );
    if(response.status === 200){
      setBills(response.data);
      /*setTotalEfectivo(getBills(0, response.data));
      setTotalTarjeta(getBills(1, response.data));
      setTotalSINPE(getBills(2, response.data));*/
    }
  }

  /*function getBills(medioPago: number, input: Bill[]){
    let result = 0
    input.forEach(bill =>{
      if(bill.medioPago.includes(medioPago)){
        result += bill.total;
      }
    });

    return result;
  }*/

  return ReactDOM.createPortal(
    <CSSTransition
      in={show}
      unmountOnExit
      timeout={{ enter: 0, exit: 300 }}>
      <div className="modal">
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="card">
          <Table striped={true} bordered={true} hover={true}>
            <thead>
              <tr>
                <th>Consecutivo</th>
                <th>metodo de Pago</th>
                <th>Fecha</th>
                <th>Total</th>
              </tr>
            </thead>
            {renderBills()}
          </Table>
          </div>
          <div className="modal-footer">
            <button onClick={RequestBills} className="btn btn-primary">
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

  function renderBills(){
    //const billsList = RequestBills();
    const sumAmount = getSumOfBills(bills);
    // return budget.bills.map((bill: Bill, index: number) => {
    return (
      <>
        <tbody>
          {bills.length > 0 ? (
            bills.map((bill: Bill, index: number) => {
              return (
                <tr key={index}>
                  <td>{bill.consecutive}</td>
                  <td>{bill.medioPago}</td>
                  <td>{bill.date}</td>
                  <td>{bill.total}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td align={"center"} colSpan={5}>
                {"No hay recibos"}
              </td>
            </tr>
          )}
        </tbody>
        {footerTable(sumAmount)}
      </>
    );
  };
  
  function getSumOfBills (bills: Bill[]) {
    return bills
      .map((item: Bill) => item.total)
      .reduce((prev: number, next: number) => prev + Math.round(next), 0);
  };
  
  function footerTable(amt: number){
    return (
      <tbody>
        <tr>
          <td align={"center"} colSpan={5}>
            Total Bill Amount: {amt}
          </td>
        </tr>
        <tr>
        </tr>
      </tbody>
    );
  };
};

export default BillReport;