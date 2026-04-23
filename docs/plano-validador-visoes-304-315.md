# Plano para o validador entre as visoes 304 e 315

## Objetivo

Validar o fluxo funcional abaixo:

1. a visao `304 - 2.0.2 - Receitas - Manutenção - Contabilização do Resultado`
   define a regra de contabilizacao por:
   - `cenario`
   - `mercado`
   - `item da margem de contribuição`
2. a visao `315 - Receitas - Orçamento - Cálculo de Margem`
   deve aplicar corretamente essa regra em cada linha do orçamento

## Regra funcional consolidada

Pelo entendimento informado pelo usuario:

- a `304` e uma tela de parametrizacao
- na `304` sao definidos:
  - `Conta Contábil`
  - `Centro de Custo`
- a chave funcional da regra e:
  - `DESC_CENARIO`
  - `DESC_MERCADO`
  - `DESC_MARGEM DE CONTRIBUIÇÃO`
- a `315` contem o detalhe do orçamento mes a mes
- a `315` tambem possui o `Mercado`
- portanto a `315` deve trazer a conta contabil e o centro de custo corretos conforme a regra da `304`

## Arquivos analisados

- `vision_304_*.xlsx`
- `vision_315_*.xlsx`

Arquivos auxiliares temporarios:

- `vision_304_latest.csv`
- `vision_315_latest.csv`

## Estrutura identificada

### Visao 304

Campos relevantes:

- `DESC_CENARIO`
- `DESC_MERCADO`
- `DESC_MARGEM DE CONTRIBUIÇÃO`
- `Conta Contábil`
- `Centro de Custo`

Observacoes:

- e uma tabela de premissas
- cada linha representa uma regra de destino contabil

### Visao 315

Campos relevantes:

- `DESC_CENARIO`
- `DESC_ANO`
- `DESC_MÊS`
- `DESC_FILIAL`
- `DESC_MERCADO`
- `DESC_MARGEM DE CONTRIBUIÇÃO`
- `Vlr. Orçado`
- `Conta Contábil`
- `Centro de Custo`

Observacoes:

- quando a linha participa do repasse contabil, ela pode trazer conta e centro preenchidos

## Achados principais

### 1. A validacao 304 -> 315 e viavel

A chave funcional mais aderente entre `304` e `315` e:

- `DESC_CENARIO`
- `DESC_MERCADO`
- `DESC_MARGEM DE CONTRIBUIÇÃO`

Essa comparacao ja permite identificar:

- linhas em conformidade
- linhas sem regra correspondente na `304`
- linhas com conta divergente
- linhas com centro divergente
- linhas com conta e centro divergentes

### 2. Ja houve divergencia real encontrada

Exemplo observado:

- `DESC_CENARIO = Realista`
- `DESC_MERCADO = Mercado Interno`
- `DESC_MARGEM DE CONTRIBUIÇÃO = Faturamento Bruto`

Premissa da `304`:

- `Conta Contábil = 31004 - Venda de Produtos - ZFM`
- `Centro de Custo = 21001 - Vendas`

Aplicacao na `315`:

- `Conta Contábil = 31001 - Venda de Produtos`
- `Centro de Custo = 21001 - Vendas`

Interpretacao:

- o centro de custo estava correto
- a conta contabil estava divergente

## Proposta de validador

### MVP

Criar um validador `304 -> 315` com:

- leitura dos `.xlsx`
- cruzamento pela chave funcional
- comparacao de conta e centro
- geracao de:
  - detalhado por linha
  - resumo por status
  - resumo agregado por regra

### Status sugeridos

- `OK`
- `SEM_REGRA_NA_304`
- `SEM_CONTA_E_CENTRO_NA_315`
- `CONTA_DIVERGENTE`
- `CENTRO_DIVERGENTE`
- `CONTA_E_CENTRO_DIVERGENTES`

### Saidas sugeridas

- `validacao_304_315_detalhada.csv`
- `validacao_304_315_resumo_por_regra.csv`
- `validacao_304_315_resumo.json`

## Conclusao

Para o exercicio, o foco pode ficar totalmente em:

- premissa na `304`
- aplicacao da regra na `315`

Sem depender de reconciliacao posterior em outra visao.
