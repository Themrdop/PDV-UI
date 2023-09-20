import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout';
import api from '../../service/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Form, Button } from 'react-bootstrap';
import { Toaster, toast } from 'react-hot-toast';
import BillReport from '../../components/Modal/BillReport';
import { CommerceInfo, OutCommerceMsj} from '../../models/models';

const Commerce: React.FC = () => {
    const divStyle = {
        borderTop: '2px solid #999',
    };

    const [inputs, setInputs] = useState<CommerceInfo>({
        name: '', address: '', phone: '', email: '', logo: '', cedula: '', provincia: { provincia: '', descripcion_Provincion: '', cantones: [] }
    });

    const [show, setShow] = useState(false);

    const handleChange = (event: { target: { name: any; value: any; }; }) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({ ...values, [name]: value }));
    }

    const handleSubmit = async (event: { preventDefault: () => void; }) => {
        event.preventDefault();

        let response = await api.post<CommerceInfo>(
            '/UpdateCommerceInformation', {
                name: inputs.name,
                cedula: inputs.cedula,
                address: inputs.address,
                phone: inputs.phone,
                email: inputs.email,
                logo: inputs.logo
            } as OutCommerceMsj
        );

        if (response.status === 200) {
            toast.success('Se actualizo la informacion del comercio');
            loadCommerceInfo();
        }
    }

    useEffect(() => {
        loadCommerceInfo();
    }, []);

    async function loadCommerceInfo() {
        const response = await api.get<OutCommerceMsj>(
            '/GetCommerceInformation',
        );

        setInputs({
            name: response.data.name,
            address: response.data.address,
            phone: response.data.phone,
            email: response.data.email,
            logo: response.data.logo,
            cedula: response.data.cedula,
        } as CommerceInfo);
    }

    return (
        <Layout>
            <h1 className='h1'>Información de comercio</h1>
            <form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Nombre de comercio:</Form.Label>
                    <Form.Control type="text"
                        placeholder="TAKE OUT SRL"
                        onChange={handleChange}
                        name="name"
                        value={inputs.name || ""} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Cedula juridica:</Form.Label>
                    <Form.Control type="text"
                        placeholder="1234"
                        onChange={handleChange}
                        name="cedula"
                        value={inputs.cedula || ""} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Telefono:</Form.Label>
                    <Form.Control type="text"
                        placeholder="88469087"
                        onChange={handleChange}
                        name="phone"
                        value={inputs.phone || ""} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Correo electronico:</Form.Label>
                    <Form.Control type="text"
                        placeholder="xxxx@xxxxx.com"
                        onChange={handleChange}
                        name="email"
                        value={inputs.email || ""} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Dirección del comercio:</Form.Label>
                    <Form.Control type="text"
                        placeholder="Dirección del comercio"
                        onChange={handleChange}
                        name="address"
                        value={inputs.address || ""} />
                </Form.Group>
                <Button type="submit" variant="primary">Guardar</Button>
            </form>
            <BillReport onClose={(result: boolean) => { setShow(false); }} show={show}></BillReport>
            <Toaster />
        </Layout>
    )
}

export default Commerce;