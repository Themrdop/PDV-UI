import Layout from '../../components/Layout';
import Table from 'react-bootstrap/Table';
import React, { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-datepicker/dist/react-datepicker.css';
import api from "../../service/api";
import BillReport from '../../components/Modal/BillReport';
import DatePicker from 'react-datepicker';
import type { Bill } from '../../models/models';
import { ExportCSV } from '../../utils/excel/ExportCSV';
import { Button } from 'react-bootstrap';
import { ReactComponent as Loader } from '../../assets/icon/loader.svg'
import { ElectronicBillModal } from '../../components/Modal/ElectronicBillModal';

const BillScreen: React.FC = () => {
  const [startDate, setStartDate] = useState(new Date(Date.now()));
  const [endDate, setEndDate] = useState(new Date(Date.now()));
  const [bills, setBills] = useState<Bill[]>([]);
  const [show, setShow] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill>({ consecutive: -1, date: '', total: 0, medioPago: [], products: [], electronicBill: { clave: '', emitter: { name: '', tipoIdentificacion: '', numeroIdentificacion: '', phone: '', email: '' }, recipient: { name: '', tipoIdentificacion: '', numeroIdentificacion: '', phone: '', email: '' }, electronicBill: '', location: '', errorMessages: '' }, recipient: { name: '', tipoIdentificacion: '', numeroIdentificacion: '', phone: '', email: '' } });
  const [loading, setLoading] = useState(false);
  const [showPayment, setPaymentShow] = useState(false);

  const fileName = `Facturas_${startDate}-${endDate}`;

  async function RequestBills() {
    setLoading(true);
    const response = await api.get<Bill[]>(
      '/GetAllBills', { params: { dateBeginig: startDate, dateEnd: endDate } }
    );
    if (response.status === 200) {
      setBills(response.data);
    }
    setLoading(false);
  }

  return (
    <Layout>
      <div>
        <h1 className='h1'>Facturas</h1>
      </div>
      <div>
        <label>Fecha de inicio</label><DatePicker selected={startDate} onChange={(date: Date) => setStartDate(date)} /> &nbsp;
        <label>Fecha de final</label><DatePicker selected={endDate} onChange={(date: Date) => setEndDate(date)} />&nbsp;&nbsp;
        <Button disabled={loading} onClick={(_) => RequestBills()}>{!loading ? 'Consultar' : <Loader className="spinner" />}</Button>
      </div>
      <Table striped={true} bordered={true} hover={true}>
        <thead>
          <tr>
            <th>Consecutivo</th>
            <th>Metodo de pago</th>
            <th>Fecha</th>
            <th>Total</th>
            <th>Factura electronica</th>
          </tr>
        </thead>
        {renderBills()}
      </Table>
      <ExportCSV csvData={bills} fileName={fileName} />
      <BillReport onClose={(result: boolean) => { setShow(false); }} bill={selectedBill} show={show}></BillReport>
    </Layout>
  );

  function renderBills() {
    const sumAmount = getSumOfBills(bills);

    return (
      <>
        <tbody>
          {bills.length > 0 ? (
            bills.map((bill: Bill, index: number) => {
              let date = new Date(Date.parse(bill.date));
              return (
                <tr key={index}>
                  <td onClick={() => handleRowClick(bill)}>{bill.consecutive}</td>
                  <td onClick={() => handleRowClick(bill)}>{toReadible(bill.medioPago)}</td>
                  <td onClick={() => handleRowClick(bill)}>{date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()}</td>
                  <td onClick={() => handleRowClick(bill)}>{bill.total}</td>
                  <td onClick={() => { if (bill.electronicBill.clave == '') return; handleRowClick(bill); }}><Button onClick={() => setPaymentShow(true)} disabled={bill.electronicBill.clave != '' ? true : false} variant={bill.electronicBill.clave != '' ? 'secondary' : 'primary'}>{bill.electronicBill.clave != '' ? bill.electronicBill.clave.substring(0, 9) + '...' : 'Emitir factura'}</Button></td>
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
        <ElectronicBillModal onClose={(result: boolean) => { setPaymentShow(false) }
        } show={showPayment}
          bill={selectedBill} />
      </>
    );
  };

  function getSumOfBills(bills: Bill[]) {
    return bills
      .map((item: Bill) => item.total)
      .reduce((partialSum: number, next: number) => partialSum + next, 0);
  };

  function footerTable(amt: number) {
    return (
      <tbody>
        <tr>
          <td align={"center"} colSpan={5}>
            Monto total de facturas: {amt}
          </td>
        </tr>
        <tr>
        </tr>
      </tbody>
    );
  };

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

  function handleRowClick(bill: Bill): void {
    setSelectedBill(bill);
    setShow(true);
  }
}

export default BillScreen;