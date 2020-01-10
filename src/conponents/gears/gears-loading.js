import styled from 'styled-components';

import { clockWise, antiClockWise } from './gears-animation';

// Верхняя
export const GearOne = styled.div`
    top: 30px;
    animation: ${ clockWise } 3s linear infinite;`;

// Средняя
export const GearTwo = styled.div`
    top: +45px;
    left: +30px;
    animation: ${ antiClockWise } 3s linear infinite;`;

// Нижняя
export const GearTree = styled.div`
    top: +60px;
    animation: ${ clockWise } 3s linear infinite;`;
