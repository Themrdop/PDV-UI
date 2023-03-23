import styled from 'styled-components';
import media from 'styled-media-query';

import { Props } from '.';

export const SidebarWrapper = styled.aside`
  border-right: 1px solid #edf0f3;
  background: #f9fafb;
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 2rem;
  width: 400px;

  ${media.lessThan('large')`
  bottom: 0;
flex-direction: row;
height: 200px;
padding: 0;
position: fixed;
width: 100%;
justify-content: space-evenly;
  `}
`;

export const InputWrapper = styled.div`
  display: flex;
  margin-top: 31px;
  div + div {
    margin-left: 8px;
    flex: 1;
  }
  > div:first-child {
    width: 197px;
  }
  label {
    font-size: 14px;
    line-height: 16px;
    color: #292c48;
    font-weight: 300;
    display: block;
    text-align: left;
    padding-left: 20px;
    margin-bottom: 3px;
  }
`;

export const InputBox = styled.div<Props>`
  display: flex;
  align-items: center;
  height: 50px;
  border-width: 2px;
  border-style: solid;
  border-color: rgb(218, 218, 218);
  border-image: initial;
  border-radius: 24px;
  padding: ${(props) => (props.isSmall ? '0 17px' : '0 24px')};
`;

export const Input = styled.input`
  font-size: 24px;
  line-height: 24px;
  width: 100%;
  color: rgb(68, 68, 68);
  background: transparent;
  border: 0;
  outline: none;
  -webkit-font-smoothing: antialiased !important;
  &::placeholder {
    color: #dadada;
  }
`;

export const Receipt = styled.ul`
  overflow: auto;
  height: 100%;
  width: 100%;
  padding: 20px;
  background: #fff9d8;
  box-shadow: 5px 2px 24px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
`;

export const Item = styled.li`
  display: flex;

  justify-content: space-between;
  div {
    font-family: Roboto Mono;
    font-style: normal;
    font-weight: normal;
    font-size: 12px;
    line-height: 14px;
    text-align: initial;
    display: flex;
    margin-bottom: 20px;
    letter-spacing: -0.34px;
  }
`;

export const BillHeader = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  flex: 1;
  font-family: Roboto Mono;
  font-style: bold;
  font-size: 14px;
  line-height: 20px;
  text-align: center;
  margin-top: 1px;
  justify-content: space-between;
`;

export const Total = styled.div`
  display: inline-box;
  flex-direction: column;
  justify-content: space-evenly;
  flex: 1;
  font-family: Roboto;
  font-style: normal;
  font-weight: 500;
  font-size: 24px;
  line-height: 28px;
  align-items: left;
  text-align: left;
  letter-spacing: -0.34px;
  color: #de0000;
  margin-top: 20px;
  justify-content: space-between;

  p {
    text-align: right;
  }
`;

export const Button = styled.button`
  background-color: transparent;
  border: none;
  color: black;
  text-align: center;
  text-decoration: none;
  display: block;
  font-size: 16px;
  margin: 4px 2px;
  border-radius: 50%;
  height: 75px;
  width: 75px;
`;

export const SmallButton = styled.button`
  background-color: transparent;
  border: none;
  color: black;
  text-align: center;
  text-decoration: none;
  display: block;
  font-size: 16px;
  margin: 4px 2px;
  height: 100%;
  width: 65px;
`;

export const ButtonWrapper = styled.div`
  display: inline-box;
  justify-content: space-between;
  margin-top: 20px;
`;