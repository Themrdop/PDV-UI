import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { CSSTransition } from "react-transition-group";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./PaymentModal.css";
import api from "../../service/api";
import { CommerceInfo, PersonFromHacienda, Product } from "../../models/models";
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { Button, Form, Toast } from "react-bootstrap";
import { formatPrice } from "../../utils/formatPrice";
import haciendaApi from "../../service/haciendaApi";
import { Toaster, toast } from 'react-hot-toast';
const { ipcRenderer } = window.require('electron');

export interface Props {
  show: boolean;
  onClose(result: boolean): void;
  products: Product[];
}

const PaymentModal: React.FC<Props> = ({show, onClose, products}) => {
  
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

  const [Cedula, setCedula] = useState<string>('');
  const [telefono, setTelefono] = useState<string>('');
  const [tipoIdentificacion, setTipoIdentificacion] = useState<string>('01');
  const [descuento, setDescuento] = useState<number>(0);
  const [Nombre, setnombre] = useState<string>('');

  async function handlePay(){
    
    const response = await api.post<Product[]>(
      '/SaveBill', {products: products, 
        recipient: 
          {
            name: Nombre,
            numeroIdentificacion: Cedula, 
            tipoIdentificacion: tipoIdentificacion, 
            telefono: telefono,
            descuento: descuento 
          }}
    );

    if(response.status === 200){
      let commers = await loadCommerceInfo();
      ipcRenderer.invoke('print-bill', {bill: response.data, commers: commers});
      clean();
      onClose(true);
    }
  }

  function clean() {
    setCedula('');
    setTelefono('');
    setnombre('');
  }

  async function loadCommerceInfo() {
    const response = await api.get<CommerceInfo>(
        '/GetCommerceInformation',
    );
    return response.data;
  }
  const total = useRef(0);

  useEffect(() => {
    total.current = products.reduce((partialSum, product) => partialSum + (product.price * product.amount), 0);
  }, [products]);

  function handleDescuento(e: any){
    let input = e.target.value;
      if(input === ""){
        input = "0";
      }

      let descuento = parseInt(input);
      setDescuento(descuento);
      if(descuento === 0 || Number.isNaN(descuento) || descuento >= 100){
        total.current = products.reduce((partialSum, product) => partialSum + (product.price * product.amount), 0);
      }else{
        total.current = total.current - (total.current * (descuento/100));
      }
  }

  async function handleSearch(){
    let response = undefined;
    try{
      response = await haciendaApi.get<PersonFromHacienda>(
        '', { params: { identificacion: Cedula } }
      );
    }catch (e){

    }

    if(response === undefined){
      toast.error('No se pudo obtener la informacion de la cedula');
      return;
    }

    if(response.status !== 200){
      console.log(response.data);
      toast.error('No se pudo obtener la informacion de la cedula');
    }

    setTipoIdentificacion(response.data.tipoIdentificacion);
    setnombre(response.data.nombre);

    
  }

  return ReactDOM.createPortal(
    <CSSTransition
      in={show}
      unmountOnExit
      timeout={{ enter: 0, exit: 300 }}>
      <div className="modal">
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="h2">Factura</h2>
          </div>
          <div className="App container mt-1">
          <Row>
              <Col>
              <Row>
                  <div className='input-group'>
                    <label className="form-label">Cedula juridica:</label>
                    <input value={Cedula || ""} type="text" className="form-control" onChange={(e) => setCedula(e.target.value) }/>
                    <Button type="button" variant="primary" onClick={handleSearch}>Consultar</Button>
                  </div>
                </Row>
                <Row>
                  <label className="form-label">Nombre:</label>
                  <input type="text" disabled={true} value={Nombre || ""} className="form-control" onChange={(e) => setnombre(e.target.value) }/>
                </Row>
                <Row>
                  <label className="form-label">Tipo Cedula:</label>
                  <Form.Select onChange={(e) => setTipoIdentificacion(e.target.value)} value={tipoIdentificacion || ""}>
                  <option value="02">Juridica</option>
                    <option value="01">Fisica</option>
                  </Form.Select>
                </Row>
                <Row>
                  <label className="form-label">Telefono de cliente:</label>
                  <input type="text" className="form-control" onChange={(e) => setTelefono(e.target.value) } value={telefono || ""}/>
                </Row>
              </Col>
              <Col>
                <Row>
                  <table className="table table-borderless">
                    <tbody>
                      <tr className="add">
                          <td>Producto</td>
                          <td>Cantidad</td>
                          <td>Precio</td>
                          <td className="text-center">Total</td>
                      </tr>
                      {
                        products.map((p,index) => {
                          return <tr className="content" key={index}>
                            <td>{p.name}</td>
                            <td>{p.amount}</td>
                            <td>{formatPrice(p.price)}</td>
                            <td className="text-center">{formatPrice(p.price * p.amount)}</td>
                          </tr>
                        })
                      }
                    </tbody>
                  </table>
                </Row>
                <Row>
                <table className="table table-borderless">
                              <tbody>
                                  <tr className="add">
                                      <td>Subtotal</td>
                                      <td>Impuesto</td>
                                      <td>Descuento</td>
                                      <td className="text-center">Total</td>
                                  </tr>
                                  <tr className="content">
                                      <td>{formatPrice(total.current*(1-0.13))}</td>
                                      <td>{formatPrice(total.current*0.13)}</td>
                                      <td><input type="text" onChange={(e) => handleDescuento(e)}/></td>
                                      <td className="text-center">{formatPrice(total.current)}</td>
                                  </tr>
                              </tbody>
                          </table>
                </Row>
              </Col>
            </Row>
          </div>
          <div className="modal-footer">
          <button onClick={handlePay} className="btn btn-primary">
              Pagar
            </button>
            <button onClick={() => {onClose(false); clean();}} className="btn btn-primary">
              Cerrar
            </button>
          </div>
        </div>
        <Toaster/>
      </div>
    </CSSTransition>,
    document.getElementById("root")!
  );
};

export default PaymentModal;
