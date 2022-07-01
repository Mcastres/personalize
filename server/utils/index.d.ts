import * as variations from '../services/variations';
import * as permissions from '../services/permissions';
import * as contentTypes from '../services/content-types';
import * as metrics from '../services/metrics';
import * as entityServiceDecorator from '../services/entity-service-decorator';
import * as coreAPI from '../services/core-api';
import * as ISOVariations from '../services/iso-variations';
import * as personalizations from '../services/personalizations';

type S = {
  permissions: typeof permissions;
  metrics: typeof metrics;
  variations: typeof variations;
  personalizations: typeof personalizations;
  ['iso-variations']: typeof ISOVariations;
  ['content-types']: typeof contentTypes;
  ['entity-service-decorator']: typeof entityServiceDecorator;
  ['core-api']: typeof coreAPI;
};

export function getService<T extends keyof S>(name: T): ReturnType<S[T]>;