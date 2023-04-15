import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout';
import api from '../../service/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Form, Button } from 'react-bootstrap';
import { Toaster, toast } from 'react-hot-toast';
import { HiDocumentReport } from 'react-icons/hi';
import BillReport from '../../components/Modal/BillReport';
import { Barrio, Canton, CommerceInfo, Distrito, OutCommerceMsj, Provincia, Provincias } from '../../models/models';
import ubicaciones from '../../assets/data/localization.json';

import DropdownTreeSelect from 'react-dropdown-tree-select'

const Commerce: React.FC = () => {
    const divStyle = {
        borderTop: '2px solid #999',
    };

    const [inputs, setInputs] = useState<CommerceInfo>({
        name: '', address: '', phone: '', email: '', logo: '', cedula: '', provincia: { provincia: '', descripcion_Provincion: '', cantones: [] }
    });
    const [cantones, setCantones] = useState<Canton[]>([]);
    const [distritos, setDistritos] = useState<Distrito[]>([]);
    const [barrio, setBarrio] = useState<Barrio[]>([]);

    const selectedProvincia = useRef<Provincia>({} as Provincia);
    const selectedCanton = useRef<Canton>({} as Canton);
    const selectedDistrito = useRef<Distrito>({} as Distrito);
    const selectedBarrio = useRef<Barrio>({} as Barrio);

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
                logo: inputs.logo,
                provincia: Number.parseInt(inputs.provincia.provincia),
                canton: Number.parseInt(inputs.provincia.cantones[0].canton),
                distrito: Number.parseInt(inputs.provincia.cantones[0].distritos[0].distrito),
                barrio: Number.parseInt(inputs.provincia.cantones[0].distritos[0].barrios[0].barrio),
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

        setCantones(ubicaciones.filter((provincia: Provincia) => provincia.provincia === response.data.provincia.toString())[0].cantones || []);
        setDistritos(ubicaciones.filter((provincia: Provincia) => provincia.provincia === response.data.provincia.toString())[0].cantones[0].distritos || []);
        setBarrio(ubicaciones.filter((provincia: Provincia) => provincia.provincia === response.data.provincia.toString())[0].cantones[0].distritos[0].barrios || []);

        selectedProvincia.current = ubicaciones.filter((provincia: Provincia) => provincia.provincia === response.data.provincia.toString())[0];
        selectedCanton.current = ubicaciones.filter((provincia: Provincia) => provincia.provincia === response.data.provincia.toString())[0].cantones[0];
        selectedDistrito.current = ubicaciones.filter((provincia: Provincia) => provincia.provincia === response.data.provincia.toString())[0].cantones[0].distritos[0];
        selectedBarrio.current = ubicaciones.filter((provincia: Provincia) => provincia.provincia === response.data.provincia.toString())[0].cantones[0].distritos[0].barrios[0];

        setInputs({
            name: response.data.name,
            address: response.data.address,
            phone: response.data.phone,
            email: response.data.email,
            logo: response.data.logo,
            cedula: response.data.cedula,
            provincia: {
                provincia: response.data.provincia.toString(),
                descripcion_Provincion: '',
                cantones: [{
                    canton: response.data.canton.toString(),
                    descripcion_Canton: '',
                    distritos: [{
                        distrito: response.data.distrito.toString(),
                        descripcion_Distrito: '',
                        barrios: [{
                            barrio: response.data.barrio.toString(),
                            descripcion_Barrio: ''
                        } as Barrio]
                    } as Distrito]
                } as Canton]
            } as Provincia
        } as CommerceInfo);
    }

    async function handlePay() {
        setShow(true);
    }

    const handleSelectChange = (event: { target: { name: any; value: any; }; }) => {
        const value = event.target.value;
        const cantones = ubicaciones.filter((provincia: Provincia) => provincia.provincia === value)[0].cantones || [];
        setCantones(cantones);
        setInputs(values => ({
            ...values, provincia: {
                provincia: value,
                descripcion_Provincion: '',
                cantones: cantones
            }
        }));
    }

    const handleSelectChange2 = (event: { target: { name: any; value: any; }; }) => {
        const value = event.target.value;
        const canton = inputs.provincia.cantones.filter((canton: Canton) => canton.canton === value)[0];
        const distritos = canton.distritos || [];
        setDistritos(distritos);
        setInputs(values => ({
            ...values, provincia: {
                provincia: inputs.provincia.provincia,
                descripcion_Provincion: '',
                cantones: [{ canton: value, descripcion_Canton: '', distritos: distritos }]
            }
        }));
    }

    const handleSelectChange3 = (event: { target: { name: any; value: any; }; }) => {
        const value = event.target.value;
        const canton = cantones.filter((c: Canton) => c.canton === inputs.provincia.cantones[0].canton)[0];
        const distritos = canton.distritos.filter((distrito: Distrito) => distrito.distrito === value) || [];
        console.log(distritos);
        const barrio = distritos[0].barrios || [];
        console.log(barrio);
        setBarrio(barrio);
        setInputs(values => ({
            ...values, provincia: {
                provincia: inputs.provincia.provincia,
                descripcion_Provincion: '',
                cantones: [{ canton: canton.canton, descripcion_Canton: '', distritos: [{ distrito: value, descripcion_Distrito: '', barrios: barrio }] }]
            }
        }));
    }

    return (
        <Layout>
            <Button onClick={handlePay}>
                <HiDocumentReport />
                Generar Informe de facturacion
            </Button>
            <br />
            <br />
            <hr style={divStyle}></hr>
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
                    <Form.Label>Direccion del comercio:</Form.Label>
                    <Form.Control type="text"
                        placeholder="Direccion del comercio"
                        onChange={handleChange}
                        name="address"
                        value={inputs.address || ""} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Provincia:</Form.Label>
                    <DropdownTreeSelect data={ubicaciones} />
                </Form.Group>
                <Button type="submit" variant="primary">Guardar</Button>
            </form>
            <BillReport onClose={(result: boolean) => { setShow(false); }} show={show}></BillReport>
            <Toaster />
        </Layout>
    )
}

export default Commerce;