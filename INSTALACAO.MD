# Instalacao do projeto

## Objetivo

Este projeto faz duas coisas:

1. exporta automaticamente as visoes do Handit usando Playwright
2. valida se as regras da visao `304` estao aplicadas corretamente na visao `315`

Este guia foi escrito para quem usa Windows e nao tem tanta familiaridade com Node, terminal ou automacao.

## Estrutura do projeto

As pastas mais importantes sao:

- `docs`
  - documentacao do projeto
- `src`
  - scripts, `.bat` e arquivos do Node
- `downloads`
  - arquivos `.xlsx` exportados do Handit
- `saidas-validacao`
  - resultados do validador

Arquivos principais:

- `src\executar-exportacao-visao-315.bat`
- `src\exportar-visao-315-contexto.js`
- `src\validar-regras-304-315.js`
- `src\package.json`

## O que precisa estar instalado

Antes de usar o projeto, voce precisa instalar:

1. `Node.js`
2. os navegadores do Playwright

Opcional, mas recomendado:

1. Microsoft Excel para abrir os `.xlsx`

## Passo 1. Instalar o Node.js no Windows

### Como baixar

1. Abra o site oficial:
   - `https://nodejs.org/`
2. Baixe a versao `LTS`
3. Execute o instalador

### Durante a instalacao

Pode manter as opcoes padrao.

Importante:

- deixe marcada a opcao que adiciona o Node ao `PATH`, se ela aparecer

### Como confirmar

Depois da instalacao:

1. feche o terminal que estiver aberto
2. abra um novo `Prompt de Comando` ou `PowerShell`
3. execute:

```powershell
node -v
npm -v
```

Se aparecerem versoes, por exemplo `v22.x.x` e `10.x.x`, a instalacao funcionou.

## Passo 2. Baixar o projeto

Se voce recebeu o projeto compactado:

1. extraia o `.zip`
2. escolha uma pasta simples, por exemplo:
   - `C:\handit\integracao_handit`

Se voce baixou por Git:

1. clone o repositorio
2. abra a pasta do projeto

## Passo 3. Abrir a pasta correta no terminal

Abra o `PowerShell` dentro da pasta raiz do projeto.

Exemplo:

```powershell
cd C:\handit\integracao_handit
```

Voce deve estar na pasta onde existem:

- `docs`
- `src`
- `downloads`
- `saidas-validacao`

## Passo 4. Instalar as dependencias do projeto

As dependencias do Node ficam descritas em:

- `src\package.json`

Para instalar:

```powershell
cd .\src
npm install
```

Esse comando instala, principalmente:

- `playwright`
- `exceljs`

Ao final, o projeto tera a pasta `node_modules` na raiz ou sera reutilizada se ela ja existir.

## Passo 5. Instalar os navegadores do Playwright

Depois de instalar as dependencias, ainda dentro da pasta `src`, execute:

```powershell
npx playwright install
```

Esse comando baixa os navegadores usados pela automacao.

Se quiser instalar apenas o Chromium:

```powershell
npx playwright install chromium
```

## Passo 6. Testar se a instalacao funcionou

Ainda dentro da pasta `src`, execute:

```powershell
node .\exportar-visao-315-contexto.js
```

Se aparecer a mensagem informando que faltam as variaveis `HANDIT_EMAIL` e `HANDIT_PASSWORD`, isso e esperado. Significa que:

- o Node esta funcionando
- o Playwright esta instalado
- o script conseguiu iniciar

## Passo 7. Configurar usuario e senha

O projeto usa estas variaveis de ambiente:

- `HANDIT_EMAIL`
- `HANDIT_PASSWORD`

Voce pode definir essas variaveis de duas formas.

### Opcao A. Usar o `.bat` pronto

O arquivo:

- `src\executar-exportacao-visao-315.bat`

ja define email e senha dentro dele.

Se voce for usar esse caminho:

1. abra o arquivo `.bat` no Bloco de Notas
2. ajuste estas linhas:

```bat
set "HANDIT_EMAIL=seu_email_aqui"
set "HANDIT_PASSWORD=sua_senha_aqui"
```

3. salve o arquivo

Essa e a forma mais simples para usuarios de Windows.

### Opcao B. Definir as variaveis manualmente no PowerShell

Se preferir nao deixar a senha gravada no `.bat`, execute:

```powershell
$env:HANDIT_EMAIL="seu_email_aqui"
$env:HANDIT_PASSWORD="sua_senha_aqui"
```

Depois rode o script normalmente.

Observacao:

- essas variaveis valem apenas para a janela atual do PowerShell

## Passo 8. Rodar a exportacao automatica

### Forma mais simples no Windows

Na pasta `src`, execute:

```powershell
.\executar-exportacao-visao-315.bat
```

Ou simplesmente de um duplo clique no arquivo:

- `src\executar-exportacao-visao-315.bat`

### O que esse arquivo faz

Ele:

1. faz login no Handit
2. abre a visao `304`
3. exporta `tabela dinamica com contexto`
4. abre a visao `315`
5. exporta `tabela dinamica com contexto`

### Onde os arquivos ficam

Os arquivos exportados sao salvos em:

- `downloads`

Exemplos:

- `downloads\vision_304_23_04_2026 - 17_36_47.xlsx`
- `downloads\vision_315_23_04_2026 - 17_37_04.xlsx`

## Passo 9. Rodar o validador

Depois de ter pelo menos um arquivo recente da `304` e um da `315`, execute:

```powershell
cd .\src
node .\validar-regras-304-315.js
```

### O que o validador faz

Ele:

1. procura o arquivo mais recente da visao `304` em `downloads`
2. procura o arquivo mais recente da visao `315` em `downloads`
3. cruza as regras da `304` com as linhas da `315`
4. gera arquivos de resultado

### Onde os resultados ficam

Os resultados sao gravados em:

- `saidas-validacao`

Cada execucao cria uma pasta com data e hora.

Exemplo:

- `saidas-validacao\2026-04-23_17-37-28`

Arquivos gerados:

- `validacao_304_315_detalhada.csv`
- `validacao_304_315_resumo_por_regra.csv`
- `validacao_304_315_resumo.json`

## Passo 10. Como abrir os resultados

### Arquivos exportados do Handit

Abra os `.xlsx` da pasta `downloads` no Excel.

### Resultado do validador

Voce pode abrir:

- os `.csv` no Excel
- o `.json` no Bloco de Notas, VS Code ou Notepad++

## Fluxo recomendado de uso

Para usar o projeto no dia a dia, siga esta ordem:

1. abrir a pasta do projeto
2. entrar em `src`
3. executar `executar-exportacao-visao-315.bat`
4. esperar os arquivos `.xlsx` serem gerados em `downloads`
5. executar `node .\validar-regras-304-315.js`
6. abrir a pasta nova em `saidas-validacao`
7. analisar os `.csv`

## Comandos prontos

### Instalar dependencias

```powershell
cd C:\handit\integracao_handit\src
npm install
```

### Instalar navegadores do Playwright

```powershell
cd C:\handit\integracao_handit\src
npx playwright install
```

### Rodar exportacao

```powershell
cd C:\handit\integracao_handit\src
.\executar-exportacao-visao-315.bat
```

### Rodar validacao

```powershell
cd C:\handit\integracao_handit\src
node .\validar-regras-304-315.js
```

## Problemas comuns

### 1. `node` nao e reconhecido

Causa comum:

- Node.js nao foi instalado
- ou o terminal foi aberto antes da instalacao

Como resolver:

1. confirme se o Node foi instalado
2. feche o terminal
3. abra novamente
4. teste `node -v`

### 2. `npm install` falha

Como resolver:

1. confirme que voce esta na pasta `src`
2. confirme que o arquivo `package.json` existe em `src`
3. rode novamente:

```powershell
npm install
```

### 3. erro do Playwright dizendo que o navegador nao esta instalado

Como resolver:

```powershell
cd .\src
npx playwright install
```

### 4. a automacao nao consegue fazer login

Verifique:

1. se o email e a senha estao corretos
2. se o site esta no ar
3. se houve mudanca na tela de login

### 5. nao apareceu arquivo novo em `downloads`

Verifique:

1. se a exportacao terminou sem erro
2. se o navegador conseguiu abrir a visao certa
3. se a opcao `Exportar para tabela dinamica com contexto` continua disponivel

### 6. o validador nao encontra arquivos

Causa comum:

- nao existe arquivo recente da `304` ou da `315` na pasta `downloads`

Como resolver:

1. rode novamente a exportacao
2. confirme se existem arquivos com nomes como:
   - `vision_304_...xlsx`
   - `vision_315_...xlsx`

## Atualizacao do projeto

Quando voce receber uma versao nova do projeto:

1. substitua os arquivos da pasta
2. abra o terminal em `src`
3. rode novamente:

```powershell
npm install
```

Se houver mudanca de navegador ou de versao do Playwright, rode tambem:

```powershell
npx playwright install
```

## Arquivos de apoio

Se precisar entender melhor o projeto, consulte:

- [passo-a-passo-playwright-visao-315.md](C:\handit\workspace\treinamento-serviços\integracao_handit\docs\passo-a-passo-playwright-visao-315.md)
- [plano-validador-visoes-304-315.md](C:\handit\workspace\treinamento-serviços\integracao_handit\docs\plano-validador-visoes-304-315.md)
- [resumo-da-conversa.md](C:\handit\workspace\treinamento-serviços\integracao_handit\docs\resumo-da-conversa.md)

## Resumo final

Se quiser o caminho mais curto:

1. instale `Node.js`
2. abra a pasta `src`
3. rode `npm install`
4. rode `npx playwright install`
5. ajuste `src\executar-exportacao-visao-315.bat` com seu email e senha
6. execute `src\executar-exportacao-visao-315.bat`
7. execute `node .\src\validar-regras-304-315.js` a partir da raiz, ou `node .\validar-regras-304-315.js` dentro de `src`
8. veja os resultados em `saidas-validacao`
