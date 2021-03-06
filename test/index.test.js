import { expect } from 'chai';
import plugin from '../src';
var request = require('request-promise');
let Adapter = new plugin.Service();

describe('feathers-solr', () => {
  it('is CommonJS compatible', () => {
    expect(typeof require('../lib')).to.equal('function');
  });

  it('basic functionality', done => {
    expect(typeof plugin).to.equal('function', 'It worked');
    done();
  });

  it('exposes the Service class', done => {
    expect(plugin.Service).to.not.equal(undefined);
    done();
  });

  it('Adapter instance is object', done => {
    expect(typeof Adapter).to.be.equal('object');
    done();
  });

  it('Adapter Client instance', done => {
    expect(typeof Adapter.client()).to.be.equal('object');
    done();
  });

  // it('method test', done => {
  //   expect(Adapter.test('dude')).to.be.equal('dude');
  //   done();
  // });


  it('Adapter req test', done => {
   request({uri:'http://localhost:8983/solr/gettingstarted/admin/ping?wt=json',json: true})
    .then(function(res){
      expect(res.status).to.be.equal('OK');
      done();
    })
    .catch(function (err) {
        // console.log('err ????',typeof err,err);
        expect(err).to.be.equal('OK');
        done();
    });
  });

  it('Adapter Ping', done => {
    Adapter.client().ping()
      .then(function(res){
        expect(res.responseHeader.status).to.be.equal(0);
        expect(res.status).to.be.equal('OK');
        done();
      })
      .catch(function (err) {
          expect(err).to.be.equal('OK');
          done();
      });
  });
});
