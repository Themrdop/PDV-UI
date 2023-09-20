
import Layout from '../../components/Layout';
import Table from 'react-bootstrap/Table';
import React, { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-datepicker/dist/react-datepicker.css';
import api from "../../service/api";
import BillReport from '../../components/Modal/BillReport';
import DatePicker from 'react-datepicker';

export interface Bill {
    consecutive: number;
    date: string;
    total: number;
    medioPago: number[];
  }

const Bill: React.FC = () => {
    const [startDate, setStartDate] = useState(new Date(Date.now()));
    const [endDate, setEndDate] = useState(new Date(Date.now()));
    const [bills, setBills] = useState<Bill[]>([]); 
    const [show, setShow] = useState(false);
  
    useEffect(() => {
        RequestBills();
    }, []);

    async function RequestBills(){
      const response = await api.get<Bill[]>(
        '/GetAllBills', { params: { dateBeginig: startDate, dateEnd: endDate } }
      );
      if(response.status === 200){
        setBills(response.data);
      }
    }

    return (
    <Layout>
        <div>
            <h1 className='h1'>Facturas diarias</h1>
        </div>
        <div>
          <label>Fecha de inicio</label><DatePicker selected={startDate} onChange={(date: Date) => setStartDate(date)} /> &nbsp;
          <label>Fecha de final</label><DatePicker selected={endDate} onChange={(date: Date) => setEndDate(date)} />&nbsp;&nbsp;
          <button onClick={(_) => RequestBills()}>Consultar</button>
        </div>
        <Table striped={true} bordered={true} hover={true}>
            <thead>
              <tr>
                <th>Consecutivo</th>
                <th>Metodo de pago</th>
                <th>Fecha</th>
                <th>Total</th>
              </tr>
            </thead>
            {renderBills()}
          </Table>
          <BillReport onClose={(result: boolean) => { setShow(false); }} show={show}></BillReport>
    </Layout>
    );

    function renderBills(){
        const sumAmount = getSumOfBills(bills);
        return (
          <>
            <tbody>
              {bills.length > 0 ? (
                bills.map((bill: Bill, index: number) => {
                  return (
                    <tr key={index} onClick={handleRowClic}>
                      <td>{bill.consecutive}</td>
                      <td>{toReadible(bill.medioPago)}</td>
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

      function toReadible(medioPago: number[]){
        let concat = '';
        medioPago.map((x: number) => {
            switch (x) {
                case 0:
                    concat += 'Efectivo'
                    break;
                case 1:
                    concat += 'Tarjeta'
                    break;
                case 3:
                    concat += 'SINPE'
                    break;
                default:
                    break;
            }
        });
        return concat;
      }

    function handleRowClic(event: any): void {
        setShow(true);
    }
}

export default Bill;