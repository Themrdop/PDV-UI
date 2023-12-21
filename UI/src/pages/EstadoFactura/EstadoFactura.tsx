
import Layout from '../../components/Layout';
import Table from 'react-bootstrap/Table';
import React, { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-datepicker/dist/react-datepicker.css';
import api from "../../service/api";
import BillReport from '../../components/Modal/BillReport';
import { Product } from '../../models/models';
import { ExportCSV } from '../../utils/excel/ExportCSV';

export interface Bill {
    consecutive: number;
    date: string;
    total: number;
    medioPago: number[];
    products: Product[];
    electronicBill: ElectronicBill;
  }

  interface ElectronicBill {
    clave: string;
    emitter: Emitter;
    recipient: Emitter;
    electronicBill: string;
    location?: any;
    errorMessages?: any;
    comers: Comers;
  }

  interface Emitter {
    name: string;
    tipoIdentificacion: string;
    numeroIdentificacion: string;
    phone: string;
    email: string;
  }

  interface Comers {
    name: string;
    cedula: string;
    address: string;
    phone: string;
    email: string;
    logo: string;
    provincia: number;
    canton: number;
    distrito: number;
    barrio: number;
    pinCertificado: string;
  }

const BillState: React.FC = () => {
    const [startDate, setStartDate] = useState(new Date(Date.now()));
    const [endDate, setEndDate] = useState(new Date(Date.now()));
    const [bills, setBills] = useState<Bill[]>([]); 
    const [show, setShow] = useState(false);
    const [selectedBill, setSelectedBill] = useState<Bill>({consecutive:-1, date: '', total: 0, medioPago: [], products: [], electronicBill: {clave: '', emitter: {name: '', tipoIdentificacion: '', numeroIdentificacion: '', phone: '', email: ''}, recipient: {name: '', tipoIdentificacion: '', numeroIdentificacion: '', phone: '', email: ''}, electronicBill: '', location: undefined, errorMessages: undefined, comers: {name: '', cedula: '', address: '', phone: '', email: '', logo: '', provincia: 0, canton: 0, distrito: 0, barrio: 0, pinCertificado: ''}}}); 
  
    useEffect(() => {
        RequestBills();
    }, []);

    async function RequestBills(){
      const response = await api.get<Bill[]>(
        '/GetAllBills'
      );
      if(response.status === 200){
        setBills(response.data.filter((bill: Bill) => bill.electronicBill !== undefined && bill.electronicBill.clave !== ''));
      }
    }

    return (
    <Layout>
        <div>
            <h1 className='h1'>Facturas</h1>
        </div>
        <div>
          <button onClick={(_) => RequestBills()}>Consultar</button>
        </div>
        <Table striped={true} bordered={true} hover={true}>
            <thead>
              <tr>
                <th>Consecutivo</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Total</th>
              </tr>
            </thead>
            {renderBills()}
          </Table>
          <BillReport onClose={() => { setShow(false); }} bill={selectedBill} show={show}></BillReport>
    </Layout>
    );

    function renderBills(){
        return (
          <>
            <tbody>
              {bills.length > 0 ? (
                bills.map((bill: Bill, index: number) => {
                  return (
                    <tr key={index}>
                      <td>{bill.consecutive}</td>
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
          </>
        );
      };
      
}

export default BillState;