import React, { useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../service/api';
import { Product } from '../Dashboard';

const ProductInput: React.FC = () => {
  
  const [inputs, setInputs] = useState<Product>({
    id: 0, title: '', price: 0, image: '', amount: 0,
    priceFormatted: ''
  });

  const handleChange = (event: { target: { name: any; value: any; }; }) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputs(values => ({...values, [name]: value}));
  }
  
  const handleSubmit = async (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    console.log(inputs);

    await api.post<Product>(
      '/AddProduct', {title: inputs.title, price: inputs.price, image: inputs.image}
    );
  }

  return(
  <Layout>
    <h1>Product</h1>
    <form onSubmit={handleSubmit}>
      <label>Nombre:
      <input 
        type="text" 
        name="title" 
        value={inputs.title || ""} 
        onChange={handleChange}
      />
      <br/>
      </label>
      <label>Precio:
        <input 
          type="text" 
          name="price" 
          value={inputs.price || ""} 
          onChange={handleChange}
        />
      </label>
      <br/>
      <label>Direccion de la imagen:
        <input 
          type="text" 
          name="image" 
          value={inputs.image || ""} 
          onChange={handleChange}
        />
      </label>
      <br/>
      <input type="submit" />
    </form>
  </Layout>
  )
};

export default ProductInput;
