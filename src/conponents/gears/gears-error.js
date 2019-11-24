import styled from 'styled-components';
import { antiClockWiseErrorStop, antiClockWiseError, clockWiseError  } from './gears-animation';

export const GearOne = styled.div`
    left: -130px;
    animation: ${ antiClockWiseErrorStop } 2s linear infinite;
`;

export const GearTree = styled.div`
    top: -235px;
    left: 130px;
    animation: ${ clockWiseError } 2s linear infinite;
`;

export const GearTwo = styled.div`
    top: -75px;  
    animation: ${ antiClockWiseError } 2s linear infinite;
`;