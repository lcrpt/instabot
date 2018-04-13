require('dotenv').load();

const { jobRunner, computeTimer } = require('./job');

jobRunner(computeTimer());
