import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../service/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Form, Button } from 'react-bootstrap';
import ListGroup from 'react-bootstrap/ListGroup';

import { ProductList } from '../../components/ProductList';

import { Toaster, toast } from 'react-hot-toast';
import { Product, User } from '../../models/models';

const UserAdministration: React.FC = () => {
  
  const divStyle = {
    borderTop: '2px solid #999',
  };

  const [inputs, setInputs] = useState<User>({} as User);
  const [users, setUsers] = useState<User[]>([] as User[]);

  const handleChange = (event: { target: { name: any; value: any; }; }) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputs(values => ({...values, [name]: value}));
  }
  
  const handleSubmit = async (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    console.log(inputs);

    let response = await api.post<Product>(
      '/AddUser', {name: inputs.name, lastname: inputs.lastname, email: inputs.email, password: inputs.password, role: inputs.role} as User
    );

    if(response.status !== 200){
        toast.error('Error al guardar el usuario'); 
        return;
    }

    toast.success('El usuario se guardo con exito');
    loadUsers();
    clear();
  }

  function clear() {
    setInputs({} as User);
  }

  async function selectUser(id: number) {
    const response = await api.get<User[]>(
        '/GetAllProducts', { params: { id: id } }
      );

    if(response.status !== 200){
      toast.error('Error al cargar el producto');
      return;
    }

    const data = response.data.pop();
    if(data !== undefined)
        setInputs(data);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    const response = await api.get<User[]>(
      '/GetUsers',
    );

    if(response.status !== 200){
      toast.error('Error al cargar los productos');
      return;
    }

    setUsers(response.data);
  }

  async function deleteProduct(id: number) {
    const response = await api.delete<Product>(
      '/DisableUser', { params: { ProductId: id } }
    );

    if(response.status !== 200){
        toast.error('Error al eliminar el producto');
        return;
    }

    toast.success('El usuario se elimino con exito');
    loadUsers();
    clear();
  }

  return(
  <Layout>
    <h1 className='h1'>Usuarios</h1>
    <form onSubmit={handleSubmit}>
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>Nombre:</Form.Label>
        <Form.Control type="text" 
        placeholder="Maria" 
        onChange={handleChange} 
        name="name" 
        value={inputs.name || ""} />
      </Form.Group>
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>Apellido:</Form.Label>
        <Form.Control type="text" 
        placeholder="Brown" 
        onChange={handleChange} 
        name="lastname" 
        value={inputs.lastname || ""} />
      </Form.Group>
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>Contraseña:</Form.Label>
        <Form.Control type="password" 
        placeholder="" 
        onChange={handleChange} 
        name="password" 
        value={inputs.password || ""} />
      </Form.Group>
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>Correo:</Form.Label>
        <Form.Control type="text" 
        placeholder="algo@gmail.com" 
        onChange={handleChange} 
        name="email" 
        value={inputs.email || ""} />
      </Form.Group>
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>Rol:</Form.Label>
        <Form.Select aria-label="Default select example" 
          onChange={handleChange} 
          name="role" 
          value={inputs.role || ""}>
            <option value="Dependiente">Dependiente</option>
            <option value="Administrador">Administrador</option>
        </Form.Select>
      </Form.Group>
      <Button type="submit" variant="primary">Guardar</Button>
      <Button disabled={inputs.id === undefined} type="button" variant="primary" onClick={() => clear()}>Nuevo</Button>
    </form>
    <br/>
    <hr style={divStyle}></hr>
    <ProductList>
        {
        users.map((user, index) => (
                      <ListGroup key={index}>
                        <ListGroup.Item action key={index} onClick={() => {selectUser(user.id);}}>
                          {user.name} {user.lastname} - {user.email} - {user.role}
                          <button className="btn btn-danger btn-sm float-end" onClick={() => {deleteProduct(user.id)}}>x</button>
                        </ListGroup.Item>
                      </ListGroup>
        ))}
      </ProductList>
      <Toaster />
  </Layout>
  )
};

export default UserAdministration;
