import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from 'reselect';
import { MdPayment } from "react-icons/md";
import { FcCancel, FcSafe } from "react-icons/fc";

import * as s from './styled';
import { PaymentModal } from '../Modal/PaymentModal';
import { Cart, CommerceInfo, Product, SavedOrders } from '../../models/models';

import toast from 'react-hot-toast';
import api from '../../service/api';

import OrderNameModal from '../Modal/OrderNameModal';

import "./index.css";
import SavedOrdersList from '../Modal/SavedOrdersList';

export interface Props {
  isSmall?: boolean;
}

const selectCart = createSelector(
  (state: Cart) => state.cart,
  (cart) => cart.map((product) => ({ ...product }))
);

const selectOrders = createSelector(
  (state: SavedOrders) => state.saveOrder,
  (orders) => orders.map((order) => ({ ...order }))
);

const Sidebar: React.FC<Props> = ({ isSmall }: Props) => {
  const dispatch = useDispatch();
  const [showPayment, setPaymentShow] = useState(false);
  const [showSavedorder, setSavedorderShow] = useState(false);
  const [showOrderProun, setShowOrderProun] = useState(false);
  const [CommerceInfo, setCommerceInfo] = useState<CommerceInfo>({} as CommerceInfo);

  const cart = useSelector(selectCart);
  const order = useSelector(selectOrders);

  const memoizedCart = useMemo(() => cart, [cart]);

  function handlerDelete(product: Product) {
    dispatch({ type: 'DELETE_FROM_CART', payload: product });
  }

  const handlePay = () => {
    if (memoizedCart.length > 0) {
      setPaymentShow(true);
    }
  };

  async function handlesavedOrders() {
    if (order.length > 0) {
      setSavedorderShow(true)
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

  const addOrder = useCallback(() => {
    if (memoizedCart.length > 0) {
      setShowOrderProun(true);
    }
  }, [memoizedCart]);

  const handlePaymentModalClose = useCallback((result: boolean) => {
    setPaymentShow(false);
    showToastMessage(result);
    if (result) {
      clean();
    }
  }, [showToastMessage, clean]);

  const handleOrderNameModalClose = useCallback((result: boolean) => {
    setShowOrderProun(false);
    if (result) {
      clean();
    }
  }, [clean]);

  const handleSavedOrdersListClose = useCallback(() => {
    setSavedorderShow(false);
  }, []);

  const MemoizedPaymentModal = React.memo(PaymentModal);
  const MemoizedSavedOrdersList = React.memo(SavedOrdersList);

  return (
    <s.SidebarWrapper>
      <div className="item">
        <s.Receipt>
          {order.length > 0 && <span className="notify-badge" onClick={() => handlesavedOrders()}>{order.length}</span>}
          <s.BillHeader>{CommerceInfo.name}</s.BillHeader>
          <br />
          <s.Item>
            <div>Descripción</div>
            <div>Cantidad</div>
            <div>Eliminar</div>
          </s.Item>
          {memoizedCart.map((p, index) => (
            <s.Item key={index}>
              <div>{p.name}</div>
              <span>{p.amount}</span>
              <s.SmallButton onClick={(e) => handlerDelete(p)}>x</s.SmallButton>
            </s.Item>
          ))}
        </s.Receipt>
      </div>
      <s.Total>
        Total <p>{memoizedCart.reduce((partialSum, product) => partialSum + (product.price * product.amount), 0)}</p>
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
      <MemoizedPaymentModal products={memoizedCart} onClose={handlePaymentModalClose} show={showPayment} />
      <OrderNameModal products={memoizedCart} onClose={handleOrderNameModalClose} show={showOrderProun} />
      <MemoizedSavedOrdersList onClose={handleSavedOrdersListClose} show={showSavedorder} />
    </s.SidebarWrapper>
  );
};export default Sidebar;
