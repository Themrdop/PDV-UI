import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { MdPayment } from "react-icons/md";
import { FcCancel, FcSafe } from "react-icons/fc";

import * as s from './styled';
import { PaymentModal } from '../Modal/PaymentModal';
import { Cart, CommerceInfo, Product } from '../../models/models';

import toast from 'react-hot-toast';
import api from '../../service/api';

import OrderModal from '../Modal/OrderModal';

export interface Props {
  isSmall?: boolean;
}

const Sidebar: React.FC<Props> = ({ isSmall }: Props) => {
  const dispatch = useDispatch();
  const [showPayment, setPaymentShow] = useState(false);
  const [showOrderProun, setShowOrderProun] = useState(false);
  const [CommerceInfo, setCommerceInfo] = useState<CommerceInfo>({} as CommerceInfo);

  const cart = useSelector((state: Cart) => state.cart.map((product) => ({
    ...product,
  })));

  function handlerDelete(product: Product) {
    dispatch({ type: 'DELETE_FROM_CART', payload: product });
  }

  async function handlePay() {
    if (cart.length > 0) {
      setPaymentShow(true)
    }
  }

  function clean() {
    dispatch({ type: 'CLEAN', payload: cart })
  }

  const showToastMessage = (success: boolean) => {
    if (success) {
      toast.success('El pago se realizó con exito');
    } else {
      toast.error('Problema con el pago');
    }
  };

  async function loadCommerceInfo() {
    const response = await api.get<CommerceInfo>(
      '/GetCommerceInformation',
    );
    setCommerceInfo(response.data);
  }

  useEffect(() => {
    loadCommerceInfo();
  }, []);

  function addOrder(): void {
    if (cart.length > 0) {
      setShowOrderProun(true)
    }
  }

  return (
    <s.SidebarWrapper>
      <s.Receipt>
        <s.BillHeader>{CommerceInfo.name}</s.BillHeader>
        <br />
        <s.Item>
          <div>Descripción</div>
          <div>Cantidad</div>
          <div>Eliminar</div>
        </s.Item>
        {cart.map((p, index) => (
          <s.Item key={index}>
            <div>{p.name}</div>
            <span>{p.amount}</span>
            <s.SmallButton onClick={(e) => handlerDelete(p)}>x</s.SmallButton>
          </s.Item>
        ))}
      </s.Receipt>
      <s.Total>
        Total <p>{cart.reduce((partialSum, product) => partialSum + (product.price * product.amount), 0)}</p>
      </s.Total>
      <s.ButtonWrapper>
        <s.Button onClick={() => handlePay()}>
          <MdPayment size={35} />
          Pagar
        </s.Button>
        <s.Button onClick={() => addOrder()}>
          <FcSafe size={35} />
          Guardar
        </s.Button>
        <s.Button onClick={() => clean()}>
          <FcCancel size={35} />
          Cancelar
        </s.Button>
      </s.ButtonWrapper>
      <PaymentModal products={cart} onClose={(result: boolean) => {
        setPaymentShow(false);
        showToastMessage(result);
        if (result) {
          clean();
        }
      }
      } show={showPayment} />
      <OrderModal products={cart} onClose={(result: boolean) => {
        setShowOrderProun(false);
        if (result) {
          clean();
        }
      }} show={showOrderProun} />
    </s.SidebarWrapper>
  );
};

export default Sidebar;
