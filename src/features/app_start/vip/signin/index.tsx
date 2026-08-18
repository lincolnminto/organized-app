import { Box, Stack } from '@mui/material';
import { useAppTranslation } from '@hooks/index';
import EmailPassword from '../oauth/email';
import PageHeader from '@features/app_start/shared/page_header';

const Signin = () => {
  const { t } = useAppTranslation();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <PageHeader
        title={t('tr_login')}
        description={t('tr_inviteOnlyAccessDesc')}
      />

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '24px',
        }}
      >
        <Stack spacing="48px">
          <EmailPassword />
        </Stack>
      </Box>
    </Box>
  );
};

export default Signin;
