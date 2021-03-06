import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import { createSandbox } from 'sinon';
import { v4 as uuid } from 'uuid';

import app from '../../src/app';
import countNodesWithLabel from '../test-helpers/neo4j/count-nodes-with-label';
import purgeDatabase from '../test-helpers/neo4j/purge-database';

describe('CRUD (Create, Read, Update, Delete): People API', () => {

	chai.use(chaiHttp);

	describe('GET new endpoint', () => {

		it('responds with data required to prepare new person', async () => {

			const response = await chai.request(app)
				.get('/people/new');

			const expectedResponseBody = {
				model: 'person',
				name: '',
				differentiator: '',
				errors: {}
			};

			expect(response).to.have.status(200);
			expect(response.body).to.deep.equal(expectedResponseBody);

		});

	});

	describe('CRUD', () => {

		const PERSON_UUID = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';

		const sandbox = createSandbox();

		before(async () => {

			sandbox.stub(uuid, 'v4').returns(PERSON_UUID);

			await purgeDatabase();

		});

		after(() => {

			sandbox.restore();

		});

		it('creates person', async () => {

			expect(await countNodesWithLabel('Person')).to.equal(0);

			const response = await chai.request(app)
				.post('/people')
				.send({
					name: 'Ian McKellen'
				});

			const expectedResponseBody = {
				model: 'person',
				uuid: PERSON_UUID,
				name: 'Ian McKellen',
				differentiator: '',
				errors: {}
			};

			expect(response).to.have.status(200);
			expect(response.body).to.deep.equal(expectedResponseBody);
			expect(await countNodesWithLabel('Person')).to.equal(1);

		});

		it('gets data required to edit specific person', async () => {

			const response = await chai.request(app)
				.get(`/people/${PERSON_UUID}/edit`);

			const expectedResponseBody = {
				model: 'person',
				uuid: PERSON_UUID,
				name: 'Ian McKellen',
				differentiator: '',
				errors: {}
			};

			expect(response).to.have.status(200);
			expect(response.body).to.deep.equal(expectedResponseBody);

		});

		it('updates person', async () => {

			expect(await countNodesWithLabel('Person')).to.equal(1);

			const response = await chai.request(app)
				.put(`/people/${PERSON_UUID}`)
				.send({
					name: 'Patrick Stewart'
				});

			const expectedResponseBody = {
				model: 'person',
				uuid: PERSON_UUID,
				name: 'Patrick Stewart',
				differentiator: '',
				errors: {}
			};

			expect(response).to.have.status(200);
			expect(response.body).to.deep.equal(expectedResponseBody);
			expect(await countNodesWithLabel('Person')).to.equal(1);

		});

		it('shows person', async () => {

			const response = await chai.request(app)
				.get(`/people/${PERSON_UUID}`);

			const expectedResponseBody = {
				model: 'person',
				uuid: PERSON_UUID,
				name: 'Patrick Stewart',
				differentiator: null,
				productions: []
			};

			expect(response).to.have.status(200);
			expect(response.body).to.deep.equal(expectedResponseBody);

		});

		it('lists all people', async () => {

			const response = await chai.request(app)
				.get('/people');

			const expectedResponseBody = [
				{
					model: 'person',
					uuid: PERSON_UUID,
					name: 'Patrick Stewart',
					differentiator: null
				}
			];

			expect(response).to.have.status(200);
			expect(response.body).to.deep.equal(expectedResponseBody);

		});

		it('deletes person', async () => {

			expect(await countNodesWithLabel('Person')).to.equal(1);

			const response = await chai.request(app)
				.delete(`/people/${PERSON_UUID}`);

			const expectedResponseBody = {
				model: 'person',
				name: 'Patrick Stewart',
				differentiator: '',
				errors: {}
			};

			expect(response).to.have.status(200);
			expect(response.body).to.deep.equal(expectedResponseBody);
			expect(await countNodesWithLabel('Person')).to.equal(0);

		});

	});

});
