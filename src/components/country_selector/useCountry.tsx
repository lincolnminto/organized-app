import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { CountryResponseType } from '@definition/api';
import { CountrySelectorType } from './index.types';
import { countriesState } from '@states/app';
import { BRAZIL_COUNTRY } from './constants';

/**
 * Hook for managing country data and selection.
 * The create path is single-tenant/single-country (Phase 3 D-02): the
 * country list is a fixed local constant (Brazil), never fetched from the
 * external registry.
 * @param {Object} props - Props for the useCountry hook.
 * @returns {Object} Object containing country data and selection state.
 */
const useCountry = ({ handleCountryChange, value }: CountrySelectorType) => {
  const [countries, setCountries] = useAtom(countriesState);

  const [openPicker, setOpenPicker] = useState(false);
  const [selected, setSelected] = useState<CountryResponseType>(value || null);

  const isLoading = false;

  const handleOnChange = (value: CountryResponseType) => {
    setSelected(value);
    handleCountryChange(value);
  };

  useEffect(() => {
    setCountries([BRAZIL_COUNTRY]);
  }, [setCountries]);

  useEffect(() => {
    if (countries.length === 0) {
      setSelected(null);
      return;
    }

    if (value === null) {
      setSelected(null);
      return;
    }

    const findValue = countries.find(
      (country) =>
        country.countryCode === value.countryCode ||
        country.countryGuid === value.countryGuid
    );

    setSelected(findValue ?? null);
  }, [countries, value]);

  return {
    setOpenPicker,
    selected,
    countries,
    handleOnChange,
    openPicker,
    isLoading,
  };
};

export default useCountry;
