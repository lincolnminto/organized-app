import { Box } from '@mui/material';
import Button from '@components/button';
import TextField from '@components/textfield';
import InfoMessage from '@components/info-message';
import { IconError } from '@icons/index';
import IconLoading from '@components/icon_loading';
import PageHeader from '@features/app_start/shared/page_header';
import useAppTranslation from '@hooks/useAppTranslation';
import useEmailLinkAuth from './useEmailLinkAuth';

const EmailLinkAuthentication = () => {
  const { t } = useAppTranslation();

  const {
    completeEmailAuth,
    completeInviteAcceptance,
    invite,
    firstname,
    setFirstname,
    lastname,
    setLastname,
    password,
    setPassword,
    isProcessing,
    handleReturn,
    hideMessage,
    message,
    title,
    variant,
  } = useEmailLinkAuth();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <PageHeader
        title={invite ? t('tr_inviteAcceptTitle') : t('tr_emailAuth')}
        description={invite ? t('tr_inviteAcceptDesc', { email: invite.email }) : t('tr_emailAuthDescComplete')}
        onClick={handleReturn}
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {invite ? (
            <>
              <TextField label={t('tr_email')} value={invite.email} disabled />
              <TextField label={t('tr_firstname')} value={firstname} onChange={(event) => setFirstname(event.target.value)} required />
              <TextField label={t('tr_lastname')} value={lastname} onChange={(event) => setLastname(event.target.value)} required />
              <TextField label={t('tr_password')} type="password" value={password} onChange={(event) => setPassword(event.target.value)} required helperText={t('tr_invitePasswordHint')} />
              <Button variant="main" onClick={completeInviteAcceptance} disabled={isProcessing || password.length < 8} sx={{ padding: '8px 32px', minHeight: '44px' }} startIcon={isProcessing ? <IconLoading width={22} height={22} color="var(--always-white)" /> : null}>
                {t('tr_inviteCreateAccount')}
              </Button>
            </>
          ) : (
            <Button
              variant="main"
              onClick={completeEmailAuth}
              sx={{ padding: '8px 32px', minHeight: '44px' }}
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
              {t('tr_login')}
            </Button>
          )}
        </Box>

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
    </Box>
  );
};

export default EmailLinkAuthentication;
