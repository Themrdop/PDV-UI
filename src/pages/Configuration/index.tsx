import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../service/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Form, Button } from 'react-bootstrap';
import { Toaster, toast } from 'react-hot-toast';

export interface CommerceInfo {
    name: string;
    address: string;
    phone: string;
    email: string;
    logo: string;
    cedula: string;
}

const Commerce: React.FC = () => {

    const [inputs, setInputs] = useState<CommerceInfo>({
    name: '', address: '', phone: '', email: '', logo: '', cedula: ''});

    const handleChange = (event: { target: { name: any; value: any; }; }) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({...values, [name]: value}));
    }
    
    const handleSubmit = async (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        console.log(inputs);

        let response = await api.post<CommerceInfo>(
        '/UpdateCommerceInformation', inputs
        );

        if(response.status === 200){
            toast.success('Se actualizo la informacion del comercio');
            loadCommerceInfo();
        }
    }

    useEffect(() => {
        loadCommerceInfo();
    }, []);

    async function loadCommerceInfo() {
        const response = await api.get<CommerceInfo>(
            '/GetCommerceInformation',
        );

        setInputs(response.data);
    }

    return (
        <Layout>
            <h1 className='h1'>Información comercio</h1>
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
                placeholder="" 
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
                <Form.Label>Direccion del comercio:</Form.Label>
                <Form.Control type="text" 
                placeholder="Direccion del comercio" 
                onChange={handleChange} 
                name="address" 
                value={inputs.address || ""} />
            </Form.Group>
            <Button type="submit" variant="primary">Guardar</Button>
            </form>
            <Toaster />
        </Layout>
    )
}

export default Commerce;