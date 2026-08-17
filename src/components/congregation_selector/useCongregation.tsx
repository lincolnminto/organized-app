import { useEffect, useState } from 'react';
import { CongregationResponseType } from '@definition/api';

/**
 * Hook for managing the congregation freeSolo field.
 * The create path no longer performs an external congregation search
 * (Phase 3 D-03): options are limited to the current value only, and the
 * typed name flows through as-is via the freeSolo plumbing.
 */
const useCongregation = (
  _country_guid: string,
  _cong_name?: string,
  freeSoloValue?: string
) => {
  const [value, setValue] = useState<CongregationResponseType>(null);
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<CongregationResponseType[]>([]);
  const isLoading = false;

  useEffect(() => {
    setInputValue(freeSoloValue || '');
  }, [freeSoloValue]);

  useEffect(() => {
    setOptions(value ? [value] : []);
  }, [value]);

  return { setValue, value, setInputValue, options, isLoading, inputValue };
};

export default useCongregation;
