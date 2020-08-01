import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';

import app from '../../src/app';
import countNodesWithLabel from '../test-helpers/neo4j/count-nodes-with-label';
import createNode from '../test-helpers/neo4j/create-node';
import createRelationship from '../test-helpers/neo4j/create-relationship';
import matchNode from '../test-helpers/neo4j/match-node';
import purgeDatabase from '../test-helpers/neo4j/purge-database';

describe('Instance validation failures: Theatres API', () => {

	chai.use(chaiHttp);

	describe('attempt to create instance', () => {

		const DONMAR_WAREHOUSE_THEATRE_UUID = 'yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy';

		before(async () => {

			await purgeDatabase();

			await createNode({
				label: 'Theatre',
				name: 'Donmar Warehouse',
				uuid: DONMAR_WAREHOUSE_THEATRE_UUID
			});

		});

		context('instance has input validation errors', () => {

			it('returns instance with appropriate errors attached', async () => {

				expect(await countNodesWithLabel('Theatre')).to.equal(1);

				const response = await chai.request(app)
					.post('/theatres')
					.send({
						name: ''
					});

				const expectedResponseBody = {
					model: 'theatre',
					name: '',
					hasErrors: true,
					errors: {
						name: [
							'Name is too short'
						]
					}
				};

				expect(response).to.have.status(200);
				expect(response.body).to.deep.equal(expectedResponseBody);
				expect(await countNodesWithLabel('Theatre')).to.equal(1);

			});

		});

		context('instance has database validation errors', () => {

			it('returns instance with appropriate errors attached', async () => {

				expect(await countNodesWithLabel('Theatre')).to.equal(1);

				const response = await chai.request(app)
					.post('/theatres')
					.send({
						name: 'Donmar Warehouse'
					});

				const expectedResponseBody = {
					model: 'theatre',
					name: 'Donmar Warehouse',
					hasErrors: true,
					errors: {
						name: [
							'Name already exists'
						]
					}
				};

				expect(response).to.have.status(200);
				expect(response.body).to.deep.equal(expectedResponseBody);
				expect(await countNodesWithLabel('Theatre')).to.equal(1);

			});

		});

	});

	describe('attempt to update instance', () => {

		const ALMEIDA_THEATRE_UUID = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
		const DONMAR_WAREHOUSE_THEATRE_UUID = 'yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy';

		before(async () => {

			await purgeDatabase();

			await createNode({
				label: 'Theatre',
				name: 'Almeida Theatre',
				uuid: ALMEIDA_THEATRE_UUID
			});

			await createNode({
				label: 'Theatre',
				name: 'Donmar Warehouse',
				uuid: DONMAR_WAREHOUSE_THEATRE_UUID
			});

		});

		context('instance has input validation errors', () => {

			it('returns instance with appropriate errors attached', async () => {

				expect(await countNodesWithLabel('Theatre')).to.equal(2);

				const response = await chai.request(app)
					.put(`/theatres/${ALMEIDA_THEATRE_UUID}`)
					.send({
						name: ''
					});

				const expectedResponseBody = {
					model: 'theatre',
					uuid: ALMEIDA_THEATRE_UUID,
					name: '',
					hasErrors: true,
					errors: {
						name: [
							'Name is too short'
						]
					}
				};

				expect(response).to.have.status(200);
				expect(response.body).to.deep.equal(expectedResponseBody);
				expect(await countNodesWithLabel('Theatre')).to.equal(2);
				expect(await matchNode({
					label: 'Theatre',
					name: 'Almeida Theatre',
					uuid: ALMEIDA_THEATRE_UUID
				})).to.be.true;

			});

		});

		context('instance has database validation errors', () => {

			it('returns instance with appropriate errors attached', async () => {

				expect(await countNodesWithLabel('Theatre')).to.equal(2);

				const response = await chai.request(app)
					.put(`/theatres/${ALMEIDA_THEATRE_UUID}`)
					.send({
						name: 'Donmar Warehouse'
					});

				const expectedResponseBody = {
					model: 'theatre',
					uuid: ALMEIDA_THEATRE_UUID,
					name: 'Donmar Warehouse',
					hasErrors: true,
					errors: {
						name: [
							'Name already exists'
						]
					}
				};

				expect(response).to.have.status(200);
				expect(response.body).to.deep.equal(expectedResponseBody);
				expect(await countNodesWithLabel('Theatre')).to.equal(2);
				expect(await matchNode({
					label: 'Theatre',
					name: 'Almeida Theatre',
					uuid: ALMEIDA_THEATRE_UUID
				})).to.be.true;

			});

		});

	});

	describe('attempt to delete instance', () => {

		const ALMEIDA_THEATRE_UUID = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
		const THE_MERCHANT_OF_VENICE_ALMEIDA_PRODUCTION_UUID = 'yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy';

		before(async () => {

			await purgeDatabase();

			await createNode({
				label: 'Theatre',
				name: 'Almeida Theatre',
				uuid: ALMEIDA_THEATRE_UUID
			});

			await createNode({
				label: 'Production',
				name: 'The Merchant of Venice',
				uuid: THE_MERCHANT_OF_VENICE_ALMEIDA_PRODUCTION_UUID
			});

			await createRelationship({
				sourceLabel: 'Production',
				sourceUuid: THE_MERCHANT_OF_VENICE_ALMEIDA_PRODUCTION_UUID,
				destinationLabel: 'Theatre',
				destinationUuid: ALMEIDA_THEATRE_UUID,
				relationshipName: 'PLAYS_AT'
			});

		});

		context('instance has dependent associations', () => {

			it('returns instance with appropriate errors attached', async () => {

				expect(await countNodesWithLabel('Theatre')).to.equal(1);

				const response = await chai.request(app)
					.delete(`/theatres/${ALMEIDA_THEATRE_UUID}`);

				const expectedResponseBody = {
					model: 'theatre',
					uuid: ALMEIDA_THEATRE_UUID,
					name: 'Almeida Theatre',
					hasErrors: true,
					errors: {
						dependentAssociations: [
							'productions'
						]
					}
				};

				expect(response).to.have.status(200);
				expect(response.body).to.deep.equal(expectedResponseBody);
				expect(await countNodesWithLabel('Theatre')).to.equal(1);

			});

		});

	});

});