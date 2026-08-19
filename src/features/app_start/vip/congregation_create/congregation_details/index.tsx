import { Box } from '@mui/material';
import { IconAccount, IconCongregation, IconError, IconFindCountry } from '@icons/index';
import IconLoading from '@components/icon_loading';
import { useAppTranslation } from '@hooks/index';
import useCongregationDetails from './useCongregationDetails';
import Button from '@components/button';
import Checkbox from '@components/checkbox';
import InfoMessage from '@components/info-message';
import TextField from '@components/textfield';
import VipInfoTip from '@features/app_start/vip/vip_info_tip';

const CongregationDetails = () => {
  const { t } = useAppTranslation();

  const {
    handleCongregationAction,
    isProcessing,
    title,
    message,
    hideMessage,
    variant,
    setUserTmpFirstName,
    setUserTmpLastName,
    userTmpFirstName,
    userTmpLastName,
    handleToggleApproval,
    isElderApproved,
    congregation,
    handleCongNameChange,
    handleCongNameBlur,
  } = useCongregationDetails();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        gap: '24px',
        flexGrow: 1,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: '100%',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            alignItems: 'flex-start',
            alignSelf: 'stretch',
            width: '100%',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              gap: '16px',
              alignItems: 'center',
              width: '100%',
              flexWrap: 'wrap',
            }}
          >
            <TextField
              label={t('tr_firstname')}
              variant="outlined"
              autoComplete="off"
              required={true}
              value={userTmpFirstName}
              onChange={(e) => setUserTmpFirstName(e.target.value)}
              sx={{ flex: '1 0 200px' }}
              startIcon={<IconAccount />}
            />
            <TextField
              label={t('tr_lastname')}
              variant="outlined"
              autoComplete="off"
              value={userTmpLastName}
              onChange={(e) => setUserTmpLastName(e.target.value)}
              sx={{ flex: '1 0 200px' }}
            />
          </Box>

          <TextField
            label={t('tr_country')}
            value={new Intl.DisplayNames([navigator.language], {
              type: 'region',
            }).of('BR')}
            variant="outlined"
            inputProps={{ readOnly: true }}
            startIcon={<IconFindCountry />}
          />

          <TextField
            label={t('tr_congregationName')}
            value={congregation?.congName || ''}
            variant="outlined"
            autoComplete="off"
            onChange={(event) => handleCongNameChange(event.target.value)}
            onBlur={(event) => handleCongNameBlur(event.target.value)}
            startIcon={<IconCongregation />}
          />

          <Checkbox
            label={t('tr_registeringApproved')}
            disabled={congregation === null}
            checked={isElderApproved}
            onChange={(e) => handleToggleApproval(e.target.checked)}
          />

          <Button
            variant="main"
            disabled={
              isProcessing ||
              userTmpFirstName.trim().length === 0 ||
              congregation === null ||
              !isElderApproved
            }
            onClick={handleCongregationAction}
            sx={{ width: '100%' }}
            startIcon={
              isProcessing ? (
                <IconLoading
                  width={22}
                  height={22}
                  color="var(--always-white)"
                />
              ) : null
            }
          >
            {t('tr_createCongregation')}
          </Button>
        </Box>
      </Box>

      <VipInfoTip variant="congregationSearch" />

      <Box id="onboarding-error" sx={{ display: 'none' }}>
        <InfoMessage
          variant={variant}
          messageIcon={<IconError />}
          messageHeader={title}
          message={message}
          onClose={hideMessage}
        />
      </Box>
    </Box>
  );
};

export default CongregationDetails;
