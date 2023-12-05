import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout';
import api from '../../service/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Form, Button } from 'react-bootstrap';
import { Toaster, toast } from 'react-hot-toast';
import { Barrio, Canton, CommerceInfo, Distrito, OutCommerceMsj, Provincia, Provincias } from '../../models/models';
import ubicaciones from '../../assets/data/localization.json';

const { ipcRenderer } = window.require("electron");

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
    const [file, setFile] = useState<File | null>(null);
    const [logoUrl, setLogoUrl] = useState('');

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
                canton: Number.parseInt(inputs.provincia.cantones[0]?.canton),
                distrito: Number.parseInt(inputs.provincia.cantones[0]?.distritos[0]?.distrito),
                barrio: Number.parseInt(inputs.provincia.cantones[0]?.distritos[0]?.barrios[0]?.barrio),
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

        let provincias2 = ubicaciones.filter((provincia: Provincia) => provincia.provincia === response.data.provincia.toString())
        let cantones2 = ubicaciones.filter((provincia: Provincia) => provincia.provincia === response.data.provincia.toString())[0]?.cantones || [];
        let Distritos2 = ubicaciones.filter((provincia: Provincia) => provincia.provincia === response.data.provincia.toString())[0]?.cantones
            .filter((canton: Canton) => canton.canton === response.data.canton.toString())[0].distritos || [];
        let barrios2 = ubicaciones.filter((provincia: Provincia) => provincia.provincia === response.data.provincia.toString())[0]?.cantones
            .filter((canton: Canton) => canton.canton === response.data.canton.toString())[0].distritos
            .filter((distrito: Distrito) => distrito.distrito === response.data.distrito.toString())[0]?.barrios || [];

        setCantones(cantones2);
        setDistritos(Distritos2);
        setBarrio(barrios2);

        selectedProvincia.current = { provincia: response.data.provincia.toString() } as Provincia;
        selectedCanton.current = { canton: response.data.canton.toString() } as Canton;
        selectedDistrito.current = { distrito: response.data.distrito.toString() } as Distrito;
        selectedBarrio.current = { barrio: response.data.barrio.toString() } as Barrio;

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

        fetchLogo(response.data.name);
    }

    const fetchLogo = async (commersName: string) => {
        const response = await fetch('http://localhost:5056/GetLogo?commersName=' + commersName);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setLogoUrl(url);
    };

    const handleSelectChange = (event: { target: { name: any; value: any; }; }) => {
        const value = event.target.value;
        selectedProvincia.current = { provincia: value } as Provincia;
        const cantones = ubicaciones.filter((provincia: Provincia) => provincia.provincia === value)[0].cantones || [];
        if (cantones !== undefined) {
            setCantones(cantones);
            setInputs(values => ({
                ...values, provincia: {
                    provincia: value,
                    descripcion_Provincion: '',
                    cantones: cantones
                }
            }));
        }
    }

    const handleSelectChange2 = (event: { target: { name: any; value: any; }; }) => {
        const value = event.target.value;
        selectedCanton.current = { canton: value } as Canton;
        const canton = inputs.provincia.cantones.filter((canton: Canton) => canton.canton === value)[0];
        const distritos = canton?.distritos || [];
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
        selectedDistrito.current = { distrito: value } as Distrito;
        const canton = cantones.filter((c: Canton) => c.canton === inputs.provincia.cantones[0].canton)[0];
        const distritos = canton.distritos.filter((distrito: Distrito) => distrito.distrito === value) || [];
        const barrio = distritos[0].barrios || [];
        setBarrio(barrio);
        setInputs(values => ({
            ...values, provincia: {
                provincia: inputs.provincia.provincia,
                descripcion_Provincion: '',
                cantones: [{ canton: canton.canton, descripcion_Canton: '', distritos: [{ distrito: value, descripcion_Distrito: '', barrios: barrio }] }]
            }
        }));
    }

    const handleSelectChange4 = (event: { target: { name: any; value: any; }; }) => {
        const value = event.target.value;
        selectedBarrio.current = { barrio: value } as Barrio;
        const canton = cantones.filter((c: Canton) => c.canton === inputs.provincia.cantones[0].canton)[0];
        const distritos = canton.distritos.filter((distrito: Distrito) => distrito.distrito === inputs.provincia.cantones[0].distritos[0].distrito)[0] || [];
        const barrio = distritos.barrios.filter((barrio: Barrio) => barrio.barrio === value) || [];

        setInputs(values => ({
            ...values, provincia: {
                provincia: inputs.provincia.provincia,
                descripcion_Provincion: '',
                cantones: [{ canton: canton.canton, descripcion_Canton: '', distritos: [{ distrito: distritos.distrito, descripcion_Distrito: '', barrios: barrio }] }]
            }
        }));
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);

            const formData = new FormData();
            formData.append("file", e.target.files[0]);

            try {
                const response = await api.post(
                    '/SaveCertificateForCommerce',
                    formData
                );

                toast.success('Se actualizo el certificado del comercio');
            } catch (error) {
                console.error(error);
                toast.error('Error al actualizar el certificado del comercio');
            }
        }
    };

    const handlelogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const file = e.target.files[0];
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('http://localhost:5056/SaveLogo', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                console.log('Logo upload failed');
            }
        }
    };

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
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Provincia:</Form.Label>
                    <Form.Select aria-label="Provincia"
                        onChange={handleSelectChange}
                        value={selectedProvincia.current.provincia || 1}
                        name="provincia">
                        {
                            (ubicaciones as Provincias).map((item: Provincia) => {
                                return (
                                    <option value={item.provincia}>{item.descripcion_Provincion}</option>
                                )
                            })}
                    </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Canton:</Form.Label>
                    <Form.Select aria-label="canton"
                        onChange={handleSelectChange2}
                        value={selectedCanton.current.canton || 1}
                        name="canton">
                        {cantones &&
                            cantones.length > 0 ?
                            cantones?.map((item: Canton) => {
                                return (
                                    <option value={item.canton}>{item.descripcion_Canton}</option>
                                )
                            }) : <option value={1}>No hay cantones</option>}
                    </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Distrito:</Form.Label>
                    <Form.Select aria-label="distrito"
                        onChange={handleSelectChange3}
                        value={selectedDistrito.current.distrito || 1}
                        name="canton">
                        {distritos?.map((item: Distrito) => {
                            return (
                                <option value={item.distrito}>{item.descripcion_Distrito}</option>
                            )
                        })}
                    </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Barrio:</Form.Label>
                    <Form.Select aria-label="distrito"
                        onChange={handleSelectChange4}
                        value={selectedBarrio.current.barrio || 1}
                        name="barrio">
                        {barrio?.map((item: Barrio) => {
                            return (
                                <option value={item.barrio}>{item.descripcion_Barrio}</option>
                            )
                        })}
                    </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Logo:</Form.Label>
                    <div className='input-group'>
                        <Form.Control type="file"
                            placeholder="logo"
                            name="Logo"
                            onChange={handlelogoChange} />
                        <div>
                            {logoUrl && <img src={logoUrl} alt="Logo" style={{ width: '35px', height: '35px' }} />}
                        </div>
                    </div>

                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Certificado:</Form.Label>
                    <Form.Control type="file"
                        placeholder="Certificado"
                        name="certificado"
                        onChange={handleFileChange} />
                </Form.Group>
                <Button type="submit" variant="primary">Guardar</Button>
            </form>
            <Toaster />
        </Layout>
    )
}

export default Commerce;