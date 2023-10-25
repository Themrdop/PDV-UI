import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { CSSTransition } from "react-transition-group";
import api from "../../service/api";
import { Person, PersonFromHacienda, Product } from "../../models/models";
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { formatPrice } from "../../utils/formatPrice";
import haciendaApi from "../../service/haciendaApi";
import { Button, Form, Tab, Tabs } from "react-bootstrap";
import { BsCashCoin, BsPhone } from "react-icons/bs";
import { MdPayment } from "react-icons/md";
import { Toaster, toast } from 'react-hot-toast';

export interface Props {
  show: boolean;
  onClose(result: boolean): void;
  products: Product[];
}

export const PaymentModal: React.FC<Props> = ({ show, onClose, products }) => {

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

  const [Cedula, setCedula] = useState<string>('');
  const [telefono, setTelefono] = useState<string>('');
  const [tipoIdentificacion, setTipoIdentificacion] = useState<string>('01');
  const [descuento, setDescuento] = useState<number>(0);
  const [Voucher, setVoucher] = useState<number>(0);
  const [email, setEmail] = useState<string>('');
  const [metodoPago, setMetodoPago] = useState<Number[]>([]);
  const [activeSINPE, setActive] = useState(false);
  const [activeTarjeta, setTarjeta] = useState(false);
  const [activeEfectivo, setActiveEfectivo] = useState(false);
  const [Cambio, setCambio] = useState<number>(0);
  const [Efectivo, setEfectivo] = useState<number>(0);
  const [Nombre, setNombre] = useState<string>('');

  const handleSINPE = () => {
    setActive(!activeSINPE);
    if (!activeSINPE) {
      setMetodoPago([...metodoPago, 0]);
    } else {
      setMetodoPago(metodoPago.filter(a => a !== 0
      ));
    }
  };

  const handleTarjeta = () => {
    setTarjeta(!activeTarjeta);

    if (!activeTarjeta) {
      setMetodoPago([...metodoPago, 1]);
    } else {
      setMetodoPago(metodoPago.filter(a => a !== 1
      ));
    }
  };

  const handleEfectivo = () => {
    setActiveEfectivo(!activeEfectivo);

    if (!activeEfectivo) {
      setMetodoPago([...metodoPago, 3]);
    } else {
      setMetodoPago(metodoPago.filter(a => a !== 3
      ));
    }
  };

  async function handlePay() {

    if (metodoPago.length === 0) {
      toast.error('Debe seleccionar al menos un metodo de pago');
      return;
    }

    if (activeTarjeta && Voucher === 0) {
      toast.error('Debe ingresar el numero de factura');
      return;
    }

    if (activeEfectivo && Efectivo === 0) {
      toast.error('Debe ingresar el monto de efectivo');
      return;
    }

    if(email !== ''){
      const emailRegex = /\S+@\S+\.\S+/;
      if(!emailRegex.test(email)){
        toast.error('El correo electronico no es valido');
        return;
      }
    }

    if (Cedula !== '' || email !== '') {
      await api.post<Person>(
        '/AddClient', {
        name: Nombre,
        numeroIdentificacion: Cedula,
        tipoIdentificacion: tipoIdentificacion,
        telefono: telefono,
        email: email
      }
      );
    }

    const response = await api.post<Product[]>(
      '/SaveBill', {
      products: products,
      recipient: {
        name: '',
        numeroIdentificacion: Cedula,
        tipoIdentificacion: tipoIdentificacion,
        telefono: telefono,
        email: email
      },
      metodoPago: metodoPago,
      numeroVoucher: Voucher,
      efectivo: Efectivo
    }
    );

    if (response.status === 200) {
      clean();
      onClose(true);
    } else {
      toast.error('No se generar la factura');
    }
  }

  function clean() {
    setCedula('');
    setTelefono('');
    setVoucher(0);
    setEmail('');
    setMetodoPago([]);
    setCambio(0);
    setEfectivo(0);
    setActive(false);
    setTarjeta(false);
    setActiveEfectivo(false);
    setNombre('');
  }

  const total = useRef(0);

  useEffect(() => {
    total.current = products.reduce((partialSum, product) => partialSum + (product.price * product.amount), 0);
  }, [products]);

  function handleDescuento(e: any) {
    let input = e.target.value;
    if (input === "") {
      input = "0";
    }

    let descuento = parseInt(input);
    setDescuento(descuento);
    if (descuento === 0 || Number.isNaN(descuento) || descuento >= 100) {
      total.current = products.reduce((partialSum, product) => partialSum + (product.price * product.amount), 0);
    } else {
      total.current = total.current - (total.current * (descuento / 100));
    }
  }

  async function handleSearch() {
    let response = undefined;
    let response2 = undefined;
    try {
      response = await haciendaApi.get<PersonFromHacienda>(
        '', { params: { identificacion: Cedula } }
      );

      response2 = await api.get<Person>(
        '/GetClient', { params: { numeroIdentificacion: Cedula } }
      );
    } catch (e) {
    }

    if (response === undefined || response2 === undefined) {
      toast.error('No se pudo obtener la informacion de la cedula');
      return;
    }

    if (response.status !== 200 || response2.status !== 200) {
      toast.error('No se pudo obtener la informacion de la cedula');
    }

    setTipoIdentificacion(response.data.tipoIdentificacion);
    setEmail(response2.data.email);
    setTelefono(response2.data.phone);
    setNombre(response.data.nombre);
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
          <div className="App container" style={{ maxWidth: "100%" }}>
            <Tabs defaultActiveKey="Pago">
              <Tab eventKey="Pago" title="Pago">
                <Row>
                  <Col>
                    <Row>
                      <Col>
                        <table className="table table-borderless">
                          <tbody>
                            <tr className="add">
                              <td>Producto</td>
                              <td>Cantidad</td>
                              <td>Precio</td>
                              <td className="text-center">Total</td>
                            </tr>
                            {products.map((p, index) => {
                              return <tr className="content" key={index}>
                                <td>{p.name}</td>
                                <td>{p.amount}</td>
                                <td>{formatPrice(p.price)}</td>
                                <td className="text-center">{formatPrice(p.price * p.amount)}</td>
                              </tr>;
                            })}
                          </tbody>
                        </table>
                      </Col>
                    </Row>
                    <Row>
                      <table className="table table-borderless">
                        <tbody>
                          <tr className="add">
                            <td>Descuento</td>
                            <td className="text-center">Total</td>
                          </tr>
                          <tr className="content">
                            <td><input type="text" onChange={(e) => handleDescuento(e)} /></td>
                            <td className="text-center">{formatPrice(total.current)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </Row>
                    <Row>
                      <div>
                        <label className="form-label">Metodo de pago:</label>
                        <div className="ButtonWrapper">
                          <button className="paymentMethodButton"
                            style={{ backgroundColor: activeEfectivo ? "orange" : "transparent" }}
                            onClick={() => handleEfectivo()}>
                            <BsCashCoin size={35} />
                            Efectivo
                          </button>
                          <button className="paymentMethodButton"
                            style={{ backgroundColor: activeTarjeta ? "orange" : "transparent" }}
                            onClick={() => handleTarjeta()}>
                            <MdPayment size={35} />
                            Tarjeta
                          </button>
                          <button className="paymentMethodButton"
                            style={{ backgroundColor: activeSINPE ? "orange" : "transparent" }}
                            onClick={() => handleSINPE()}>
                            <BsPhone size={35} />
                            SINPE
                          </button>
                        </div>
                      </div>
                    </Row>
                    {activeEfectivo &&
                      <div>
                        <Row>
                          <label className="form-label">Efectivo:</label>
                          <input ref={function (input) {
                            if (input != null) {
                              input.focus();
                            }
                          }} type="text" value={Efectivo || ""} className="form-control space" onChange={(e) => {
                            setEfectivo(Number.parseInt(e.target.value));
                            setCambio(Number.parseInt(e.target.value) - total.current);
                          }} />
                        </Row>
                      </div>}
                    {activeTarjeta &&
                      <Row>
                        <label className="form-label">Numero voucher:</label>
                        <input type="text" ref={function (input) {
                          if (input != null) {
                            input.focus();
                          }
                        }} value={Voucher || ""} className="form-control space" onChange={(e) => setVoucher(Number.parseInt(e.target.value))} />
                      </Row>}
                  </Col>
                  {activeEfectivo &&
                    <Col md={3}>
                      <Row>
                        <label className="form-label">Cambio:</label>
                        <textarea readOnly value={Cambio || ""} style={{ width: "99%", border: "none", outline: "none", fontSize: "45px", color: "orange" }} />
                      </Row>
                    </Col>}
                </Row>
              </Tab>
              <Tab eventKey="Factura" title="Factura electronica">
                <Row style={{ margin: "10px" }}>
                  <label className="form-label">Tipo Cedula:</label>
                  <Form.Select onChange={(e) => setTipoIdentificacion(e.target.value)} value={tipoIdentificacion || ""}>
                    <option value="02">Juridica</option>
                    <option value="01">Fisica</option>
                  </Form.Select>
                </Row>
                <Row style={{ marginTop: "10px", marginBottom: "10px", marginLeft: "5px", marginRight: "5px" }}>
                  <label className="form-label">Cedula juridica:</label>
                  <div className='input-group' style={{marginLeft: "-5px" }}>
                    <input value={Cedula || ""} type="text" className="form-control" onChange={(e) => setCedula(e.target.value)} />
                    <Button type="button" variant="primary" onClick={handleSearch}>Consultar</Button>
                  </div>
                </Row>
                <Row style={{ margin: "10px" }}>
                  <label className="form-label">Nombre:</label>
                  <input type="text" disabled={true} value={Nombre || ""} className="form-control" onChange={(e) => setNombre(e.target.value)} />
                </Row>
                <Row style={{ margin: "10px" }}>
                  <label className="form-label">Correo electronico:</label>
                  <input type="text" value={email || ""} className="form-control" onChange={(e) => setEmail(e.target.value)} />
                </Row>
              </Tab>
            </Tabs>
          </div>
          <div className="modal-footer">
            <button onClick={handlePay} className="btn btn-primary">
              Pagar
            </button>
            <button onClick={() => { onClose(false); clean(); }} className="btn btn-primary">
              Cerrar
            </button>
          </div>
        </div>
        <Toaster />
      </div>
    </CSSTransition>,
    document.getElementById("root")!
  );
};
