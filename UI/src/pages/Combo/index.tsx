import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../service/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Form, Button } from 'react-bootstrap';
import ListGroup from 'react-bootstrap/ListGroup';

import { formatPrice } from '../../utils/formatPrice';
import { ProductList } from '../../components/ProductList';

import { Toaster, toast } from 'react-hot-toast';
import { Combo, Product } from '../../models/models';

const ProductInput: React.FC = () => {
  
  const divStyle = {
    borderTop: '2px solid #999',
  };

  const buttonMargin = {
    marginLeft: '10px',
  };

  const { dialog } = window.require('electron').dialog;
  const { ipcRenderer } = window.require('electron');

  const path = require('path')

  const protocol = 'media-loader://';

  const [inputs, setInputs] = useState<Combo>({products: [] as Product[]} as Combo);
  const [products, setProducts] = useState<Product[]>([]);
  const [ComboList, setComboList] = useState<Combo[]>([]);

  const handleChange = (event: { target: { name: any; value: any; }; }) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputs(values => ({...values, [name]: value}));
  }
  
  const handleSubmit = async (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    console.log(inputs);

    let response;

    if(inputs.id !== undefined){
      response = await api.put<Combo>(
        '/UpdateCombo', {id: inputs.id, name: inputs.name, description: inputs.description, price: inputs.price, image: protocol + inputs.image, products: inputs.products} as Combo
      );
    }else{
      response = await api.post<Combo>(
        '/AddCombo', {name: inputs.name, description: inputs.description, price: inputs.price, image: protocol + inputs.image, products: inputs.products} as Combo
      );
    }

    if(response.status === 200){
      toast.success('El producto se guardo con exito');
      loadProducts();
      loadCombos();
      clear();
    }
  }

  function clear() {
    setInputs({products: [] as Product[]} as Combo);
  }

  async function selectProduct(id: number) {
    let prod = inputs.products?.find(p => p.id === id);

    if(prod === undefined) {
      setInputs(com => {
        let newProductList = [...com.products, {id: id} as Product];
        return {...com, products: newProductList};
      });
    }else{
      setInputs(com => {
        let newproductList = com.products.filter(p => p.id !== id)
        return {...com, products: newproductList};
      });
    }
  }

  useEffect(() => {
    loadProducts();
    loadCombos();
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

  async function loadCombos(){
    const response = await api.get<Combo[]>(
      '/GetAllCombos',
    );

    if(response.status !== 200){
      toast.error('Error al cargar los combos');
      return;
    }

    const data = response.data.map((combo) => ({
      ...combo,
      priceFormatted: formatPrice(combo.price),
    }));

    setComboList(data);
  }

  async function deleteCombo(id: number) {
    const response = await api.delete<Combo>(
      '/DeleteCombo', { params: { id: id } }
    );

    if(response.status === 200){
      toast.success('El combo se elimino con exito');
      loadCombos();
      clear();
    }
  }

  async function selectCombo(id: number) {
    const response = await api.get<Combo>(
      '/GetComboById', { params: { id: id } }
    );

    console.log(response.data);

    if(response.status !== 200){
      toast.error('Error al cargar el producto');
      return;
    }

    setInputs(response.data);
  }

  async function handleDialog() {
    let fileName = await ipcRenderer.invoke("showDialog");
    setInputs(values => ({...values, image: fileName}));
  }

  return(
  <Layout>
    <ul className="nav nav-tabs">
        <li className="nav-item">
            <a className="nav-link" aria-current="page" href="/product">Productos</a>
        </li>
        <li className="nav-item">
            <a className="nav-link active" href="/combo">Combos</a>
        </li>
    </ul>
    <ProductList>
        {
        ComboList.map((combo, index) => (
                      <ListGroup key={index}>
                        <ListGroup.Item action key={index} onClick={() => {selectCombo(combo.id);}}>
                          {combo.name}
                          <button className="btn btn-danger btn-sm float-end" onClick={() => {deleteCombo(combo.id)}}>x</button>
                        </ListGroup.Item>
                      </ListGroup>
        ))}
      </ProductList>
      <br/>
      <hr style={divStyle}></hr>
      <br/>
    <form onSubmit={handleSubmit}>
    <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>Nombre:</Form.Label>
        <Form.Control type="text" 
        placeholder="Combo 1" 
        onChange={handleChange} 
        name="name" 
        value={inputs.name || ""} />
      </Form.Group>
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>Description:</Form.Label>
        <Form.Control type="text" 
        placeholder="Lo que sea" 
        onChange={handleChange} 
        name="description" 
        value={inputs.description || ""} />
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
      <Button style={buttonMargin} disabled={inputs.description === undefined && inputs.price === undefined} type="button" variant="primary" onClick={() => clear()}>Nuevo</Button>
    </form>
    <br/>
    <hr style={divStyle}></hr>
    <ProductList>
        {
        products.map((product, index) => (
                      <ListGroup>
                        <ListGroup.Item active= {inputs.products?.find(p => p.id === product.id) !== undefined ? true : false} action key={index} onClick={() => {selectProduct(product.id);}}>
                          {product.name}
                        </ListGroup.Item>
                      </ListGroup>
        ))
        }
      </ProductList>
      <Toaster />
  </Layout>
  )
};

export default ProductInput;
