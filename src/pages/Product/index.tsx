import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../service/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Form, Button } from 'react-bootstrap';
import ListGroup from 'react-bootstrap/ListGroup';

import { formatPrice } from '../../utils/formatPrice';
import { ProductList } from '../../components/ProductList';

import { Toaster, toast } from 'react-hot-toast';
import { Product } from '../../models/models';

const ProductInput: React.FC = () => {
  
  const divStyle = {
    borderTop: '2px solid #999',
  };

  const [inputs, setInputs] = useState<Product>({} as Product);
  const [products, setProducts] = useState<Product[]>([]);

  const handleChange = (event: { target: { name: any; value: any; }; }) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputs(values => ({...values, [name]: value}));
  }
  
  const handleSubmit = async (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    console.log(inputs);

    let response = await api.post<Product>(
      '/AddProduct', {title: inputs.title, price: inputs.price, image: inputs.image}
    );

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

  return(
  <Layout>
    <ul className="nav nav-tabs">
        <li className="nav-item">
            <a className="nav-link active" aria-current="page" href="/product">Productos</a>
        </li>
        <li className="nav-item">
            <a className="nav-link" href="/combo">Combos</a>
        </li>
    </ul>
    <h1 className='h1'>Producto</h1>
    <form onSubmit={handleSubmit}>
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>Nombre:</Form.Label>
        <Form.Control type="text" 
        placeholder="Rice and Beans o algo asi" 
        onChange={handleChange} 
        name="title" 
        value={inputs.title || ""} />
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
        <Form.Label>Direccion de la imagen:</Form.Label>
        <Form.Control type="text" 
        placeholder="htttp://algo.com/algo.jpg" 
        onChange={handleChange} 
        name="image" 
        value={inputs.image || ""} />
      </Form.Group>
      <Button type="submit" variant="primary">Guardar</Button>
      <Button disabled={inputs.id === undefined} type="button" variant="primary" onClick={() => clear()}>Nuevo</Button>
    </form>
    <br/>
    <hr style={divStyle}></hr>
    <ProductList>
        {
        products.map((product, index) => (
                      <ListGroup>
                        <ListGroup.Item action key={index} onClick={() => {selectProduct(product.id);}}>
                          {product.title}
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
