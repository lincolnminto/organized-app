import { CountryResponseType } from '@definition/api';

/**
 * Fixed local country constant for the single-tenant, single-congregation
 * deployment (Phase 3 D-02): the create path no longer fetches a country
 * list from the external registry — it always sources Brazil from here.
 */
export const BRAZIL_COUNTRY: CountryResponseType = {
  countryCode: 'BRA',
  countryName: 'Brasil',
  countryGuid: 'a752410b-295d-43d6-9aa0-5b3fa0ba7ec3',
};
