const GriffinServer = require('./src/app');

async function start(){
    const griffin = new GriffinServer();
    await griffin.init('griffin.yaml');
    griffin.startWebserver();
}

start();