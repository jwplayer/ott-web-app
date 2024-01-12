import '@jwp/ott-common/src/modules/register';
import { container } from '@jwp/ott-common/src/modules/container';
import StorageService from '@jwp/ott-common/src/services/StorageService';
import { GET_CUSTOMER_IP } from '@jwp/ott-common/src/modules/types';
import type { GetCustomerIP } from '@jwp/ott-common/types/get-customer-ip';

import { LocalStorageService } from '#src/services/LocalStorageService';
import { getOverrideIP } from '#src/utils/ip';

container.bind(StorageService).to(LocalStorageService);

// Currently, this is only used for e2e testing to override the customer ip from a browser cookie
container.bind<GetCustomerIP>(GET_CUSTOMER_IP).toConstantValue(async () => getOverrideIP());
