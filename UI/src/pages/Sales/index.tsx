import Layout from '../../components/Layout';
import Table from 'react-bootstrap/Table';
import React, { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-datepicker/dist/react-datepicker.css';
import api from "../../service/api";
import DatePicker from 'react-datepicker';
import { ExportCSV } from '../../utils/excel/ExportCSV'
import { Button } from 'react-bootstrap';

export interface Product {
    id: string
    name: string
    price: number
    image: string
    amount: number
  }

  export interface Root {
    product: Product
    count: number
  }

const Sales: React.FC = () => {
    const [startDate, setStartDate] = useState(new Date(Date.now()));
    const [endDate, setEndDate] = useState(new Date(Date.now()));
    const [raiz, setRaiz] = useState<Root[]>([]);
    const [filter, setFilter] = useState('');

    const fileName = `Ventas_${startDate}-${endDate}`;
  
    useEffect(() => {
        RequestSales();
    }, []);

    async function RequestSales(){
      const response = await api.get<Root[]>(
        '/GetReport', { params: { dateBegging: startDate.toISOString(), dateEnd: endDate.toISOString() } }
      );
      if(response.status === 200){
        setRaiz(response.data)
      }
    }

    return (
    <Layout>
        <div>
            <h1 className='h1'>Ventas</h1>
        </div>
        <div>
          <label>Fecha de inicio</label><DatePicker selected={startDate} onChange={(date: Date) => setStartDate(date)} /> &nbsp;
          <label>Fecha de final</label><DatePicker selected={endDate} onChange={(date: Date) => setEndDate(date)} />&nbsp;&nbsp;
          <Button onClick={(_) => RequestSales()}>Consultar</Button>
          <input placeholder="Buscar producto" value={filter} onChange={(event) => setFilter(event.target.value) } />
        </div>
        <Table striped={true} bordered={true} hover={true}>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Precio unitario</th>
                <th>Total de unidade vendidas</th>
              </tr>
            </thead>
            {renderBills()}
          </Table>
          <ExportCSV csvData={flatternObject(raiz)} fileName={fileName}/>
    </Layout>
    );

    function renderBills(){
        return (
          <>
            <tbody>
              {raiz.length > 0 ? (
               raiz.filter(f => f.product.name.toLowerCase().includes(filter.toLowerCase()))
                   .sort((a,b) => b.count - a.count)
                   .map((root: Root, index: number) => {
                  return (
                    <tr key={index} >
                      <td>{root.product.name}</td>
                      <td>{root.product.price}</td>
                      <td>{root.count}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td align={"center"} colSpan={3}>
                    {"No hay productos registrados"}
                  </td>
                </tr>
              )}
            </tbody>
          </>
        );
      };

      function flatternObject(data: Root[]){
        return data.map(x => {
            return {
                id: x.product.id,
                Nombre: x.product.name,
                Precio: x.product.price,
                Cantidad: x.count
            };
        })
      }
}

export default Sales;