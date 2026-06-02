type Props = {
  nota: any;
};

export function gerarXml({
  nota,
}: Props) {

  const itensXml = nota.itens
    .map(
      (
        item: any,
        index: number
      ) => `
  <det nItem="${index + 1}">

    <prod>

      <cProd>${item.produto.codigo}</cProd>

      <cEAN></cEAN>

      <xProd>${item.produto.descricao}</xProd>

      <NCM>${item.produto.ncm ?? ""}</NCM>

      <CEST>${item.produto.cest ?? ""}</CEST>

      <CFOP>
        ${
          item.produto.cfopPadrao ??
          nota.naturezaOperacao?.cfop ??
          "5102"
        }
      </CFOP>

      <uCom>${item.produto.unidade}</uCom>

      <qCom>${Number(
        item.quantidade
      ).toFixed(4)}</qCom>

      <vUnCom>${Number(
        item.valorUnitario
      ).toFixed(2)}</vUnCom>

      <vProd>${Number(
        item.valorTotal
      ).toFixed(2)}</vProd>

      <cEANTrib></cEANTrib>

      <uTrib>${item.produto.unidade}</uTrib>

      <qTrib>${Number(
        item.quantidade
      ).toFixed(4)}</qTrib>

      <vUnTrib>${Number(
        item.valorUnitario
      ).toFixed(2)}</vUnTrib>

      <indTot>1</indTot>

    </prod>

    <imposto>

      <ICMS>

        <ICMSSN102>

          <orig>
            ${
              item.produto
                .origemMercadoria ?? 0
            }
          </orig>

          <CSOSN>
            ${
              item.produto.cstIcms ??
              "102"
            }
          </CSOSN>

        </ICMSSN102>

      </ICMS>

      <PIS>

        <PISNT>

          <CST>
            ${
              item.produto.cstPis ??
              "07"
            }
          </CST>

        </PISNT>

      </PIS>

      <COFINS>

        <COFINSNT>

          <CST>
            ${
              item.produto
                .cstCofins ?? "07"
            }
          </CST>

        </COFINSNT>

      </COFINS>

    </imposto>

  </det>
  `
    )
    .join("");

return `<?xml version="1.0" encoding="UTF-8"?>
<NFe>

  <infNFe>

    <ide>

      <cUF>11</cUF>

      <natOp>
        ${nota.naturezaOperacao?.descricao ?? "VENDA"}
      </natOp>

      <mod>55</mod>

      <serie>${nota.serie}</serie>

      <nNF>${nota.numero}</nNF>

      <tpNF>1</tpNF>

      <idDest>1</idDest>

      <cMunFG>
        ${nota.empresa.codigoMunicipio ?? ""}
      </cMunFG>

      <tpImp>1</tpImp>

      <tpEmis>1</tpEmis>

      <tpAmb>2</tpAmb>

      <finNFe>1</finNFe>

      <indFinal>
        ${
          nota.naturezaOperacao
            ?.consumidorFinal
            ? 1
            : 0
        }
      </indFinal>

      <indPres>1</indPres>

      <procEmi>0</procEmi>

      <verProc>Faturistico</verProc>

    </ide>

    <emit>

      <CNPJ>
        ${nota.empresa.cnpj}
      </CNPJ>

      <xNome>
        ${nota.empresa.razaoSocial}
      </xNome>

      <xFant>
        ${
          nota.empresa.nomeFantasia ??
          nota.empresa.razaoSocial
        }
      </xFant>

      <enderEmit>

        <xLgr>
          ${nota.empresa.logradouro ?? ""}
        </xLgr>

        <nro>
          ${nota.empresa.numero ?? ""}
        </nro>

        <xBairro>
          ${nota.empresa.bairro ?? ""}
        </xBairro>

        <cMun>
          ${
            nota.empresa.codigoMunicipio ??
            ""
          }
        </cMun>

        <xMun>
          ${nota.empresa.municipio ?? ""}
        </xMun>

        <UF>
          ${nota.empresa.uf ?? ""}
        </UF>

        <CEP>
          ${nota.empresa.cep ?? ""}
        </CEP>

      </enderEmit>

      <IE>
        ${
          nota.empresa
            .inscricaoEstadual ?? ""
        }
      </IE>

      <CRT>1</CRT>

    </emit>

    <dest>

      <CNPJ>
        ${nota.cliente.cpfCnpj}
      </CNPJ>

      <xNome>
        ${nota.cliente.nome}
      </xNome>

      <enderDest>

        <xLgr>
          ${nota.cliente.logradouro ?? ""}
        </xLgr>

        <nro>
          ${nota.cliente.numero ?? ""}
        </nro>

        <xBairro>
          ${nota.cliente.bairro ?? ""}
        </xBairro>

        <cMun>
          ${
            nota.cliente.codigoMunicipio ??
            ""
          }
        </cMun>

        <xMun>
          ${nota.cliente.municipio ?? ""}
        </xMun>

        <UF>
          ${nota.cliente.uf ?? ""}
        </UF>

        <CEP>
          ${nota.cliente.cep ?? ""}
        </CEP>

      </enderDest>

    </dest>

    ${itensXml}

    <total>

      <ICMSTot>

        <vBC>0.00</vBC>

        <vICMS>0.00</vICMS>

        <vPIS>0.00</vPIS>

        <vCOFINS>0.00</vCOFINS>

        <vProd>
          ${Number(
            nota.valorTotal
          ).toFixed(2)}
        </vProd>

        <vNF>
          ${Number(
            nota.valorTotal
          ).toFixed(2)}
        </vNF>

      </ICMSTot>

    </total>

    <transp>
      <modFrete>9</modFrete>
    </transp>

    <pag>

      <detPag>

        <indPag>0</indPag>

        <tPag>90</tPag>

        <vPag>
          ${Number(
            nota.valorTotal
          ).toFixed(2)}
        </vPag>

      </detPag>

    </pag>

    <infAdic>

      <infCpl>
        ${
          nota.informacoesComplementares ??
          ""
        }
      </infCpl>

    </infAdic>

  </infNFe>

</NFe>`;
}