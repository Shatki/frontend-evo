import { keyframes } from 'styled-components';

/* Анимация */
export const clockWise = keyframes`
  0%    {    transform: rotate(0deg);   }
  100%  {    transform: rotate(360deg); }`;

export const antiClockWise = keyframes`
  0%    {    transform: rotate(360deg); }
  100%  {    transform: rotate(0deg);   }`;

export const clockWiseError = keyframes`
  0%    {    transform: rotate(0deg);   }
  20%   {    transform: rotate(30deg);  }
  40%   {    transform: rotate(25deg);  }
  60%   {    transform: rotate(30deg);  }
  100%  {    transform: rotate(0deg);   }`;

export const antiClockWiseErrorStop = keyframes`
  0%    {    transform: rotate(0deg);   }
  20%   {    transform: rotate(-30deg); }
  60%   {    transform: rotate(-30deg); }
  100%  {    transform: rotate(0deg);   }`;

export const antiClockWiseError = keyframes`
  0%    {    transform: rotate(0deg);   }
  20%   {    transform: rotate(-30deg); }
  40%   {    transform: rotate(-25deg); }
  60%   {    transform: rotate(-30deg); }
  100%  {    transform: rotate(0deg);   }`;


export default {
    clockWise,
    antiClockWise,
    clockWiseError,
    antiClockWiseErrorStop,
    antiClockWiseError
}