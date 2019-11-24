import styled from 'styled-components';

import { clockWise, antiClockWise } from './gears-animation';


export const GearOne = styled.div`
    left: -130px;
    animation: ${ clockWise } 3s linear infinite;
`;

export const GearTree = styled.div`
    top: -235px;
    left: 130px;
    animation: ${ clockWise } 3s linear infinite;
`;

export const GearTwo = styled.div`
    top: -75px;  
    animation: ${ antiClockWise } 3s linear infinite;
`;