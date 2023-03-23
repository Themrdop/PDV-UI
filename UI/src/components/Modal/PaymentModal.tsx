import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { CSSTransition } from "react-transition-group";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./PaymentModal.css";
import api from "../../service/api";
import { Product } from "../../models/models";

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
  }, []);

  const [Cedula, setCedula] = useState<string>('');
  const [telefono, setTelefono] = useState<string>('');

  async function handlePay(){
    console.log(products);
    const response = await api.post<Product[]>(
      '/SaveBill', products
    );
    if(response.status === 200){
      onClose(true);
    }
  }

  /*function printDocument() {
     
    
    const doc = new jsPDF();
   
    //get html
    const pdfTable = document.getElementById('divToPrint');
    //html to pdf format
    var html = htmlToPdfmake(pdfTable.innerHTML);
  
    const documentDefinition = { content: html };
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
    pdfMake.createPdf(documentDefinition).open();
  
  }*/

  const divStyle = {
    display: 'flex',
  };

  const total = products.reduce((partialSum, product) => partialSum + (product.price * product.amount), 0);

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
            <div className="mb-1" style={divStyle}>
              <label className="form-label">Cedula juridica:</label>
              <input type="text" className="form-control" onChange={(e) => setCedula(e.target.value) }/>
            </div>
            <div id="divToPrint" className="m-1">
            <div className="row d-flex justify-content-center">
              <div className="col-md-8">
                  <div className="card">
                      <div className="products p-2">
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
                                        <td>{p.price}</td>
                                        <td className="text-center">₡{p.price * p.amount}</td>
                                      </tr>
                                    })
                                  }
                              </tbody>
                          </table>
                      </div>
                      <hr />
                      <div className="products p-2">
                          <table className="table table-borderless">
                              <tbody>
                                  <tr className="add">
                                      <td>Subtotal</td>
                                      <td>Impuesto</td>
                                      <td>Descuento</td>
                                      <td className="text-center">Total</td>
                                  </tr>
                                  <tr className="content">
                                      <td>₡{total*(1-0.13)}</td>
                                      <td>₡{total*0.13}</td>
                                      <td>0</td>
                                      <td className="text-center">₡{total}</td>
                                  </tr>
                              </tbody>
                          </table>
                      </div>
                  </div>
              </div>
          </div>
        </div>
        <div className="mb-1" style={divStyle}>
          <label className="form-label">Telefono de cliente:</label>
          <input type="text" className="form-control" onChange={(e) => setTelefono(e.target.value) }/>
        </div>
      </div>
          <div className="modal-footer">
          <button onClick={handlePay} className="btn btn-primary">
              Pagar
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

export default PaymentModal;