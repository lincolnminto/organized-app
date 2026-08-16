import { CongregationResponseType } from '@definition/api';

export type CongregationSelectorType = {
  country_guid: string;
  setCongregation: (value: CongregationResponseType) => void;
  label?: string;
  cong_name?: string;
  freeSolo?: boolean;
  freeSoloChange?: (cong_name: string) => void;
  freeSoloValue?: string;
  readOnly?: boolean;
  /**
   * When true (and `freeSolo` is true), commits the current typed input via
   * `freeSoloChange` on blur if it hasn't already been committed (e.g. via
   * Enter or selecting an option). Opt-in and scoped per-usage so other
   * `freeSolo` consumers of this selector keep their existing behavior.
   */
  commitOnBlur?: boolean;
};
