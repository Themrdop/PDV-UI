import styled from 'styled-components';

export const Receipt = styled.ul`
  overflow: auto;
  height: 200px;
  width: 300px;
  padding: 10px;
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

export const SmallButton = styled.button`
  background-color: transparent;
  border: none;
  color: black;
  text-align: right;
  text-decoration: none;
  display: block;
  font-size: 16px;
  margin: 4px 2px;
  width: 65px;
`;