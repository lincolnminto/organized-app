import { Stack } from '@mui/material';
import { useAppTranslation } from '@hooks/index';
import useOAuthEmail from './useEmail';
import Button from '@components/button';
import IconLoading from '@components/icon_loading';
import TextField from '@components/textfield';

const OAuthEmail = () => {
  const { t } = useAppTranslation();

  const { userTmpEmail, setUserTmpEmail, password, setPassword, handleSignin, isProcessing } =
    useOAuthEmail();

  return (
    <Stack spacing="16px">
      <TextField
        label={t('tr_email')}
        value={userTmpEmail}
        onKeyDown={(e) => (e.key === 'Enter' ? handleSignin() : null)}
        onChange={(e) => setUserTmpEmail(e.target.value)}
        sx={{ width: '100%', color: 'var(--black)' }}
        className="h4"
      />

      <TextField
        label={t('tr_password')}
        type="password"
        value={password}
        onKeyDown={(e) => (e.key === 'Enter' ? handleSignin() : null)}
        onChange={(e) => setPassword(e.target.value)}
        sx={{ width: '100%', color: 'var(--black)' }}
        className="h4"
      />

      <Button
        variant="main"
        disabled={userTmpEmail.length === 0 || password.length === 0 || isProcessing}
        onClick={handleSignin}
        sx={{ padding: '8px 32px', minHeight: '44px' }}
        startIcon={isProcessing ? <IconLoading width={22} height={22} /> : null}
      >
        {t('tr_login')}
      </Button>
    </Stack>
  );
};

export default OAuthEmail;
