# Resultado da análise do validador 304 -> 315

## Objetivo

Validar se a premissa de contabilização da visão:

- `304 - 2.0.2 - Receitas - Manutenção - Contabilização do Resultado`

está sendo aplicada corretamente na visão:

- `315 - Receitas - Orçamento - Cálculo de Margem`

## Regra de cruzamento utilizada

O cruzamento foi feito pela chave funcional:

- `DESC_CENARIO`
- `DESC_MERCADO`
- `DESC_MARGEM DE CONTRIBUIÇÃO`

Para cada linha da `315`, o validador compara:

- `Conta Contábil` esperada na `304`
- `Centro de Custo` esperado na `304`

contra:

- `Conta Contábil` atual da `315`
- `Centro de Custo` atual da `315`

## Arquivos usados

Entradas:

- `C:\handit\workspace\treinamento-serviços\integracao_handit\downloads\vision_304_23_04_2026 - 17_04_46.xlsx`
- `C:\handit\workspace\treinamento-serviços\integracao_handit\downloads\vision_315_23_04_2026 - 16_47_42.xlsx`

Saídas geradas pelo validador:

- `C:\handit\workspace\treinamento-serviços\integracao_handit\saidas-validacao\validacao_304_315_detalhada.csv`
- `C:\handit\workspace\treinamento-serviços\integracao_handit\saidas-validacao\validacao_304_315_resumo_por_regra.csv`
- `C:\handit\workspace\treinamento-serviços\integracao_handit\saidas-validacao\validacao_304_315_resumo.json`

## Script utilizado

- `C:\handit\workspace\treinamento-serviços\integracao_handit\validar-regras-304-315.js`

## Resultado consolidado

Totais encontrados:

- linhas da `304`: `32`
- linhas da `315`: `77160`
- linhas `OK`: `49460`
- linhas `SEM_REGRA_NA_304`: `24100`
- linhas `CONTA_DIVERGENTE`: `3600`

Status encontrados nesta execução:

- `OK`
- `SEM_REGRA_NA_304`
- `CONTA_DIVERGENTE`

Não apareceram nesta execução:

- `CENTRO_DIVERGENTE`
- `CONTA_E_CENTRO_DIVERGENTES`
- `SEM_CONTA_E_CENTRO_NA_315`

## Interpretação do resultado

### 1. A validação é viável

Sim, foi possível validar automaticamente a aplicação da premissa da `304` sobre a `315`.

### 2. Há divergências reais

Foi encontrada divergência de conta contábil em:

- `3600` linhas da `315`

### 3. Há muitas linhas sem regra correspondente na 304

Foi identificado que:

- `24100` linhas da `315`

não encontraram uma regra correspondente na `304` para a chave:

- `cenário + mercado + margem de contribuição`

Isso pode significar:

- itens da `315` que ainda não possuem parametrização na `304`
- itens que não deveriam mesmo ser parametrizados nessa premissa
- ou necessidade de ampliar a regra funcional do cruzamento

## Principal divergência encontrada

O maior desvio encontrado no resumo por regra foi:

- `Cenário`: `Realista`
- `Mercado`: `Mercado Interno`
- `Margem de Contribuição`: `Faturamento Bruto`
- `Conta esperada`: `31004 - Venda de Produtos - ZFM`
- `Centro esperado`: `21001 - Vendas`
- `Conta atual na 315`: `31001 - Venda de Produtos`
- `Centro atual na 315`: `21001 - Vendas`
- `Status`: `CONTA_DIVERGENTE`
- `Quantidade de linhas`: `3600`
- `Soma do valor orçado`: `22960241.503028102`

Interpretação:

- o centro de custo está correto
- a conta contábil aplicada na `315` diverge da conta definida na premissa da `304`

## Conclusão

O validador `304 -> 315` já atende ao objetivo principal de identificar se:

- a conta contábil está correta
- o centro de custo está correto
- ou se a linha da `315` não possui regra correspondente na `304`

Nesta execução, o principal problema encontrado foi:

- divergência de `Conta Contábil`

e não de `Centro de Custo`.

## Próximos passos sugeridos

1. revisar na `304` e na `315` a regra de `Faturamento Bruto` para `Mercado Interno`
2. investigar se as linhas `SEM_REGRA_NA_304` devem ser parametrizadas ou ignoradas
3. gerar uma saída filtrada apenas com divergências para facilitar a revisão do time funcional
4. depois evoluir para a segunda camada do validador:
   - `315 -> 168`
