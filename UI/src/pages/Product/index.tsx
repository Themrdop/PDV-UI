import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../service/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Form, Button } from 'react-bootstrap';
import ListGroup from 'react-bootstrap/ListGroup';
import { Link } from 'react-router-dom';

import { formatPrice } from '../../utils/formatPrice';
import { ProductList } from '../../components/ProductList';

import { Toaster, toast } from 'react-hot-toast';
import { Product } from '../../models/models';

const { ipcRenderer } = window.require("electron");

const protocol = 'media-loader://';

const ProductInput: React.FC = () => {
  
  const divStyle = {
    borderTop: '2px solid #999',
  };

  const buttonMargin = {
    marginLeft: '10px',
  };

  const [inputs, setInputs] = useState<Product>({} as Product);
  const [products, setProducts] = useState<Product[]>([]);

  const handleChange = (event: { target: { name: any; value: any; }; }) => {
    const name = event.target.name;
    const value = event.target.value;
    console.log(name, value);
    setInputs(values => ({...values, [name]: value}));
  }
  
  const handleSubmit = async (event: { preventDefault: () => void; }) => {
    event.preventDefault();

    let response;

    let imgName = inputs.image?.replace(protocol,'');

    if(inputs.id !== undefined){
      response = await api.put<Product>(
        '/UpdateProduct', {id: inputs.id, name: inputs.name, price: inputs.price, image: protocol + imgName, amount: inputs.amount}
      );
    }else{
      response = await api.post<Product>(
        '/AddProduct', {name: inputs.name, price: inputs.price, image: protocol + imgName, amount: inputs.amount}
      );
    }

    if(response.status === 200){
      toast.success('El producto se guardo con exito');
      loadProducts();
      clear();
    }
  }

  function clear() {
    setInputs({} as Product);
  }

  async function selectProduct(id: number) {
    const response = await api.get<Product[]>(
        '/GetAllProducts', { params: { ProductId: id } }
      );

    if(response.status !== 200){
      toast.error('Error al cargar el producto');
      return;
    }

    const data = response.data.pop();

    console.log(data);

    if(data !== undefined)
        setInputs(data);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const response = await api.get<Product[]>(
      '/GetAllProducts',
    );

    if(response.status !== 200){
      toast.error('Error al cargar los productos');
      return;
    }

    const data = response.data.map((product) => ({
      ...product,
      priceFormatted: formatPrice(product.price),
    }));

    setProducts(data);
  }

  async function deleteProduct(id: number) {
    const response = await api.delete<Product>(
      '/DeleteProduct', { params: { ProductId: id } }
    );

    if(response.status === 200){
        console.log(response.data);
        toast.success('El producto se elimino con exito');
        loadProducts();
        clear();
    }
  }

  async function handleDialog() {
    let fileName = await ipcRenderer.invoke("showDialog");
    setInputs(values => ({...values, image: fileName}));
  }

  return(
  <Layout>
    <ul className="nav nav-tabs">
        <li className="nav-item">
            <a className="nav-link active" aria-current="page" href="/product">Productos</a>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/combo">Combos</Link>
        </li>
    </ul>
    <h1 className='h1'>Producto</h1>
    <form onSubmit={handleSubmit}>
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>Nombre:</Form.Label>
        <Form.Control type="text" 
        placeholder="Rice and Beans o algo asi" 
        onChange={handleChange} 
        name="name" 
        value={inputs.name || ""} />
      </Form.Group>
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>Precio:</Form.Label>
        <Form.Control type="text" 
        placeholder="3000" 
        onChange={handleChange} 
        name="price" 
        value={inputs.price || ""} />
      </Form.Group>
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>Cantidad:</Form.Label>
        <Form.Control type="text" 
        placeholder="3000" 
        onChange={handleChange} 
        name="amount" 
        value={inputs.amount || ""} />
      </Form.Group>
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>Direccion de la imagen:</Form.Label>
        <div className='input-group'>
          <Form.Control type="text" 
            placeholder="htttp://algo.com/algo.jpg" 
            onChange={handleChange} 
            name="image" 
            disabled={true}
            value={inputs.image?.replace(protocol,'') || ""} />
          <Button type="button" variant="primary" onClick={handleDialog}>Buscar</Button>
        </div>
      </Form.Group>
      <Button type="submit" variant="primary">Guardar</Button>
      <Button style={buttonMargin} disabled={inputs.id === undefined} type="button" variant="primary" onClick={() => clear()}>Nuevo</Button>
    </form>
    <br/>
    <hr style={divStyle}></hr>
    <ProductList>
        {
        products.map((product, index) => (
                      <ListGroup key={index}>
                        <ListGroup.Item action key={index} onClick={() => {selectProduct(product.id);}}>
                          {product.name}
                          <button className="btn btn-danger btn-sm float-end" onClick={() => {deleteProduct(product.id)}}>x</button>
                        </ListGroup.Item>
                      </ListGroup>
        ))}
      </ProductList>
      <Toaster />
  </Layout>
  )
};

export default ProductInput;
