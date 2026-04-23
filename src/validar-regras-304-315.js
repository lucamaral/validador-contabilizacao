const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

const DOWNLOADS_DIR = path.join(__dirname, '..', 'downloads');
const OUTPUT_ROOT_DIR = path.join(__dirname, '..', 'saidas-validacao');

const FILE_PATTERNS = {
  view304: /^vision_304_.*\.xlsx$/i,
  view315: /^vision_315_.*\.xlsx$/i,
};

function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

function toComparableText(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function toNumber(value) {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return value;
  const raw = String(value).trim().replace('%', '');
  let normalized = raw;

  if (raw.includes(',') && raw.includes('.')) {
    normalized = raw.replace(/\./g, '').replace(',', '.');
  } else if (raw.includes(',')) {
    normalized = raw.replace(',', '.');
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function csvEscape(value) {
  const stringValue = String(value ?? '');
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function writeCsv(filePath, rows) {
  if (!rows.length) {
    fs.writeFileSync(filePath, '', 'utf8');
    return;
  }

  const headers = Object.keys(rows[0]);
  const lines = [headers.join(',')];

  for (const row of rows) {
    lines.push(headers.map((header) => csvEscape(row[header])).join(','));
  }

  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
}

function getTimestamp() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
  ].join('-') + '_' + [
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join('-');
}

function findLatestFile(dir, pattern) {
  const files = fs
    .readdirSync(dir)
    .filter((name) => pattern.test(name))
    .map((name) => {
      const fullPath = path.join(dir, name);
      return {
        name,
        fullPath,
        mtimeMs: fs.statSync(fullPath).mtimeMs,
      };
    })
    .sort((a, b) => b.mtimeMs - a.mtimeMs);

  if (!files.length) {
    throw new Error(`Nenhum arquivo encontrado para o padrão ${pattern}`);
  }

  return files[0].fullPath;
}

async function readWorksheetRows(filePath) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.worksheets[0];

  const headers = [];
  worksheet.getRow(1).eachCell({ includeEmpty: true }, (cell, colNumber) => {
    headers[colNumber - 1] = String(cell.value ?? '').trim();
  });

  const rows = [];
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;

    const record = {};
    headers.forEach((header, index) => {
      record[header] = row.getCell(index + 1).text ?? '';
    });
    rows.push(record);
  });

  return rows;
}

function ruleKey(row) {
  return [
    normalizeText(row['DESC_CENARIO']),
    normalizeText(row['DESC_MERCADO']),
    normalizeText(row['DESC_MARGEM DE CONTRIBUIÇÃO']),
  ].join('||');
}

function detectStatus(rule, row315) {
  const actualConta = toComparableText(row315['Conta Contábil']);
  const actualCentro = toComparableText(row315['Centro de Custo']);

  if (!rule) {
    return 'SEM_REGRA_NA_304';
  }

  if (!actualConta && !actualCentro) {
    return 'SEM_CONTA_E_CENTRO_NA_315';
  }

  const contaOk = rule.conta === actualConta;
  const centroOk = rule.centro === actualCentro;

  if (contaOk && centroOk) return 'OK';
  if (!contaOk && centroOk) return 'CONTA_DIVERGENTE';
  if (contaOk && !centroOk) return 'CENTRO_DIVERGENTE';
  return 'CONTA_E_CENTRO_DIVERGENTES';
}

async function main() {
  const file304 = findLatestFile(DOWNLOADS_DIR, FILE_PATTERNS.view304);
  const file315 = findLatestFile(DOWNLOADS_DIR, FILE_PATTERNS.view315);

  const rules304 = await readWorksheetRows(file304);
  const rows315 = await readWorksheetRows(file315);

  const rulesMap = new Map();
  for (const row of rules304) {
    rulesMap.set(ruleKey(row), {
      conta: toComparableText(row['Conta Contábil']),
      centro: toComparableText(row['Centro de Custo']),
      mercado: toComparableText(row['DESC_MERCADO']),
      margem: toComparableText(row['DESC_MARGEM DE CONTRIBUIÇÃO']),
      cenario: toComparableText(row['DESC_CENARIO']),
    });
  }

  const detailedRows = [];
  const summaryByStatus = {};
  const summaryByRule = new Map();

  for (const row of rows315) {
    const key = ruleKey(row);
    const rule = rulesMap.get(key);
    const status = detectStatus(rule, row);
    const value = toNumber(row['Vlr. Orçado']);
    const detailed = {
      cenario: toComparableText(row['DESC_CENARIO']),
      ano: toComparableText(row['DESC_ANO']),
      mes: toComparableText(row['DESC_MÊS']),
      filial: toComparableText(row['DESC_FILIAL']),
      mercado: toComparableText(row['DESC_MERCADO']),
      margem_contribuicao: toComparableText(row['DESC_MARGEM DE CONTRIBUIÇÃO']),
      canal_vendas: toComparableText(row['DESC_CANAL DE VENDAS']),
      produto: toComparableText(row['DESC_PRODUTO']),
      valor_orcado: value,
      conta_esperada: rule?.conta ?? '',
      centro_esperado: rule?.centro ?? '',
      conta_atual: toComparableText(row['Conta Contábil']),
      centro_atual: toComparableText(row['Centro de Custo']),
      status,
    };

    detailedRows.push(detailed);
    summaryByStatus[status] = (summaryByStatus[status] ?? 0) + 1;

    const aggregateKey = [
      detailed.cenario,
      detailed.mercado,
      detailed.margem_contribuicao,
      detailed.conta_esperada,
      detailed.centro_esperado,
      detailed.conta_atual,
      detailed.centro_atual,
      status,
    ].join('||');

    if (!summaryByRule.has(aggregateKey)) {
      summaryByRule.set(aggregateKey, {
        cenario: detailed.cenario,
        mercado: detailed.mercado,
        margem_contribuicao: detailed.margem_contribuicao,
        conta_esperada: detailed.conta_esperada,
        centro_esperado: detailed.centro_esperado,
        conta_atual: detailed.conta_atual,
        centro_atual: detailed.centro_atual,
        status,
        quantidade_linhas: 0,
        soma_valor_orcado: 0,
      });
    }

    const bucket = summaryByRule.get(aggregateKey);
    bucket.quantidade_linhas += 1;
    bucket.soma_valor_orcado += value;
  }

  fs.mkdirSync(OUTPUT_ROOT_DIR, { recursive: true });

  const runTimestamp = getTimestamp();
  const outputDir = path.join(OUTPUT_ROOT_DIR, runTimestamp);
  fs.mkdirSync(outputDir, { recursive: true });

  const detailCsvPath = path.join(outputDir, 'validacao_304_315_detalhada.csv');
  const summaryCsvPath = path.join(outputDir, 'validacao_304_315_resumo_por_regra.csv');
  const summaryJsonPath = path.join(outputDir, 'validacao_304_315_resumo.json');

  writeCsv(detailCsvPath, detailedRows);
  writeCsv(summaryCsvPath, Array.from(summaryByRule.values()));

  const summaryJson = {
    pasta_saida: outputDir,
    arquivos_entrada: {
      view304: file304,
      view315: file315,
    },
    totais: {
      linhas_304: rules304.length,
      linhas_315: rows315.length,
      ...summaryByStatus,
    },
  };

  fs.writeFileSync(summaryJsonPath, JSON.stringify(summaryJson, null, 2), 'utf8');

  console.log(`Arquivo 304: ${file304}`);
  console.log(`Arquivo 315: ${file315}`);
  console.log(`Pasta da execucao: ${outputDir}`);
  console.log(`Detalhado: ${detailCsvPath}`);
  console.log(`Resumo por regra: ${summaryCsvPath}`);
  console.log(`Resumo json: ${summaryJsonPath}`);
  console.log(JSON.stringify(summaryJson.totais, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
