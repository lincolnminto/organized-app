import { Box } from '@mui/material';
import IconLoading from '@components/icon_loading';
import { useAppTranslation } from '@hooks/index';
import { ScheduleAutofillType } from './index.types';
import useScheduleAutofill from './useScheduleAutofill';
import Button from '@components/button';
import Dialog from '@components/dialog';
import Typography from '@components/typography';
import TextField from '@components/textfield';
import Tooltip from '@components/tooltip';
import { IconInfo } from '@components/icons';
import WeekRangeSelector from '../week_range_selector';

const ScheduleAutofillDialog = ({
  open,
  onClose,
  meeting,
}: ScheduleAutofillType) => {
  const { t } = useAppTranslation();

  const {
    handleSetEndWeek,
    handleSetStartWeek,
    handleStartAutoFill,
    isProcessing,
    minAge,
    handleSetMinAge,
  } = useScheduleAutofill(meeting, onClose);

  return (
    <Dialog onClose={onClose} open={open} sx={{ padding: '24px' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Typography className="h2">
          {meeting === 'midweek' ? t('tr_autofillMM') : t('tr_autofillWM')}
        </Typography>
        <Typography color="var(--grey-400)">{t('tr_autofillDesc')}</Typography>
      </Box>

      <WeekRangeSelector
        meeting={meeting}
        onStartChange={handleSetStartWeek}
        onEndChange={handleSetEndWeek}
      />

      {meeting === 'midweek' && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            width: '100%',
          }}
        >
          <TextField
            type="number"
            label={t('tr_autofillMinAgeLabel')}
            value={minAge}
            onChange={(e) => handleSetMinAge(Number(e.target.value))}
            sx={{ flex: 1 }}
          />
          <Tooltip
            title={t('tr_autofillMinAgeTooltip')}
            placement="bottom-start"
            variant="icon"
            icon={{
              defaultColor: 'var(--grey-400)',
              hoverColor: 'var(--accent-main)',
            }}
          >
            <IconInfo width={20} height={20} />
          </Tooltip>
        </Box>
      )}

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          width: '100%',
        }}
      >
        <Button
          variant="main"
          disabled={isProcessing}
          endIcon={isProcessing && <IconLoading />}
          onClick={handleStartAutoFill}
        >
          {t('tr_autofill')}
        </Button>
        <Button variant="secondary" onClick={onClose}>
          {t('tr_cancel')}
        </Button>
      </Box>
    </Dialog>
  );
};

export default ScheduleAutofillDialog;
