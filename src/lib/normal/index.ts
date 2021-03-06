
'use strict';
import { dnorm4 as dnorm } from './dnorm';
import { pnorm5 as pnorm } from './pnorm';
import { qnorm } from './qnorm';
import { rnorm } from './rnorm';

import { IRNGNormal, rng } from '../rng';
const { normal: { Inversion } } = rng;

export interface INormal {
  rnorm: (n: number, mu: number, sigma: number) => number | number[];
  dnorm: <T>(x: T, mu: number, sigma: number, giveLog: boolean) => T;
  pnorm: <T>(
    x: T,
    mu: number,
    sigma: number,
    lowerTail: boolean,
    logP: boolean
  ) => T;
  qnorm: <T>(
    p: T,
    mu: number,
    sigma: number,
    lower_tail: boolean,
    log_p: boolean
  ) => T;
  rng: IRNGNormal;
}

export function Normal(rng: IRNGNormal = new Inversion()): INormal {
  
  return {
    rnorm: (n: number = 1, mu: number = 0, sigma = 1) =>
      rnorm(n, mu, sigma, rng),
    dnorm,
    pnorm,
    qnorm,
    rng,
  };
}
