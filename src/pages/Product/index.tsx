import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../service/api';
import { Product } from '../Dashboard';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Form, Button } from 'react-bootstrap';
import ListGroup from 'react-bootstrap/ListGroup';

import { formatPrice } from '../../utils/formatPrice';
import { ProductList } from '../../components/ProductList';

import { Toaster, toast } from 'react-hot-toast';

const ProductInput: React.FC = () => {
  
  const divStyle = {
    borderTop: '2px solid #999',
  };

  const [inputs, setInputs] = useState<Product>({
    id: 0, title: '', price: 0, image: '', amount: 0,
    priceFormatted: ''
  });
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
    setInputs({
      id: 0, title: '', price: 0, image: '', amount: 0,
      priceFormatted: ''
    });
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const response = await api.get<Product[]>(
      '/GetAllProducts',
    );

    const data = response.data.map((product) => ({
      ...product,
      priceFormatted: formatPrice(product.price),
    }));

    setProducts(data);
  }

  return(
  <Layout>
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
    </form>
    <br/>
    <hr style={divStyle}></hr>
    <ProductList>
        {
        products.map((product) => (
                      <ListGroup defaultActiveKey={product.id}>
                        <ListGroup.Item action >
                          {product.title}
                        </ListGroup.Item>
                      </ListGroup>
        ))}
      </ProductList>
      <Toaster />
  </Layout>
  )
};

export default ProductInput;
