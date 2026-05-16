import sql from "mssql";

const config = {
    server: process.env.SOMEE_SERVER,
    user: process.env.SOMEE_USER,
    password: process.env.SOMEE_PASSWORD,
    options: {
        encrypt: true,
        trustServerCertificate: true,
        enableArithAbort: true,
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
    },
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then((pool) => {
        console.log("Connected to SQL Server");
        return pool;
    })
    .catch((err) => {
        console.error("Database Connection Failed! Bad Config: ", err);
        process.exit(1);
    });

export { sql, poolPromise };



// import sql from "mssql";
// // Make sure your DB_PORT is 1444 here
// const config = {
//     server: 'localhost',
//     database: 'NexsusAcademy',
//     user: 'sa',
//     password: 'NexusAcademy#2024',
//     port: 1444, 
//     options: {
//         encrypt: false, // Critical for local development
//         trustServerCertificate: true, // Also critical for local development
//     },
// };

// const poolPromise = new sql.ConnectionPool(config)
//     .connect()
//     .then((pool) => {
//         console.log("Connected to SQL Server on Port 1444!");
//         return pool;
//     })
//     .catch((err) => {
//         console.error("Database Connection Failed! Bad Config: ", err);
//         process.exit(1);
//     });

// export { sql, poolPromise };