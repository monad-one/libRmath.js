/*
 *  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  feb 25, 2017
 * 
 *
 *  ORIGINAL AUTHOR
 *    Catherine Loader, catherine@research.bell-labs.com.
 *    October 23, 2000.
 *
 *  Merge in to R:
 *	Copyright (C) 2000, The R Core Team
 *  Changes to case a, b < 2, use logs to avoid underflow
 *	Copyright (C) 2006-2014 The R Core Team
 *
 *  This program is free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program; if not, a copy is available at
 * 
 *  License for JS language implementation
 *  https://www.jacob-bogers/libRmath.js/Licenses/
 * 
 *  License for R statistical package
 *  https://www.r-project.org/Licenses/
 *
 *
 *  DESCRIPTION
 *    Beta density,
 *                   (a+b-1)!     a-1       b-1
 *      p(x;a,b) = ------------ x     (1-x)
 *                 (a-1)!(b-1)!
 *
 *               = (a+b-1) dbinom(a-1; a+b-2,x)
 *
 *    The basic formula for the log density is thus
 *    (a-1) log x + (b-1) log (1-x) - lbeta(a, b)
 *    If either a or b <= 2 then 0 < lbeta(a, b) < 710 and so no
 *    term is large.  We use Loader's code only if both a and b > 2.
 */

import * as debug from 'debug';

import {
  ML_ERR_return_NAN,
  R_D__0,
  R_D_exp,
  R_D_val
} from '../common/_general';

import { boolVector, numVector } from '../types';

import { dbinom_raw } from '../binomial/dbinom';
import { multiplexer } from '../r-func';
import { internal_lbeta } from './lbeta';

const { log , log1p } = Math;
const {
  isNaN: ISNAN,
  isFinite: R_FINITE,
  POSITIVE_INFINITY: ML_POSINF
} = Number;

const printer = debug('dbeta');

export function dbeta(_x: numVector, _a: numVector, _b: numVector, _asLog: boolVector): numVector {
  
  return multiplexer(_x, _a, _b, _asLog)((x, a, b, asLog) => {
    
    if (ISNAN(x) || ISNAN(a) || ISNAN(b)) return x + a + b;

    if (a < 0 || b < 0) return ML_ERR_return_NAN(printer);
    if (x < 0 || x > 1) return R_D__0(asLog);

    // limit cases for (a,b), leading to point masses

    if (a === 0 || b === 0 || !R_FINITE(a) || !R_FINITE(b)) {
      if (a === 0 && b === 0) {
        // point mass 1/2 at each of {0,1} :
        if (x === 0 || x === 1) return ML_POSINF;
        else return R_D__0(asLog);
      }
      if (a === 0 || a / b === 0) {
        // point mass 1 at 0
        if (x === 0) return ML_POSINF;
        else return R_D__0(asLog);
      }
      if (b === 0 || b / a === 0) {
        // point mass 1 at 1
        if (x === 1) return ML_POSINF;
        else return R_D__0(asLog);
      }
      // else, remaining case:  a = b = Inf : point mass 1 at 1/2
      if (x === 0.5) return ML_POSINF;
      else return R_D__0(asLog);
    }

    if (x === 0) {
      if (a > 1) return R_D__0(asLog);
      if (a < 1) return ML_POSINF;
      /* a == 1 : */ return R_D_val(asLog, b);
    }
    if (x === 1) {
      if (b > 1) return R_D__0(asLog);
      if (b < 1) return ML_POSINF;
      /* b == 1 : */ return R_D_val(asLog, a);
    }

    let lval: number;
    if (a <= 2 || b <= 2)
      lval = (a - 1) * log(x) + (b - 1) * log1p(-x) - internal_lbeta(a, b);
    else {
      lval = log(a + b - 1) + dbinom_raw(a - 1, a + b - 2, x, 1 - x, true);
    }
    return R_D_exp(asLog, lval);
  });

}
