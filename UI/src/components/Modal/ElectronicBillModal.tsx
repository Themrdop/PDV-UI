import React, { useState } from "react";
import ReactDOM from "react-dom";
import { CSSTransition } from "react-transition-group";
import api from "../../service/api";
import { Person, PersonFromHacienda, Product } from "../../models/models";
import Row from 'react-bootstrap/Row';
import { Button, Form, Tab, Tabs } from "react-bootstrap";
import { ReactComponent as Loader } from '../../assets/icon/loader.svg'
import haciendaApi from "../../service/haciendaApi";
import toast, { Toaster } from "react-hot-toast";
import { Bill } from "../../models/models";

export interface Props {
    show: boolean;
    onClose(result: boolean): void;
    bill: Bill;
}

export const ElectronicBillModal: React.FC<Props> = ({ show, onClose, bill }) => {

    function closeOnEscapeKeyDown(e: { charCode: any; keyCode: any; }) {
        if ((e.charCode || e.keyCode) === 27) {
            onClose(false);
        }
    }

    const [tipoIdentificacion, setTipoIdentificacion] = useState<string>('01');
    const [Cedula, setCedula] = useState<string>('');
    const [telefono, setTelefono] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [Nombre, setNombre] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [loadingPersona, setLoadingPersona] = useState(false);

    async function handleEmitir() {
        setLoading(true);

        if (email !== '') {
            const emailRegex = /\S+@\S+\.\S+/;
            if (!emailRegex.test(email)) {
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

        try {
            const response = await api.post<Bill>(
                '/EmitElectronicBill', {
                    ...bill, recipient: {
                        name: Nombre,
                        numeroIdentificacion: Cedula,
                        tipoIdentificacion: tipoIdentificacion,
                        phone: telefono,
                        email: email
                    }
            }
            );

            if (response.status === 200) {
                setLoading(false);
                clean();
                onClose(true);
            } else {
                setLoading(false);
                toast.error('No se generar la factura');
            }
        } catch (error) {
            setLoading(false);
            toast.error('No se generar la factura');
        }
    }

    async function handleSearch() {
        let response = undefined;
        let response2 = undefined;

        setLoadingPersona(true);

        try {
            response2 = await api.get<Person>(
                '/GetClient', { params: { numeroIdentificacion: Cedula } }
            );
        } catch (error) { }

        if (response2 !== undefined && response2.status === 200 && response2.data.name !== undefined) {
            setTipoIdentificacion(response2.data.tipoIdentificacion);
            setEmail(response2.data.email);
            setTelefono(response2.data.phone);
            setNombre(response2.data.name);

            setLoadingPersona(false);

            return;
        }

        try {
            response = await haciendaApi.get<PersonFromHacienda>(
                '', { params: { identificacion: Cedula } }
            );
        } catch (e) { }

        if (response !== undefined && response.status === 200) {
            setTipoIdentificacion(response.data.tipoIdentificacion);
            setNombre(response.data.nombre);

            setLoadingPersona(false);

            return;
        }

        toast.error('No se encontro el cliente');

        setLoadingPersona(false);
    }

    function clean() {
        setCedula('');
        setTelefono('');
        setEmail('');
        setNombre('');
    }

    return ReactDOM.createPortal(
        <CSSTransition
            in={show}
            unmountOnExit
            timeout={{ enter: 0, exit: 300 }}>
            <div className="modal">
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2 className="h2">Factura electronica</h2>
                    </div>
                    <div className="App container" style={{ maxWidth: "100%" }}>
                        <>
                            <Row style={{ margin: "10px" }}>
                                <label className="form-label">Tipo Cedula:</label>
                                <Form.Select onChange={(e) => setTipoIdentificacion(e.target.value)} value={tipoIdentificacion || ""}>
                                    <option value="02">Juridica</option>
                                    <option value="01">Fisica</option>
                                </Form.Select>
                            </Row>
                            <Row style={{ marginTop: "10px", marginBottom: "10px", marginLeft: "5px", marginRight: "5px" }}>
                                <label className="form-label">Cedula juridica:</label>
                                <div className='input-group' style={{ marginLeft: "-5px" }}>
                                    <input value={Cedula || ""} type="text" className="form-control" onChange={(e) => setCedula(e.target.value)} />
                                    <Button type="button" variant="primary" onClick={handleSearch}>{!loadingPersona ? 'Consultar' : <Loader className="spinner" />}</Button>
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
                        </>
                    </div>
                    <div className="modal-footer">
                        <button onClick={handleEmitir} className="btn btn-primary" disabled={loading}>
                            {!loading ? 'Emitir' : <Loader className="spinner" />}
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
}