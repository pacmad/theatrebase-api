import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';

import app from '../../src/app';
import countNodesWithLabel from '../test-helpers/neo4j/count-nodes-with-label';
import createNode from '../test-helpers/neo4j/create-node';
import createRelationship from '../test-helpers/neo4j/create-relationship';
import isNodeExistent from '../test-helpers/neo4j/is-node-existent';
import purgeDatabase from '../test-helpers/neo4j/purge-database';

describe('Instance validation failures: Productions API', () => {

	chai.use(chaiHttp);

	before(async () => {

		await purgeDatabase();

	});

	describe('attempt to create instance', () => {

		context('instance has input validation errors', () => {

			it('returns instance with appropriate errors attached', async () => {

				expect(await countNodesWithLabel('Production')).to.equal(0);

				const response = await chai.request(app)
					.post('/productions')
					.send({
						name: ''
					});

				const expectedResponseBody = {
					model: 'production',
					name: '',
					hasErrors: true,
					errors: {
						name: [
							'Value is too short'
						]
					},
					theatre: {
						model: 'theatre',
						name: '',
						differentiator: '',
						errors: {}
					},
					playtext: {
						model: 'playtext',
						name: '',
						differentiator: '',
						errors: {}
					},
					cast: []
				};

				expect(response).to.have.status(200);
				expect(response.body).to.deep.equal(expectedResponseBody);
				expect(await countNodesWithLabel('Production')).to.equal(0);

			});

		});

	});

	describe('attempt to update instance', () => {

		const MACBETH_PRODUCTION_UUID = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';

		before(async () => {

			await purgeDatabase();

			await createNode({
				label: 'Production',
				name: 'Macbeth',
				uuid: MACBETH_PRODUCTION_UUID
			});

		});

		context('instance has input validation errors', () => {

			it('returns instance with appropriate errors attached', async () => {

				expect(await countNodesWithLabel('Production')).to.equal(1);

				const response = await chai.request(app)
					.put(`/productions/${MACBETH_PRODUCTION_UUID}`)
					.send({
						name: ''
					});

				const expectedResponseBody = {
					model: 'production',
					uuid: MACBETH_PRODUCTION_UUID,
					name: '',
					hasErrors: true,
					errors: {
						name: [
							'Value is too short'
						]
					},
					theatre: {
						model: 'theatre',
						name: '',
						differentiator: '',
						errors: {}
					},
					playtext: {
						model: 'playtext',
						name: '',
						differentiator: '',
						errors: {}
					},
					cast: []
				};

				expect(response).to.have.status(200);
				expect(response.body).to.deep.equal(expectedResponseBody);
				expect(await countNodesWithLabel('Production')).to.equal(1);
				expect(await isNodeExistent({
					label: 'Production',
					name: 'Macbeth',
					uuid: MACBETH_PRODUCTION_UUID
				})).to.be.true;

			});

		});

	});

	describe('attempt to delete instance', () => {

		const OTHELLO_DONMAR_PRODUCTION_UUID = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
		const DONMAR_WAREHOUSE_THEATRE_UUID = 'yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy';
		const OTHELLO_PLAYTEXT_UUID = 'zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz';

		before(async () => {

			await purgeDatabase();

			await createNode({
				label: 'Production',
				name: 'Othello',
				uuid: OTHELLO_DONMAR_PRODUCTION_UUID
			});

			await createNode({
				label: 'Theatre',
				name: 'Donmar Warehouse',
				uuid: DONMAR_WAREHOUSE_THEATRE_UUID
			});

			await createNode({
				label: 'Playtext',
				name: 'Othello',
				uuid: OTHELLO_PLAYTEXT_UUID
			});

			await createRelationship({
				sourceLabel: 'Production',
				sourceUuid: OTHELLO_DONMAR_PRODUCTION_UUID,
				destinationLabel: 'Theatre',
				destinationUuid: DONMAR_WAREHOUSE_THEATRE_UUID,
				relationshipName: 'PLAYS_AT'
			});

			await createRelationship({
				sourceLabel: 'Production',
				sourceUuid: OTHELLO_DONMAR_PRODUCTION_UUID,
				destinationLabel: 'Playtext',
				destinationUuid: OTHELLO_PLAYTEXT_UUID,
				relationshipName: 'PRODUCTION_OF'
			});

		});

		context('instance has associations', () => {

			it('returns instance with appropriate errors attached', async () => {

				expect(await countNodesWithLabel('Production')).to.equal(1);

				const response = await chai.request(app)
					.delete(`/productions/${OTHELLO_DONMAR_PRODUCTION_UUID}`);

				const expectedResponseBody = {
					model: 'production',
					uuid: OTHELLO_DONMAR_PRODUCTION_UUID,
					name: 'Othello',
					hasErrors: true,
					errors: {
						associations: [
							'Playtext',
							'Theatre'
						]
					},
					theatre: {
						model: 'theatre',
						name: '',
						differentiator: '',
						errors: {}
					},
					playtext: {
						model: 'playtext',
						name: '',
						differentiator: '',
						errors: {}
					},
					cast: []
				};

				expect(response).to.have.status(200);
				expect(response.body).to.deep.equal(expectedResponseBody);
				expect(await countNodesWithLabel('Production')).to.equal(1);

			});

		});

	});

});
