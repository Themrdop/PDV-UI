
import Layout from '../../components/Layout';
import Table from "react-bootstrap/Table";
import React, { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import api from "../../service/api";
import BillReport from '../../components/Modal/BillReport';

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
    const [totalEfectivo, setTotalEfectivo] = useState<number>(0);
    const [totalTarjeta, setTotalTarjeta] = useState<number>(0);
    const [totalSINPE, setTotalSINPE] = useState<number>(0);
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
        /*setTotalEfectivo(getBills(0, response.data));
        setTotalTarjeta(getBills(1, response.data));
        setTotalSINPE(getBills(2, response.data));*/
      }
    }

    return (
    <Layout>
        <div>
            <h1>Facturas diarias</h1>
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
        //const billsList = RequestBills();
        const sumAmount = getSumOfBills(bills);
        // return budget.bills.map((bill: Bill, index: number) => {
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
            console.log(x);
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