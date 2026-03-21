const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function deploy() {
    const client = new Client({
        host: 'db.nltznvjlxwrdmyqgivgh.supabase.co',
        port: 5432,
        user: 'postgres',
        password: 'fIgwtuuktGfUUloF',
        database: 'postgres',
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log("--- CONECTADO AL MOTOR SUPABASE CORPORATIVO ---");

        const sqlFiles = [
            'schema.sql',
            'ROLES_SCHEMA.sql',
            'AUDIT_LOGS.sql',
            'AUDITORIA_SCHEMA.sql',
            'AGENCY_SETTINGS.sql',
            'KNOWLEDGE_SCHEMA.sql'
        ];

        for (const file of sqlFiles) {
            console.log(`Ejecutando: ${file}...`);
            const filePath = path.join(process.cwd(), 'supabase', file);
            if (fs.existsSync(filePath)) {
                const sql = fs.readFileSync(filePath, 'utf8');
                // Algunos archivos SQL de Supabase pueden tener delimitadores específicos o comentarios.
                // Los ejecutamos de forma directa.
                try {
                    await client.query(sql);
                    console.log(`[OK] ${file} completado.`);
                } catch (err) {
                    console.error(`[ERROR] en ${file}:`, err.message);
                }
            } else {
                console.warn(`[!] Archivo no encontrado: ${filePath}`);
            }
        }

        console.log("--- DESPLIEGUE FINALIZADO CON ÉXITO ---");

    } catch (err) {
        console.error("Error de conexión:", err.message);
    } finally {
        await client.end();
    }
}

deploy();
