const ftp = require("basic-ftp");
const fs = require("fs");
const path = require("path");

async function backup() {
    const client = new ftp.Client();
    client.ftp.verbose = true;

    // Directorio de destino
    const localPath = path.join(process.cwd(), "Backup_Web_Antigua");
    if (!fs.existsSync(localPath)) {
        fs.mkdirSync(localPath, { recursive: true });
    }

    try {
    const hosts = [
        { host: "ftp.alros.eu", u: "alros", p: "gei8abgb", secure: true },
        { host: "ftp.alros.eu", u: "alros", p: "gei8abgb", secure: false }
    ];

    let connected = false;
    for (const entry of hosts) {
        if (connected) break;
        console.log(`--- PROBANDO HOST: ${entry.host} (USER: ${entry.u}, SECURE: ${entry.secure}) ---`);
        try {
            await client.access({
                host: entry.host,
                user: entry.u,
                password: entry.p,
                secure: entry.secure
            });
            connected = true;
            console.log("¡POR FIN! Conexión establecida.");
        } catch (e) {
            console.log(`Fallo en ${entry.host}: ${e.message}`);
        }
    }

    if (!connected) {
        console.error("No se pudo conectar con ninguna de las combinaciones. Por favor, verifica si hay otra clave.");
        return;
    }

        console.log("--- DESCARGANDO WEB ANTIGUA (PACIENCIA...) ---");
        // Descargamos todo el contenido (habitualmente el contenido está en / o public_html)
        await client.downloadToDir(localPath, "/");

        console.log("--- COPIA DE SEGURIDAD COMPLETADA CON ÉXITO ---");
        console.log(`Todos los archivos están en: ${localPath}`);
    } catch (err) {
        console.error("Error durante el backup:", err);
    }
    client.close();
}

backup();
