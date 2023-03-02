/* eslint-disable import/no-unresolved */
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import {FiSearch,
} from 'react-icons/fi';

import 'pure-react-carousel/dist/react-carousel.es.css';

import '../../styles/carrousel.css';

import * as s from './styled';
import Layout from '../../components/Layout';

import api from '../../service/api';
import { formatPrice } from '../../utils/formatPrice';
import { ProductList } from '../../components/ProductList';

import { Fab } from 'react-tiny-fab';
import { MdPayment } from "react-icons/md";
import PaymentModal from '../../components/Modal/PaymentModal';

import toast, { Toaster } from 'react-hot-toast';

export interface Stock {
  id: number;
  amount: number;
}

export interface Product {
  id: number;
  title: string;
  price: number;
  amount: number;
  image: string;
  priceFormatted: string;
}

export interface Cart {
  cart: Product[];
}

const Dashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState('');

  const dispatch = useDispatch();

  useEffect(() => {
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

    loadProducts();
  }, []);

  function handleAddProduct(product: Product) {
    dispatch({ type: 'ADD_TO_CART', payload: product });
  }

  function handleSearch(query: string) {
    setFilter(query)
  }

  async function handlePay(){
    if (cart.length > 0) {
      console.log(cart);
      setShow(true)
    }
  }

  function clean() {
    dispatch({ type: 'CLEAN', payload: cart })
  }

  const showToastMessage = (success:boolean) => {
    let messages: string;
    if(success){
      toast.success('El pago se realizó con exito');
    }else{
      toast.error('Problema con el pago');
    }
    
  };

  const [show, setShow] = React.useState(false);

  const current = new Date();
  const date = `${current.getDate()}/${current.getMonth()+1}/${current.getFullYear()}`;

  const cart = useSelector((state: Cart) => state.cart.map((product) => ({
    ...product,
  })));

  return (
    <Layout>
      <s.Header>
        <s.Title>Panel</s.Title>
        <s.Info>
          <span className="cashier">
            CAJA ABIERTA
          </span>
          <span className="date">
            {date}
          </span>
        </s.Info>
      </s.Header>
      <s.CardContainer>
        <s.Card>
          <header>
            <p>Total</p>
          </header>
          <section>
            <p>₡</p>
            <h1>
              {
                cart.reduce((partialSum, product) => partialSum + (product.price * product.amount), 0)
              }
            </h1>
          </section>
        </s.Card>
      </s.CardContainer>
      <s.Search>
        <FiSearch size="24px" color="grey" />
        <s.SearchInput placeholder="Buscar producto" onChange={(event) => handleSearch(event.target.value) } />
      </s.Search>
      
      <ProductList>
        {
        products.filter(f => f.title.toLowerCase().includes(filter.toLowerCase()))
                .map((product) => (
                    <li key={product.id} onClick={() => handleAddProduct(product)}>
                      <img src={product.image} alt={product.title} />
                      <span>
                        <strong>{product.title}</strong>
                        <p>{product.priceFormatted}</p>
                      </span>
                    </li>
        ))}
      </ProductList>
      {cart.length > 0 && <Fab
        alwaysShowTitle={true}
        text="Pagar"
        icon={<MdPayment />}
        onClick={() => handlePay()}
      />}
      <PaymentModal products={cart} onClose={(result: boolean) => 
          {setShow(false);
            showToastMessage(result);
            if(result){
              clean();
            }
          }
        } show={show}>
        <p>This is modal body</p>
      </PaymentModal>
      <Toaster />
    </Layout>
  );
};

export default Dashboard;
