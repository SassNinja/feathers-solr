import { expect } from 'chai';
import plugin from '../src';
var demodata = require('../example/data/json-generator.js');

let Service = new plugin.Service({
    paginate: {
        default: 5,
        max: 50
    }
});

describe('Service', () => {

    describe('Remove', () => {
        it('should return status "OK"', done => {

            Service.remove()
                .then(function(res) {
                    expect(res.responseHeader.status).to.be.equal(0);
                    done();
                })
                .catch(function(err) {
                    done();
                });
        });
    });

    describe('Update', () => {
        it('should return status "OK"', done => {
            Service.create(demodata)
                .then(function(res) {
                    expect(res.data).to.be.instanceof(Array);
                    done();
                })
                .catch(function(err) {
                    done();
                });
        });
    });

    describe('Find', () => {
        var response;
        before(function(done) {
            done();
        });

        it('find ALL should return Array', done => {
            Service.find({})
                .then(function(res) {
                    response = res;
                    expect(response.data).to.be.instanceof(Array);
                    done();
                })
                .catch(function(err) {
                    done();
                });
        });


        it('find ALL should return empty Array', done => {
            expect(response.data).to.have.lengthOf(5);
            done();
        });

    });

    // describe('Create', () => {
    //     it('create should return status "OK"', done => {
    //         Service.create([{
    //                 'id': 'adapter1',
    //                 'name': 'Doc adapter1',
    //                 'country': 'germany',
    //                 'age_i': 23
    //             }, {
    //                 'id': 'adapter2',
    //                 'name': 'Doc adapter2',
    //                 'country': 'uk',
    //                 'age_i': 48
    //             }, {
    //                 'id': 'adapter3',
    //                 'name': 'Doc adapter3',
    //                 'country': 'es',
    //                 'age_i': 24
    //             }])
    //             .then(function(res) {
    //                 // console.log('res',res);
    //                 expect(res).not.to.be.equal(0);
    //                 done();
    //             })
    //             .catch(function(err) {
    //                 console.log('err', err);
    //                 expect(err).to.be.equal(1);
    //                 done();
    //             });
    //     });
    // });

    // describe('Find', () => {
    //     var response;
    //     // before(function (done){
    //     //   done();
    //     // });

    //     it('find ALL should return Array', done => {
    //         Service.find({})
    //             .then(function(res) {
    //                 response = res;
    //                 expect(response.data).to.be.instanceof(Array);

    //                 done();
    //             })
    //             .catch(function(err) {
    //                 console.log('err', err);
    //                 done();
    //             });
    //     });


    //     it('find ALL should return empty Array lengthOf 3', done => {
    //         expect(response.data).to.have.lengthOf(3);
    //         done();
    //     });

    //     it('find by id should return Array', done => {
    //         Service.find({ query: { id: 'adapter1', 'age_i': 23 } })
    //             .then(function(res) {
    //                 response = res;

    //                 expect(response).to.be.instanceof(Object);
    //                 expect(response.data).to.be.instanceof(Array);

    //                 done();
    //             })
    //             .catch(function(err) {
    //                 console.log('err', err);
    //                 done();
    //             });
    //     });

    //     it('find ALL and sort by age_i', done => {
    //         Service.find({ query: { $sort: { 'age_i': 1 } } })
    //             .then(function(res) {
    //                 response = res;
    //                 // console.log('response',response);
    //                 expect(response.data).to.be.instanceof(Array);

    //                 done();
    //             })
    //             .catch(function(err) {
    //                 console.log('err', err);
    //                 done();
    //             });
    //     });

    // });

    // describe('Update', () => {
    //     var response;
    //     it('update {id:adapter1,age_i:23}', done => {
    //         Service.update('adapter1', { name: 'sajo', country: 'mazedonia', 'test_s': 'dude' })
    //             .then(function(res) {
    //                 response = res;
    //                 expect(response).to.be.instanceof(Object);
    //                 expect(response.country).to.be.equal('mazedonia');

    //                 done();
    //             })
    //             .catch(function(err) {
    //                 console.log('err', err);
    //                 done();
    //             });
    //     });

    //     it('get by id should return Object', done => {
    //         Service.get(response.id)
    //             .then(function(res) {
    //                 response = res;
    //                 expect(response).to.be.instanceof(Object);
    //                 expect(response.test_s).to.be.equal('dude');

    //                 done();
    //             })
    //             .catch(function(err) {
    //                 console.log('err', err);
    //                 done();
    //             });
    //     });


    //     it('find ALL should return Array', done => {
    //         Service.find({})
    //             .then(function(res) {
    //                 response = res;
    //                 expect(response.data).to.be.instanceof(Array);

    //                 done();
    //             })
    //             .catch(function(err) {
    //                 console.log('err', err);
    //                 done();
    //             });
    //     });

    //     it('find by id should return name sajo', done => {
    //         Service.find({ query: { id: 'adapter1' } })
    //             .then(function(res) {
    //                 // console.log('res',res[0]);
    //                 //TODO handle response array|object by count 1
    //                 expect(res.data[0].name).to.include('sajo');

    //                 done();
    //             })
    //             .catch(function(err) {
    //                 console.log('err', err);
    //                 done();
    //             });
    //     });

    // });

    // describe('Get', () => {
    //     var response;
    //     it('get {id:adapter1} should not be Array', done => {
    //         Service.get('adapter1')
    //             .then(function(res) {
    //                 response = res;
    //                 expect(response).not.to.be.instanceof(Array);
    //                 done();
    //             })
    //             .catch(function(err) {
    //                 console.log('err', err);
    //                 done();
    //             });
    //     });

    //     it('name should be sajo', done => {
    //         expect(response.name).to.include('sajo');
    //         done();
    //     });

    //     it('country should be mazedonia', done => {
    //         expect(response.country).to.include('mazedonia');
    //         done();
    //     });

    // });

});
