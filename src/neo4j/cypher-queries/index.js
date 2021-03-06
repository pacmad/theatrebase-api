import { getShowQuery as getCharacterShowQuery } from './character';
import { getShowQuery as getPersonShowQuery } from './person';
import {
	getCreateQuery as getPlaytextCreateQuery,
	getEditQuery as getPlaytextEditQuery,
	getUpdateQuery as getPlaytextUpdateQuery,
	getShowQuery as getPlaytextShowQuery
} from './playtext';
import {
	getCreateQuery as getProductionCreateQuery,
	getEditQuery as getProductionEditQuery,
	getUpdateQuery as getProductionUpdateQuery,
	getShowQuery as getProductionShowQuery
} from './production';
import * as sharedQueries from './shared';
import {
	getShowQuery as getTheatreShowQuery
} from './theatre';

const getCreateQueries = {
	playtext: getPlaytextCreateQuery,
	production: getProductionCreateQuery
};

const getEditQueries = {
	playtext: getPlaytextEditQuery,
	production: getProductionEditQuery
};

const getUpdateQueries = {
	playtext: getPlaytextUpdateQuery,
	production: getProductionUpdateQuery
};

const getShowQueries = {
	character: getCharacterShowQuery,
	person: getPersonShowQuery,
	playtext: getPlaytextShowQuery,
	production: getProductionShowQuery,
	theatre: getTheatreShowQuery
};

export {
	getCreateQueries,
	getEditQueries,
	getUpdateQueries,
	getShowQueries,
	sharedQueries
};
