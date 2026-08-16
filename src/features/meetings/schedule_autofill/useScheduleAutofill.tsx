import { useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import { displaySnackNotification } from '@services/states/app';
import { getMessageByCode } from '@services/i18n/translation';
import { ScheduleAutofillType } from './index.types';
import { schedulesStartAutofill } from '@services/app/autofill';
import {
  midweekMeetingPairingMinAgeState,
  settingsState,
  userDataViewState,
} from '@states/settings';
import { dbAppSettingsUpdate } from '@services/dexie/settings';

const DEFAULT_MIN_AGE = 18;

const useScheduleAutofill = (
  meeting: ScheduleAutofillType['meeting'],
  onClose: ScheduleAutofillType['onClose']
) => {
  const settings = useAtomValue(settingsState);
  const dataView = useAtomValue(userDataViewState);
  const pairingMinAge = useAtomValue(midweekMeetingPairingMinAgeState);

  const [startWeek, setStartWeek] = useState('');
  const [endWeek, setEndWeek] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [minAge, setMinAge] = useState<number>(pairingMinAge);

  const handleSetStartWeek = (value: string) => setStartWeek(value);

  const handleSetEndWeek = (value: string) => setEndWeek(value);

  const handleSetMinAge = (value: number) => setMinAge(value);

  const persistMinAge = async () => {
    const safeMinAge =
      Number.isFinite(minAge) && minAge > 0 ? minAge : DEFAULT_MIN_AGE;

    const midweekSettings = structuredClone(
      settings.cong_settings.midweek_meeting
    );

    const current = midweekSettings.find((record) => record.type === dataView);

    if (!current) return;

    current.pairing_minimum_age = {
      value: safeMinAge,
      updatedAt: new Date().toISOString(),
    };

    await dbAppSettingsUpdate({
      'cong_settings.midweek_meeting': midweekSettings,
    });
  };

  const handleStartAutoFill = async () => {
    if (startWeek.length === 0 || endWeek.length === 0) return;

    try {
      setIsProcessing(true);

      // The pairing minimum age rule is midweek-specific; persist the edited
      // value before running so the algorithm reads the just-saved value.
      if (meeting === 'midweek') {
        await persistMinAge();
      }

      await schedulesStartAutofill(startWeek, endWeek, meeting);

      setIsProcessing(false);
      onClose?.();
    } catch (error) {
      console.error(error);

      setIsProcessing(false);
      onClose?.();

      displaySnackNotification({
        header: getMessageByCode('error_app_generic-title'),
        message: getMessageByCode(error.message),
        severity: 'error',
      });
    }
  };

  useEffect(() => {
    setMinAge(pairingMinAge);
  }, [pairingMinAge]);

  return {
    handleSetStartWeek,
    handleSetEndWeek,
    isProcessing,
    handleStartAutoFill,
    minAge,
    handleSetMinAge,
  };
};

export default useScheduleAutofill;
