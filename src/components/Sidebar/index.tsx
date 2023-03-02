/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/prop-types */
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Product from '../../pages/Product';
import Profile from '../Profile';

import * as s from './styled';

export interface Props {
  isSmall?: boolean;
}

export interface Stock {
  id: number;
  amount: number;
}

export interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  amount: number;
}

export interface Cart {
  cart: Product[];
}

const Sidebar: React.FC<Props> = ({ isSmall }) => {
  const dispatch = useDispatch();

  const cart = useSelector((state: Cart) => state.cart.map((product) => ({
    ...product,
  })));

  function handlerDelete(product: Product) {
    dispatch({ type: 'DELETE_FROM_CART', payload: product });
  }

  return (
    <s.SidebarWrapper>
      <Profile />
      <s.Receipt>
        <s.Item>
          <div>Descripción</div>
          <div>Cantidad</div>
          <div>Eliminar</div>
        </s.Item>
        {cart.map((p) => (
          <s.Item>
            <div>{p.title}</div>
            <span>{p.amount}</span>
            <button onClick={(e) => handlerDelete(p)}>x</button>
          </s.Item>
        ))}
      </s.Receipt>
    </s.SidebarWrapper>
  );
};

export default Sidebar;
