import { apiDefault } from './common';

export type InviteInfo = {
  email: string;
  congregation_id: string;
  role: string[];
  expires_at: string;
};

export const apiGetInviteInfo = async (token: string): Promise<InviteInfo> => {
  const { apiHost, appVersion: appversion } = await apiDefault();
  const res = await fetch(`${apiHost}api/v3/invites/info?token=${encodeURIComponent(token)}`, {
    headers: {
      'Content-Type': 'application/json',
      appclient: 'organized',
      appversion,
    },
  });
  const data = await res.json();

  if (res.status !== 200) throw new Error(data.message);
  return data as InviteInfo;
};

export const apiAcceptInvite = async ({
  token,
  firstname,
  lastname,
}: {
  token: string;
  firstname: string;
  lastname: string;
}) => {
  const { apiHost, appVersion: appversion, idToken } = await apiDefault();
  const res = await fetch(`${apiHost}api/v3/invites/accept`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
      appclient: 'organized',
      appversion,
    },
    body: JSON.stringify({ token, firstname, lastname }),
  });
  const data = await res.json();

  if (res.status !== 200) throw new Error(data.message);
  return data as { user_id: string; congregation_id: string };
};
