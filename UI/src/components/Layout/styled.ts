import styled from 'styled-components';
import media from 'styled-media-query';

export const LayoutWrapper = styled.section`
  display: flex;
`;
export const LayoutMain = styled.main`
  ${media.lessThan('large')`
    margin-top: 70px;
  `}
  background: #fff;
  
  flex: 1;
  padding: 10px 10px;
`;
