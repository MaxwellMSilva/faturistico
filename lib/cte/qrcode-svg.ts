const VERSION = 6;
const TAMANHO = 21 + 4 * (VERSION - 1);
const DADOS_POR_BLOCO = 68;
const ECC_POR_BLOCO = 18;
const CAPACIDADE_DADOS = 136;

const GERADOR_ECC_18 = [
  239, 251, 183, 113, 149, 175,
  199, 215, 240, 220, 73, 82,
  173, 75, 32, 67, 217, 146,
];

function multiplicarGalois(
  xInicial: number,
  yInicial: number
) {
  let x = xInicial;
  let y = yInicial;
  let resultado = 0;

  for (let indice = 0; indice < 8; indice++) {
    if (y & 1) resultado ^= x;

    y >>>= 1;

    const transporte = x & 0x80;
    x = (x << 1) & 0xff;

    if (transporte) x ^= 0x1d;
  }

  return resultado;
}

function gerarEcc(
  dados: number[]
) {
  let resto =
    Array(ECC_POR_BLOCO).fill(0) as number[];

  for (const byte of dados) {
    const fator = byte ^ resto[0];

    resto = [
      ...resto.slice(1),
      0,
    ];

    for (
      let indice = 0;
      indice < ECC_POR_BLOCO;
      indice++
    ) {
      resto[indice] ^=
        multiplicarGalois(
          GERADOR_ECC_18[indice],
          fator
        );
    }
  }

  return resto;
}

function dadosQr(texto: string) {
  const bytes = Array.from(
    new TextEncoder().encode(texto)
  );

  // Versão 6-L comporta 134 bytes em modo byte.
  if (bytes.length > 134) {
    throw new Error(
      "CONTEUDO_QRCODE_CTE_MUITO_LONGO"
    );
  }

  const bits: boolean[] = [];

  function adicionar(
    valor: number,
    quantidade: number
  ) {
    for (
      let indice = quantidade - 1;
      indice >= 0;
      indice--
    ) {
      bits.push(
        ((valor >>> indice) & 1) === 1
      );
    }
  }

  // Modo byte.
  adicionar(0b0100, 4);
  adicionar(bytes.length, 8);

  for (const byte of bytes) {
    adicionar(byte, 8);
  }

  const limite =
    CAPACIDADE_DADOS * 8;

  const terminador = Math.min(
    4,
    limite - bits.length
  );

  for (
    let indice = 0;
    indice < terminador;
    indice++
  ) {
    bits.push(false);
  }

  while (bits.length % 8 !== 0) {
    bits.push(false);
  }

  let alternador = 0;

  while (bits.length < limite) {
    adicionar(
      alternador % 2 === 0
        ? 0xec
        : 0x11,
      8
    );
    alternador++;
  }

  const dados: number[] = [];

  for (
    let inicio = 0;
    inicio < bits.length;
    inicio += 8
  ) {
    let valor = 0;

    for (
      let indice = 0;
      indice < 8;
      indice++
    ) {
      valor =
        (valor << 1) |
        (bits[inicio + indice] ? 1 : 0);
    }

    dados.push(valor);
  }

  const blocos = [
    dados.slice(0, DADOS_POR_BLOCO),
    dados.slice(DADOS_POR_BLOCO),
  ];

  const ecc = blocos.map(gerarEcc);
  const resultado: number[] = [];

  for (
    let indice = 0;
    indice < DADOS_POR_BLOCO;
    indice++
  ) {
    resultado.push(
      blocos[0][indice],
      blocos[1][indice]
    );
  }

  for (
    let indice = 0;
    indice < ECC_POR_BLOCO;
    indice++
  ) {
    resultado.push(
      ecc[0][indice],
      ecc[1][indice]
    );
  }

  return resultado;
}

function digitosBch(valorInicial: number) {
  let valor = valorInicial;
  let quantidade = 0;

  while (valor !== 0) {
    quantidade++;
    valor >>>= 1;
  }

  return quantidade;
}

function informacaoFormato() {
  // Nível L = 1 e máscara 0.
  const dados = 1 << 3;
  const gerador = 0x537;
  const mascara = 0x5412;

  let resto = dados << 10;

  while (
    digitosBch(resto) -
      digitosBch(gerador) >=
    0
  ) {
    resto ^=
      gerador <<
      (digitosBch(resto) -
        digitosBch(gerador));
  }

  return (
    ((dados << 10) | resto) ^
    mascara
  );
}

function gerarMatriz(texto: string) {
  const dados = dadosQr(texto);

  const matriz: Array<Array<boolean | null>> =
    Array.from(
      { length: TAMANHO },
      () =>
        Array(TAMANHO).fill(null) as Array<
          boolean | null
        >
    );

  function marcadorPosicao(
    linha: number,
    coluna: number
  ) {
    for (
      let y = -1;
      y <= 7;
      y++
    ) {
      const linhaAtual = linha + y;

      if (
        linhaAtual < 0 ||
        linhaAtual >= TAMANHO
      ) {
        continue;
      }

      for (
        let x = -1;
        x <= 7;
        x++
      ) {
        const colunaAtual = coluna + x;

        if (
          colunaAtual < 0 ||
          colunaAtual >= TAMANHO
        ) {
          continue;
        }

        matriz[linhaAtual][colunaAtual] =
          (y >= 0 &&
            y <= 6 &&
            (x === 0 || x === 6)) ||
          (x >= 0 &&
            x <= 6 &&
            (y === 0 || y === 6)) ||
          (y >= 2 &&
            y <= 4 &&
            x >= 2 &&
            x <= 4);
      }
    }
  }

  marcadorPosicao(0, 0);
  marcadorPosicao(TAMANHO - 7, 0);
  marcadorPosicao(0, TAMANHO - 7);

  const posicoesAlinhamento = [6, 34];

  for (const linha of posicoesAlinhamento) {
    for (const coluna of posicoesAlinhamento) {
      if (matriz[linha][coluna] !== null) {
        continue;
      }

      for (let y = -2; y <= 2; y++) {
        for (let x = -2; x <= 2; x++) {
          matriz[linha + y][coluna + x] =
            y === -2 ||
            y === 2 ||
            x === -2 ||
            x === 2 ||
            (y === 0 && x === 0);
        }
      }
    }
  }

  for (
    let indice = 8;
    indice < TAMANHO - 8;
    indice++
  ) {
    if (matriz[indice][6] === null) {
      matriz[indice][6] =
        indice % 2 === 0;
    }

    if (matriz[6][indice] === null) {
      matriz[6][indice] =
        indice % 2 === 0;
    }
  }

  const formato = informacaoFormato();

  for (let indice = 0; indice < 15; indice++) {
    const modulo =
      ((formato >>> indice) & 1) === 1;

    if (indice < 6) {
      matriz[indice][8] = modulo;
    } else if (indice < 8) {
      matriz[indice + 1][8] = modulo;
    } else {
      matriz[
        TAMANHO - 15 + indice
      ][8] = modulo;
    }
  }

  for (let indice = 0; indice < 15; indice++) {
    const modulo =
      ((formato >>> indice) & 1) === 1;

    if (indice < 8) {
      matriz[8][
        TAMANHO - indice - 1
      ] = modulo;
    } else if (indice < 9) {
      matriz[8][15 - indice] =
        modulo;
    } else {
      matriz[8][14 - indice] =
        modulo;
    }
  }

  matriz[TAMANHO - 8][8] = true;

  let incremento = -1;
  let linha = TAMANHO - 1;
  let indiceBit = 7;
  let indiceByte = 0;

  for (
    let colunaBase = TAMANHO - 1;
    colunaBase > 0;
    colunaBase -= 2
  ) {
    let coluna = colunaBase;

    if (coluna <= 6) {
      coluna--;
    }

    while (true) {
      for (const atual of [
        coluna,
        coluna - 1,
      ]) {
        if (
          matriz[linha][atual] !== null
        ) {
          continue;
        }

        let escuro = false;

        if (indiceByte < dados.length) {
          escuro =
            ((dados[indiceByte] >>>
              indiceBit) &
              1) ===
            1;
        }

        // Máscara 0.
        if (
          (linha + atual) % 2 === 0
        ) {
          escuro = !escuro;
        }

        matriz[linha][atual] = escuro;

        indiceBit--;

        if (indiceBit === -1) {
          indiceByte++;
          indiceBit = 7;
        }
      }

      linha += incremento;

      if (
        linha < 0 ||
        linha >= TAMANHO
      ) {
        linha -= incremento;
        incremento = -incremento;
        break;
      }
    }
  }

  return matriz.map((linhaAtual) =>
    linhaAtual.map(Boolean)
  );
}

export function gerarQrCodeSvg(
  texto: string,
  escala = 4,
  margem = 4
) {
  const matriz = gerarMatriz(texto);
  const tamanhoFinal =
    (TAMANHO + margem * 2) * escala;

  const comandos: string[] = [];

  for (
    let y = 0;
    y < TAMANHO;
    y++
  ) {
    for (
      let x = 0;
      x < TAMANHO;
      x++
    ) {
      if (!matriz[y][x]) continue;

      comandos.push(
        `M${(x + margem) * escala},${
          (y + margem) * escala
        }h${escala}v${escala}h-${escala}z`
      );
    }
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" ` +
    `viewBox="0 0 ${tamanhoFinal} ${tamanhoFinal}" ` +
    `width="${tamanhoFinal}" height="${tamanhoFinal}" ` +
    `shape-rendering="crispEdges" role="img" aria-label="QR Code do CT-e">` +
    `<rect width="100%" height="100%" fill="white"/>` +
    `<path d="${comandos.join("")}" fill="black"/>` +
    `</svg>`
  );
}
