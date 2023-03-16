/* eslint-disable import/no-unresolved */
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import {
  FiSearch, FiChevronRight, FiChevronLeft
} from 'react-icons/fi';

import {
  CarouselProvider, Slider, Slide, ButtonBack, ButtonNext,
} from 'pure-react-carousel';
import 'pure-react-carousel/dist/react-carousel.es.css';

import '../../styles/carrousel.css';

import * as s from './styled';
import Layout from '../../components/Layout';

import bebidas from '../../assets/images/bebidas-icon.svg';
import frios from '../../assets/images/frios-icon.svg';
import salgados from '../../assets/images/salgados-icon.svg';
import sorvetes from '../../assets/images/sorvetes-icon.svg';
import delicatessen from '../../assets/images/delicatessen-ico.svg';
import sanduiche from '../../assets/images/sanduiche-ico.svg';
import api from '../../service/api';
import { formatPrice } from '../../utils/formatPrice';
import { ProductList } from '../../components/ProductList';

import { Toaster } from 'react-hot-toast';

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

export interface Combo {
  id: number;
  name: string;
  description: string;
  image: string;
  products: Product[];
  price: number;
  active: boolean;
}

const Dashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState('');
  const [combos, setCombos] = useState<Combo[]>([]);

  const dispatch = useDispatch();

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

  async function loadCombos() {
    const response = await api.get<Combo[]>('/GetAllCombos');

    setCombos(response.data);
  }

  useEffect(() => {
    loadProducts();
    loadCombos();
  }, []);

  function handleAddProduct(product: Product) {
    dispatch({ type: 'ADD_TO_CART', payload: product });
  }

  function handleSearch(query: string) {
    setFilter(query)
  }

  const current = new Date();
  const date = `${current.getDate()}/${current.getMonth()+1}/${current.getFullYear()}`;

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
      <s.Search>
        <FiSearch size="24px" color="grey" />
        <s.SearchInput placeholder="Buscar producto" onChange={(event) => handleSearch(event.target.value) } />
      </s.Search>

      <s.CategoryContainer>
        <CarouselProvider
          naturalSlideWidth={100}
          naturalSlideHeight={190}
          totalSlides={6}
          visibleSlides={5}
          infinite>
          <Slider>
            {
              combos.map((combo,index) => (
                <Slide index={index}>
                  <s.CategoryItem>
                    <header>
                      <p>{combo.name}</p>
                      <img src={combo.image} alt="" />
                    </header>
                  </s.CategoryItem>
                </Slide>
              ))
            }
          </Slider>
          <ButtonBack className="buttonBack"><FiChevronLeft size="24px" color="grey" /></ButtonBack>
          <ButtonNext className="buttonNext"><FiChevronRight size="24px" color="grey" /></ButtonNext>
        </CarouselProvider>
      </s.CategoryContainer>

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
      <Toaster />
    </Layout>
  );
};

export default Dashboard;
