# Passo a passo para acessar e exportar as visoes 304 e 315 no Handit

## Objetivo

Coletar automaticamente as duas visoes usadas no exercicio:

- `2.0.2 - Receitas - Manutencao - Contabilizacao do Resultado`
- `Receitas - Orcamento - Calculo de Margem`

## Identificacao das visoes

### 0. Premissa de contabilizacao

- nome: `2.0.2 - Receitas - Manutencao - Contabilizacao do Resultado`
- ID: `304`
- URL final: `https://modelo-homolog.handit.com.br/#/spreadsheets/view/304`

### 1. Orcamento com aplicacao da regra

- nome: `Receitas - Orcamento - Calculo de Margem`
- ID: `315`
- URL final: `https://modelo-homolog.handit.com.br/#/spreadsheets/view/315`

## Estrutura atual do projeto

- markdowns principais:
  - `docs\`
- scripts, `.bat` e arquivos do Node:
  - `src\`
- downloads exportados:
  - `downloads\`
- saidas do validador:
  - `saidas-validacao\`

Arquivos principais:

- script de exportacao:
  - `C:\handit\workspace\treinamento-serviços\integracao_handit\src\exportar-visao-315-contexto.js`
- script do validador:
  - `C:\handit\workspace\treinamento-serviços\integracao_handit\src\validar-regras-304-315.js`
- arquivo de execucao:
  - `C:\handit\workspace\treinamento-serviços\integracao_handit\src\executar-exportacao-visao-315.bat`
- manifest do Node:
  - `C:\handit\workspace\treinamento-serviços\integracao_handit\src\package.json`

## Ambiente usado

- site: `https://modelo-homolog.handit.com.br`
- automacao: Playwright com Chromium
- credenciais via variaveis de ambiente:
  - `HANDIT_EMAIL`
  - `HANDIT_PASSWORD`

## Sequencia executada

### 1. Abrir o site

Abrir:

- `https://modelo-homolog.handit.com.br`

Resultado observado:

- redirecionamento para:
  - `https://modelo-homolog.handit.com.br/#/login/challenge/pwd`

### 2. Fazer login

Campos utilizados:

- usuario: `#username`
- senha: `#password`
- botao: `Entrar`

Fluxo:

1. preencher `#username`
2. preencher `#password`
3. clicar em `Entrar`
4. aguardar a navegacao para `#/home`

### 3. Abrir a busca global

Na home:

1. clicar em `Pesquisar (Ctrl + K)`
2. usar o input `#search-input`

### 4. Localizar as visoes corretas

Pesquisar no `#search-input`, uma por vez:

- `2.0.2 - Receitas - Manutencao - Contabilizacao do Resultado`
- `Receitas - Orcamento - Calculo de Margem`

Acao tomada:

- clicar na visao exata retornada na busca

### 5. Confirmar as rotas finais

Apos abrir os resultados corretos, a aplicacao carregou:

- `https://modelo-homolog.handit.com.br/#/spreadsheets/view/304`
- `https://modelo-homolog.handit.com.br/#/spreadsheets/view/315`

### 6. Exportar com contexto

Apos abrir cada visao:

1. localizar a barra de acoes acima da grade
2. clicar no botao de exportacao:
   - seletor `#configDropDown`
3. no menu aberto, clicar em:
   - `Exportar para tabela dinamica com contexto`
4. aguardar o download do arquivo `.xlsx`

## Resultado esperado das exportacoes

Arquivos salvos em:

- `downloads\vision_304_*.xlsx`
- `downloads\vision_315_*.xlsx`

## Validacao dos arquivos exportados

### Visao 304

Campos relevantes:

- `DESC_CENARIO`
- `DESC_MERCADO`
- `DESC_MARGEM DE CONTRIBUICAO`
- `Conta Contabil`
- `Centro de Custo`

### Visao 315

Campos relevantes:

- `DESC_CENARIO`
- `DESC_ANO`
- `DESC_MES`
- `DESC_FILIAL`
- `DESC_MERCADO`
- `DESC_MARGEM DE CONTRIBUICAO`
- `Vlr. Orcado`
- `Conta Contabil`
- `Centro de Custo`

## Resumo curto do fluxo

1. abrir `https://modelo-homolog.handit.com.br`
2. fazer login em `#/login/challenge/pwd`
3. aguardar a home `#/home`
4. clicar em `Pesquisar (Ctrl + K)`
5. pesquisar a visao `304`
6. exportar `tabela dinamica com contexto`
7. pesquisar a visao `315`
8. exportar `tabela dinamica com contexto`
9. validar os `.xlsx` salvos na pasta `downloads`

## Observacoes uteis

- o site nao abre direto na visao sem autenticacao
- o login usa os campos `#username` e `#password`
- a busca global foi o caminho mais confiavel para localizar a visao correta
- as visoes ativas no fluxo sao `304` e `315`
- o botao de exportacao usado foi `#configDropDown`
- a `304` e usada como premissa para o validador `304 -> 315`
