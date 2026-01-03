
(async () => {
    const databases = await window.indexedDB.databases();
    for (const db of databases) {
        if (db.name) {
            window.indexedDB.deleteDatabase(db.name);
            console.log(`Deleted database: ${db.name}`);
        }
    }
    console.log("All databases cleared. Reloading...");
    window.location.reload();
})();
