# Exercício — Coleta e Validação da Visão 168

## Contexto

Neste projeto já foi feito:

- coleta automática das visões `304` e `315` pelo Playwright
- validador que verifica se as regras de contabilização da `304` estão aplicadas corretamente na `315`

Este exercício é o próximo passo: verificar se os valores orçados na visão `315` chegam corretamente na visão `168`.

A lógica de negócio é:

- a visão `315 - Receitas - Orçamento - Cálculo de Margem` contém o orçamento detalhado, com o valor orçado, a conta contábil e o centro de custo de destino de cada linha
- esses valores devem aparecer na visão `168 - 0.5.1 - Balancete - Acompanhamento - Por Conta`
- o cruzamento é feito pela `Conta Contábil` e pelo `Centro de Custo`

---

## Como fazer

Todo o trabalho técnico deve ser feito pedindo para a LLM. Os passos abaixo descrevem **o que pedir**, não o que programar.

---

## Passo 1 — Adicionar a coleta da visão 168

A visão `0.5.1 - Balancete - Acompanhamento - Por Conta` (ID `168`) precisa ser incluída no fluxo de exportação.

**Peça para a LLM:**

> Preciso que você adicione a visão `0.5.1 - Balancete - Acompanhamento - Por Conta` ao script de coleta existente. O script já coleta as visões `304` e `315`. Quero que ele passe a coletar a `168` também, seguindo o mesmo padrão. Depois execute o script e confirme que o arquivo `vision_168_*.xlsx` foi gerado na pasta `downloads`.

**Como saber que funcionou:**

- no terminal aparece o nome do arquivo exportado da visão `168`
- na pasta `downloads/` existe um arquivo com o padrão `vision_168_*.xlsx`

---

## Passo 2 — Criar o validador 315 → 168

Com os arquivos coletados, a LLM precisa criar um validador que cruze os dados.

**Peça para a LLM:**

> Preciso que você crie um validador que leia o arquivo mais recente da visão `315` e o arquivo mais recente da visão `168` na pasta `downloads`. O validador deve agrupar os valores orçados da `315` por `Conta Contábil` e `Centro de Custo`, somar o `Vlr. Orçado` de cada combinação e verificar se essa combinação existe na `168`. Para cada combinação encontrada, compare o valor somado da `315` com o valor da `168`. Classifique cada linha como:
>
> - `OK` — combinação existe e os valores batem
> - `VALOR_DIVERGENTE` — combinação existe, mas os valores diferem
> - `SEM_CONTA_NA_168` — combinação não encontrada na `168`
>
> Salve os resultados em uma pasta com data e hora dentro de `saidas-validacao`, igual ao que já existe no validador `304 → 315`. Siga o mesmo padrão de arquivos e funções que já estão no projeto.

**Como saber que funcionou:**

- na pasta `saidas-validacao/` aparece uma subpasta nova com a data e hora da execução
- dentro dela existem pelo menos dois arquivos: um `.csv` com o detalhe e um `.json` com o resumo

---

## Passo 3 — Criar o arquivo de execução

Para facilitar as próximas execuções, peça à LLM que crie um arquivo `.bat` para rodar o validador.

**Peça para a LLM:**

> Crie um arquivo `.bat` para executar o validador `315 → 168` que você acabou de criar. Siga o mesmo padrão do `.bat` que já existe no projeto para o validador `304 → 315`.

---

## Passo 4 — Executar e analisar o resultado

Com tudo criado, execute e interprete.

**Peça para a LLM:**

> Execute o `.bat` do validador `315 → 168` e me mostre o resumo dos resultados. Quantas combinações estão com status `OK`, quantas com `VALOR_DIVERGENTE` e quantas com `SEM_CONTA_NA_168`? Se houver divergências, me mostre os exemplos mais relevantes.

---

## Critérios de conclusão

- [ ] arquivo `vision_168_*.xlsx` presente em `downloads/`
- [ ] validador `315 → 168` criado e executado sem erros
- [ ] pasta versionada gerada em `saidas-validacao/<data-hora>/`
- [ ] resumo dos resultados apresentado no terminal
