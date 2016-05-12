'use strict';

let SHA1 = require('sha1');

global.Faker = require('faker');
global.expect = require('chai').expect;
global.randomCommit = () => ({dataset: {octotraxHash: randomHash()}});
global.randomHash = () => SHA1(Faker.random.number(1000));
