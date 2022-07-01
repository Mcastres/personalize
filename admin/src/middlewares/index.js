import addCommonFieldsToInitialDataMiddleware from './addCommonFieldsToInitialDataMiddleware';
import extendCTBInitialDataMiddleware from './extendCTBInitialDataMiddleware';
import extendCTBAttributeInitialDataMiddleware from './extendCTBAttributeInitialDataMiddleware';
import variationPermissionMiddleware from './variationPermissionMiddleware';

const middlewares = [
  addCommonFieldsToInitialDataMiddleware,
  extendCTBInitialDataMiddleware,
  extendCTBAttributeInitialDataMiddleware,
  variationPermissionMiddleware,
];

export default middlewares;
