import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

interface ConversionOptions {
  inputPath: string;
  outputPath?: string;
  sheetName?: string;
  hasHeaders?: boolean;
  format?: 'csv' | 'tsv';
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
📊 Excel to CSV Converter - Quetz

Uso:
  tsx scripts/excel-to-csv.ts <input.xlsx> [output.csv] [opciones]

Opciones:
  --sheet <nombre>     # Especificar hoja específica
  --no-headers         # Archivo sin headers
  --format tsv         # Usar formato TSV en lugar de CSV
  --help               # Mostrar esta ayuda

Ejemplos:
  tsx scripts/excel-to-csv.ts data/leads.xlsx data/leads.csv
  tsx scripts/excel-to-csv.ts leads.xlsx --sheet "Corporate Leads"
  tsx scripts/excel-to-csv.ts contacts.xlsx contacts.tsv --format tsv
    `);
    process.exit(0);
  }

  if (args[0] === '--help') {
    console.log(`
📊 Excel to CSV Converter - Quetz

Uso:
  tsx scripts/excel-to-csv.ts <input.xlsx> [output.csv] [opciones]

Opciones:
  --sheet <nombre>     # Especificar hoja específica
  --no-headers         # Archivo sin headers
  --format tsv         # Usar formato TSV en lugar de CSV
  --help               # Mostrar esta ayuda

Ejemplos:
  tsx scripts/excel-to-csv.ts data/leads.xlsx data/leads.csv
  tsx scripts/excel-to-csv.ts leads.xlsx --sheet "Corporate Leads"
  tsx scripts/excel-to-csv.ts contacts.xlsx contacts.tsv --format tsv
    `);
    process.exit(0);
  }

  const inputPath = args[0];
  const flags = parseFlags(args.slice(1));

  if (!inputPath) {
    console.error('❌ Debes especificar el archivo de entrada');
    process.exit(1);
  }

  if (!fs.existsSync(inputPath)) {
    console.error(`❌ El archivo no existe: ${inputPath}`);
    process.exit(1);
  }

  // Generar nombre de salida automáticamente si no se especifica
  let outputPath = flags.output;
  if (!outputPath) {
    const ext = flags.format === 'tsv' ? '.tsv' : '.csv';
    const baseName = path.basename(inputPath, path.extname(inputPath));
    const dirName = path.dirname(inputPath);
    outputPath = path.join(dirName, baseName + ext);
  }

  const options: ConversionOptions = {
    inputPath,
    outputPath,
    sheetName: flags.sheet,
    hasHeaders: !flags['no-headers'],
    format: flags.format as 'csv' | 'tsv' || 'csv',
  };

  try {
    await convertExcelToCsv(options);
  } catch (error) {
    console.error('❌ Error durante la conversión:', error);
    process.exit(1);
  }
}

async function convertExcelToCsv(options: ConversionOptions): Promise<void> {
  const { inputPath, outputPath, sheetName, hasHeaders, format } = options;

  console.log(`📊 Convirtiendo Excel a ${format?.toUpperCase() || 'CSV'}...`);
  console.log(`   Entrada: ${inputPath}`);
  console.log(`   Salida:  ${outputPath}`);

  try {
    // Leer el archivo Excel
    const workbook = XLSX.readFile(inputPath);

    // Listar hojas disponibles
    console.log(`📋 Hojas encontradas: ${workbook.SheetNames.join(', ')}`);

    // Seleccionar hoja
    let targetSheet = sheetName;
    if (!targetSheet) {
      targetSheet = workbook.SheetNames[0];
      console.log(`📄 Usando la primera hoja: ${targetSheet}`);
    } else {
      if (!workbook.SheetNames.includes(targetSheet)) {
        console.error(`❌ La hoja "${targetSheet}" no existe en el archivo`);
        console.log(`   Hojas disponibles: ${workbook.SheetNames.join(', ')}`);
        process.exit(1);
      }
      console.log(`📄 Usando hoja especificada: ${targetSheet}`);
    }

    const worksheet = workbook.Sheets[targetSheet];

    // Obtener rango de datos
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    console.log(`📐 Rango de datos: ${XLSX.utils.encode_range(range)}`);

    // Convertir a array de objetos o arrays
    let data;
    if (hasHeaders) {
      data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    } else {
      data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    }

    if (data.length === 0) {
      console.error('❌ No se encontraron datos en la hoja');
      process.exit(1);
    }

    console.log(`📊 Filas encontradas: ${data.length}`);

    // Mostrar preview de los datos
    if (hasHeaders && data.length > 0) {
      const headers = data[0] as string[];
      console.log(`📋 Columnas encontradas: ${headers.join(', ')}`);

      if (data.length > 1) {
        console.log(`📝 Preview primera fila de datos:`);
        const firstRow = data[1] as any[];
        headers.forEach((header, index) => {
          console.log(`   ${header}: ${firstRow[index] || '(vacío)'}`);
        });
      }
    }

    // Convertir a CSV/TSV
    const delimiter = format === 'tsv' ? '\t' : ',';
    const csvContent = (data as any[][])
      .map(row =>
        row.map(cell => {
          if (cell === null || cell === undefined) return '';
          let value = String(cell);

          // Escapar comillas y comas en CSV
          if (format === 'csv' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            value = `"${value.replace(/"/g, '""')}"`;
          }

          return value;
        }).join(delimiter)
      )
      .join('\n');

    // Crear directorio de salida si no existe
    const outputDir = path.dirname(outputPath!);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Escribir archivo
    fs.writeFileSync(outputPath!, csvContent, 'utf8');

    console.log(`✅ Conversión completada exitosamente`);
    console.log(`   Archivo creado: ${outputPath}`);
    console.log(`   Tamaño: ${Math.round(fs.statSync(outputPath!).size / 1024)}KB`);

    // Validar el CSV generado
    const lines = csvContent.split('\n').filter(line => line.trim());
    console.log(`✅ Validación:`);
    console.log(`   Líneas en archivo final: ${lines.length}`);

    if (hasHeaders && lines.length > 0) {
      const headerCount = lines[0].split(delimiter).length;
      console.log(`   Columnas: ${headerCount}`);

      // Verificar que todas las filas tengan el mismo número de columnas
      let inconsistentRows = 0;
      for (let i = 1; i < lines.length; i++) {
        const rowColumns = lines[i].split(delimiter).length;
        if (rowColumns !== headerCount) {
          inconsistentRows++;
        }
      }

      if (inconsistentRows > 0) {
        console.log(`   ⚠️  Filas con número inconsistente de columnas: ${inconsistentRows}`);
      } else {
        console.log(`   ✅ Todas las filas tienen formato consistente`);
      }
    }

    // Sugerir próximos pasos
    console.log(`\n🚀 Próximos pasos recomendados:`);
    console.log(`   1. Revisa el archivo: cat "${outputPath}"`);
    console.log(`   2. Prueba el script de outreach:`);
    console.log(`      tsx scripts/sendOutreach.ts test --email "tu@email.com" --template "corporate"`);
    console.log(`   3. Crea una campaña:`);
    console.log(`      tsx scripts/sendOutreach.ts create --name "Mi Campaña" --subject "Asunto" --csv "${outputPath}"`);

  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ Error procesando archivo Excel: ${error.message}`);
    } else {
      console.error(`❌ Error desconocido:`, error);
    }
    throw error;
  }
}

function parseFlags(args: string[]): Record<string, string> {
  const flags: Record<string, string> = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);

      if (key === 'no-headers') {
        flags['no-headers'] = 'true';
      } else if (key === 'help') {
        flags['help'] = 'true';
      } else if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
        flags[key] = args[i + 1];
        i++; // Skip next arg since we consumed it
      } else {
        flags[key] = 'true';
      }
    } else if (!flags.output && !args[i-1]?.startsWith('--')) {
      // Si no hay flag previo y no tenemos output, este es el archivo de salida
      flags.output = args[i];
    }
  }

  return flags;
}

main()
  .catch((err) => {
    console.error('❌ Error:', err);
    process.exit(1);
  });