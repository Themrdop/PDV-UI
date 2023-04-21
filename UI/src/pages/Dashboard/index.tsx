/* eslint-disable import/no-unresolved */
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

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

import api from '../../service/api';
import { formatPrice } from '../../utils/formatPrice';
import { ProductList } from '../../components/ProductList';

import { Toaster } from 'react-hot-toast';
import { Combo, Product } from '../../models/models';

function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState('');
  const [combos, setCombos] = useState<Combo[]>([]);

  const dispatch = useDispatch();

  async function loadProducts() {
    const response = await api.get<Product[]>(
      '/GetAllProducts',
    );
    console.log(response.data);
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

  function handleAddCombo(combo: Combo) {
    dispatch({ type: 'ADD_TO_CART', payload: combo });
  }

  function handleSearch(query: string) {
    setFilter(query)
  }

  const current = new Date();
  const date = `${current.getDate()}/${current.getMonth()+1}/${current.getFullYear()}`;

  return (
    <Layout name='Dashboard'>
      <s.Search>
        <FiSearch size="24px" color="grey" />
        <s.SearchInput placeholder="Buscar producto" onChange={(event) => handleSearch(event.target.value) } />
      </s.Search>

      {combos.length > 0 ??<s.CategoryContainer>
        <CarouselProvider
          naturalSlideWidth={50}
          naturalSlideHeight={70}
          totalSlides={6}
          visibleSlides={5}
          infinite>
          <Slider>
            {
              combos.filter(f => f.name.toLowerCase().includes(filter.toLowerCase()))
              .map((combo,index) => (
                <Slide index={combo.id} key={index}>
                  <s.CategoryItem>
                    <header onClick={() => handleAddCombo(combo)}>
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
      </s.CategoryContainer>}
      <s.ProductItemContainer>
        <ProductList>
          {
          products.filter(f => f.name.toLowerCase().includes(filter.toLowerCase()))
                  .map((product) => (
                      <li key={product.id} onClick={() => handleAddProduct(product)}>
                        <img src={product.image} alt={product.name} />
                        <span>
                          <strong>{product.name}</strong>
                          <p>{product.priceFormatted}</p>
                        </span>
                      </li>
          ))}
        </ProductList>
      </s.ProductItemContainer>
      <Toaster />
    </Layout>
  )};

export default Dashboard;
