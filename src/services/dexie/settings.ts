import { UpdateSpec } from 'dexie';
import {
  PublishersSortOption,
  SettingsType,
} from '@definition/settings';
import appDb from '@db/appDb';

export const dbAppSettingsGet = async () => {
  const current = await appDb.app_settings.get(1);
  return current;
};

export const dbAppSettingsUpdateWithoutNotice = async (
  changes: UpdateSpec<SettingsType>
) => {
  await appDb.app_settings.update(1, changes);
};

export const dbAppSettingsUpdate = async (
  changes: UpdateSpec<SettingsType>
) => {
  await appDb.app_settings.update(1, changes);

  const metadata = await appDb.metadata.get(1);

  if (!metadata) return;

  const keys = Object.keys(changes);

  let updateMetadata = false;

  if (keys.find((key) => key.includes('cong_settings'))) {
    metadata.metadata.cong_settings = {
      ...metadata.metadata.cong_settings,
      send_local: true,
    };

    updateMetadata = true;
  }

  if (keys.find((key) => key.includes('user_settings'))) {
    metadata.metadata.user_settings = {
      ...metadata.metadata.user_settings,
      send_local: true,
    };

    updateMetadata = true;
  }

  if (updateMetadata) {
    await appDb.metadata.put(metadata);
  }
};

export const dbAppSettingsSaveProfilePic = async (
  url: string,
  provider: string
) => {
  if (url && url !== '' && url !== null) {
    if (provider !== 'microsoft.com' && provider !== 'yahoo.com') {
      const downloadedImg = new Image();
      downloadedImg.crossOrigin = 'Anonymous';

      const imageReceived = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        canvas.width = downloadedImg.width;
        canvas.height = downloadedImg.height;
        canvas.innerText = downloadedImg.alt;

        context.drawImage(downloadedImg, 0, 0);

        canvas.toBlob((done) => savePic(done));

        // Remove the event listener to avoid memory leak
        downloadedImg.removeEventListener('load', imageReceived, false);
      };

      downloadedImg.src = url;
      downloadedImg.addEventListener('load', imageReceived, false);

      const savePic = (profileBlob) => {
        profileBlob.arrayBuffer().then((profileBuffer) => {
          dbAppSettingsUpdate({ 'user_settings.user_avatar': profileBuffer });
        });
      };

      return;
    }
  }

  await dbAppSettingsUpdate({ 'user_settings.user_avatar': undefined });
};

export const dbConvertAutoAssignPrayers = async () => {
  const settings = await appDb.app_settings.get(1);

  const midweekSettings = structuredClone(
    settings.cong_settings.midweek_meeting
  );

  let save = false;

  for (const section of midweekSettings) {
    if (
      section['opening_prayer_auto_assigned'] === undefined &&
      section['closing_prayer_auto_assigned'] === undefined
    ) {
      continue;
    }

    if (section['opening_prayer_auto_assigned'].value) {
      section.opening_prayer_linked_assignment = {
        value: 'MM_Chairman_A',
        updatedAt: new Date().toISOString(),
      };
    }

    if (section['closing_prayer_auto_assigned'].value) {
      section.closing_prayer_linked_assignment = {
        value: 'MM_Chairman_A',
        updatedAt: new Date().toISOString(),
      };
    }

    delete section['opening_prayer_auto_assigned'];
    delete section['closing_prayer_auto_assigned'];

    save = true;
  }

  if (!save) return;

  await dbAppSettingsUpdate({
    'cong_settings.midweek_meeting': midweekSettings,
  });
};

export const dbAppSettingsCreatePublishersSort = async () => {
  const settings = await appDb.app_settings.get(1);

  if (settings.cong_settings.group_publishers_sort) return;

  const newSettings = structuredClone(settings);

  newSettings.cong_settings.group_publishers_sort = {
    value: PublishersSortOption.MANUAL,
    updatedAt: '',
  };

  await appDb.app_settings.put(newSettings);
};

export const dbAppSettingsUpdateCongNumber = async () => {
  const settings = await appDb.app_settings.get(1);

  const congNumber = settings.cong_settings.cong_number;

  if (typeof congNumber === 'object') return;

  const cong_number = {
    value: congNumber,
    updatedAt: new Date().toISOString(),
  };

  await dbAppSettingsUpdate({
    'cong_settings.cong_number': cong_number,
  });
};
