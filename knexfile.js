// camel case 작동 안함. 디버깅 필요.
const convertToCamel = (str) => {
    return str.toString().toLowerCase().replace(/_([a-z])/g, function (g) { return g[1].toUpperCase(); });
};


// express에서 웹서버로 작동할 때는 production과 같이 .env가 되는데 
// knex 명령행 에서 migrate를 하려면 development의 샘플처럼 직접 connection
// url을 적어야 함.



module.exports = {
    development: {
        client: 'pg',
        connection: process.env.PG_DEV_URI,
        // connection: "mysql://smartf:ziumks2538@localhost/smartf",        
        pool: { min: 2, 
                max: 7 },
        migrations: {
            directory: __dirname + '/db/migrations',
        },
        seeds: {
            directory: __dirname + '/db/seeds',
        },
    },
    production: {
        client: 'pg',
        connection: process.env.PG_PRO_URI,
        //connection: "mysql:smartf:ziumks2538@45.120.69.86/smartfarm",
        pool: { min: 4, max: 10 },
        migrations: {
            directory: __dirname + '/db/migrations',
        },
        seeds: {
            directory: __dirname + '/db/seeds',
        },

    },
}
