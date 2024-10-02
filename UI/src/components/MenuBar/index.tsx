import React, { memo } from 'react';

import {
  FiUser, FiSliders, FiBox, FiMonitor, FiInfo, FiSmile,
} from 'react-icons/fi';
import {
  RiBillLine
} from 'react-icons/ri';

import LogoImg from '../../assets/logo.png';

import * as s from './styled';
import { BsFillEnvelopeFill } from 'react-icons/bs';

// Memoize the MenuBarLink component to prevent unnecessary re-renders
const MemoizedMenuBarLink = memo(s.MenuBarLink);

// Memoize the FiSliders component to prevent unnecessary re-renders
const MemoizedFiSliders = memo(FiSliders);

// Memoize the FiBox component to prevent unnecessary re-renders
const MemoizedFiBox = memo(FiBox);

// Memoize the FiMonitor component to prevent unnecessary re-renders
const MemoizedFiMonitor = memo(FiMonitor);

const MenuBar: React.FC = () => (
  <s.MenuBarWrapper>
    <s.MenuBarLogo>
      <img src={LogoImg} alt="Logo" />
    </s.MenuBarLogo>
    <s.MenuBarGroup>
      <MemoizedMenuBarLink to="/" title="Home">
        <s.MenuBarItem>
          <MemoizedFiMonitor size="1.6em" />
        </s.MenuBarItem>
      </MemoizedMenuBarLink>
      <MemoizedMenuBarLink to="/product" title="Produtos">
        <s.MenuBarItem>
          <MemoizedFiBox size="1.6em" />
        </s.MenuBarItem>
      </MemoizedMenuBarLink>
      <MemoizedMenuBarLink to="/configuration" title="Configuración">
        <s.MenuBarItem title="Configuración">
          <MemoizedFiSliders size="1.6em" />
        </s.MenuBarItem>
      </MemoizedMenuBarLink>
      <MemoizedMenuBarLink to="/bill" title="Facturas">
        <s.MenuBarItem>
          <RiBillLine size="1.6em" />
        </s.MenuBarItem>
      </MemoizedMenuBarLink>
      <MemoizedMenuBarLink to="/sales" title="Ventas">
        <s.MenuBarItem>
          <FiSmile size="1.6em" />
        </s.MenuBarItem>
      </MemoizedMenuBarLink>
    </s.MenuBarGroup>
  </s.MenuBarWrapper>
);

export default MenuBar;
