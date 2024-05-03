const chai = require('chai');
const assert = chai.assert;

const node_translate = require('./node_translate');


describe('Translate medico', function() {
    it(' should return n results', async function() {
        let n=3
        let res = await node_translate.translate_and_run_soccer( {title:"médico",task:"Tratar pacientes",n:n} )
        assert.isNotNull(res)
        assert.equal(res.length, n, `When n=${n} ${res.length} results were returned`);

        n=50
        res = await node_translate.translate_and_run_soccer( {title:"médico",task:"Tratar pacientes",n:n} )
        assert.isNotNull(res)
        assert.equal(res.length, n, `When n=${n} ${res.length} results were returned`);
    });
});