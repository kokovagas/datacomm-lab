import * as math from 'mathjs';

export class FFT {
  public fft(x: math.Complex[]): math.Complex[] {
    // Base case
    if (x.length === 1) {
      return [x[0]];
    }

    // Radix 2 Cooley-Turkey FFT
    if (x.length % 2 !== 0) {
      throw new Error('Length of array `x` must be a power of 2.');
    }

    // FFT of even terms
    const even: math.Complex[] = new Array(x.length / 2);
    for (let i = 0; i < x.length / 2; i++) {
      even[i] = x[2 * i];
    }
    const p: math.Complex[] = this.fft(even);

    // FFT of odd terms
    // Reuse array
    const odd: math.Complex[] = even;
    for (let i = 0; i < x.length / 2; i++) {
      odd[i] = x[2 * i + 1];
    }
    const q: math.Complex[] = this.fft(odd);

    // Combine
    const y: math.Complex[] = new Array(x.length);
    for (let i = 0; i < x.length / 2; i++) {
      const kth = (-2 * i * Math.PI) / x.length;
      const wk = math.complex(Math.cos(kth), Math.sin(kth));

      y[i] = math.complex(math.add(p[i], math.multiply(wk, q[i])).toString());
      y[i + x.length / 2] = math.complex(
        math.subtract(p[i], math.multiply(wk, q[i])).toString()
      );
    }

    return y;
  }

  public ifft(x: math.Complex[]): math.Complex[] {
    // Take conjugate
    let y: math.Complex[] = x.map((i) => math.complex(math.conj(i).toString()));

    // Compute forward FFT
    y = this.fft(y);

    // Take conjugate again
    y = y.map((i) => math.complex(math.conj(i).toString()));

    // Divide by array length
    y = y.map((i) => math.complex(math.divide(i, x.length).toString()));

    return y;
  }

  public cconvolve(x: math.Complex[], y: math.Complex[]): math.Complex[] {
    if (x.length !== y.length) {
      throw new Error('Arrays must have equal length.');
    }

    if (x.length % 2 !== 0) {
      throw new Error('Array lengths must be a power of 2');
    }

    // Compute FFT of each sequence
    const a: math.Complex[] = this.fft(x);
    const b: math.Complex[] = this.fft(y);

    // Point-wise multiplication
    const c: math.Complex[] = new Array(x.length);
    for (let i = 0; i < x.length; i++) {
      c[i] = math.complex(math.multiply(a[i], b[i]).toString());
    }

    // Compute inverse FFT
    return this.ifft(c);
  }

  public convolve(x: math.Complex[], y: math.Complex[]): math.Complex[] {
    const ZERO: math.Complex = math.complex(0, 0);

    let a: math.Complex[] = new Array(2 * x.length);
    a = x.slice(0);
    for (let i = x.length; i < 2 * x.length; i++) {
      a[i] = ZERO;
    }

    let b: math.Complex[] = new Array(2 * y.length);
    b = y.slice(0);
    for (let i = y.length; i < 2 * y.length; i++) {
      b[i] = ZERO;
    }

    return this.cconvolve(a, b);
  }
}