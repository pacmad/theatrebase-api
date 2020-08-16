import { expect } from 'chai';
import proxyquire from 'proxyquire';
import { assert, createStubInstance, spy, stub } from 'sinon';

import { Role } from '../../../src/models';

describe('Cast Member model', () => {

	let stubs;
	let instance;

	const RoleStub = function () {

		return createStubInstance(Role);

	};

	beforeEach(() => {

		stubs = {
			getDuplicateNameIndicesModule: {
				getDuplicateNameIndices: stub().returns([])
			},
			models: {
				Role: RoleStub
			}
		};

		instance = createInstance();

	});

	const createSubject = () =>
		proxyquire('../../../src/models/CastMember', {
			'../lib/get-duplicate-name-indices': stubs.getDuplicateNameIndicesModule,
			'.': stubs.models
		}).default;

	const createInstance = (props = { name: 'Ian McKellen', roles: [{ name: 'King Lear' }] }) => {

		const CastMember = createSubject();

		return new CastMember(props);

	};

	describe('constructor method', () => {

		describe('roles property', () => {

			it('assigns array of role instances, retaining those with empty or whitespace-only string names', () => {

				const props = {
					name: 'Ian McKellen',
					roles: [
						{ name: 'King Lear' },
						{ name: '' },
						{ name: ' ' }
					]
				};
				instance = createInstance(props);
				expect(instance.roles.length).to.equal(3);
				expect(instance.roles[0] instanceof Role).to.be.true;
				expect(instance.roles[1] instanceof Role).to.be.true;
				expect(instance.roles[2] instanceof Role).to.be.true;

			});

		});

	});

	describe('runInputValidations method', () => {

		it('calls instance validate method and associated models\' validate methods', () => {

			spy(instance, 'validateName');
			spy(instance, 'validateNameUniquenessInGroup');
			spy(instance, 'validateNamePresenceIfRoles');
			instance.runInputValidations({ hasDuplicateName: false });
			assert.callOrder(
				instance.validateName,
				instance.validateNameUniquenessInGroup,
				instance.validateNamePresenceIfRoles,
				stubs.getDuplicateNameIndicesModule.getDuplicateNameIndices,
				instance.roles[0].validateName,
				instance.roles[0].validateCharacterName,
				instance.roles[0].validateCharacterNameHasRoleName,
				instance.roles[0].validateRoleNameCharacterNameDisparity,
				instance.roles[0].validateNameUniquenessInGroup
			);
			expect(instance.validateName.calledOnce).to.be.true;
			expect(instance.validateName.calledWithExactly({ requiresName: false })).to.be.true;
			expect(instance.validateNameUniquenessInGroup.calledOnce).to.be.true;
			expect(instance.validateNameUniquenessInGroup.calledWithExactly({ hasDuplicateName: false })).to.be.true;
			expect(instance.validateNamePresenceIfRoles.calledOnce).to.be.true;
			expect(instance.validateNamePresenceIfRoles.calledWithExactly()).to.be.true;
			expect(stubs.getDuplicateNameIndicesModule.getDuplicateNameIndices.calledOnce).to.be.true;
			expect(stubs.getDuplicateNameIndicesModule.getDuplicateNameIndices.calledWithExactly(
				instance.roles
			)).to.be.true;
			expect(instance.roles[0].validateName.calledOnce).to.be.true;
			expect(instance.roles[0].validateName.calledWithExactly({ requiresName: false })).to.be.true;
			expect(instance.roles[0].validateCharacterName.calledOnce).to.be.true;
			expect(instance.roles[0].validateCharacterName.calledWithExactly(
				{ requiresCharacterName: false }
			)).to.be.true;
			expect(instance.roles[0].validateCharacterNameHasRoleName.calledOnce).to.be.true;
			expect(instance.roles[0].validateCharacterNameHasRoleName.calledWithExactly()).to.be.true;
			expect(instance.roles[0].validateRoleNameCharacterNameDisparity.calledOnce).to.be.true;
			expect(instance.roles[0].validateRoleNameCharacterNameDisparity.calledWithExactly()).to.be.true;
			expect(instance.roles[0].validateNameUniquenessInGroup.calledOnce).to.be.true;
			expect(instance.roles[0].validateNameUniquenessInGroup.calledWithExactly(
				{ hasDuplicateName: false }
			)).to.be.true;

		});

	});

	describe('validateNamePresenceIfRoles method', () => {

		beforeEach(() => {

			stubs.models.Role = function (props) {

				this.name = props.name;

			};

		});

		context('valid data', () => {

			context('cast member does not have name nor any roles with names', () => {

				it('will not add properties to errors property', () => {

					instance = createInstance({ name: '', roles: [{ name: '' }] });
					spy(instance, 'addPropertyError');
					instance.validateNamePresenceIfRoles();
					expect(instance.addPropertyError.notCalled).to.be.true;
					expect(instance.errors).not.to.have.property('name');
					expect(instance.errors).to.deep.equal({});

				});

			});

			context('cast member has a name and no roles with names', () => {

				it('will not add properties to errors property', () => {

					instance = createInstance({ name: 'Ian McKellen', roles: [{ name: '' }] });
					spy(instance, 'addPropertyError');
					instance.validateNamePresenceIfRoles();
					expect(instance.addPropertyError.notCalled).to.be.true;
					expect(instance.errors).not.to.have.property('name');
					expect(instance.errors).to.deep.equal({});

				});

			});

			context('cast member has a name and roles with names', () => {

				it('will not add properties to errors property', () => {

					instance = createInstance({ name: 'Ian McKellen', roles: [{ name: 'King Lear' }] });
					spy(instance, 'addPropertyError');
					instance.validateNamePresenceIfRoles();
					expect(instance.addPropertyError.notCalled).to.be.true;
					expect(instance.errors).not.to.have.property('name');
					expect(instance.errors).to.deep.equal({});

				});

			});

		});

		context('invalid data', () => {

			it('adds properties whose values are arrays to errors property', () => {

				instance = createInstance({ name: '', roles: [{ name: 'King Lear' }] });
				spy(instance, 'addPropertyError');
				instance.validateNamePresenceIfRoles();
				expect(instance.addPropertyError.calledOnce).to.be.true;
				expect(instance.addPropertyError.calledWithExactly(
					'name',
					'Name is required if cast member has named roles'
				)).to.be.true;
				expect(instance.errors)
					.to.have.property('name')
					.that.is.an('array')
					.that.deep.eq([	'Name is required if cast member has named roles']);

			});

		});

	});

});
