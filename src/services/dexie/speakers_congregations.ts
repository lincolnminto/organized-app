import { UpdateSpec } from 'dexie';
import { SpeakersCongregationsType } from '@definition/speakers_congregations';
import appDb from '@db/appDb';

const dbUpdateSpeakersCongregationsMetadata = async () => {
  const metadata = await appDb.metadata.get(1);

  if (!metadata) return;

  metadata.metadata.speakers_congregations = {
    ...metadata.metadata.speakers_congregations,
    send_local: true,
  };

  await appDb.metadata.put(metadata);
};

export const dbSpeakersCongregationsCreateLocal = async () => {
  const settings = await appDb.app_settings.get(1);
  const congName = settings.cong_settings.cong_name;

  await appDb.speakers_congregations.add({
    _deleted: { value: false, updatedAt: '' },
    id: crypto.randomUUID(),
    cong_data: {
      cong_name: { value: congName, updatedAt: new Date().toISOString() },
      cong_number: { value: '', updatedAt: '' },
      cong_id: '',
      cong_circuit: { value: '', updatedAt: '' },
      cong_location: {
        address: { value: '', updatedAt: '' },
        lat: null,
        lng: null,
      },
      midweek_meeting: {
        time: { value: '', updatedAt: '' },
        weekday: { value: null, updatedAt: '' },
      },
      weekend_meeting: {
        time: { value: '', updatedAt: '' },
        weekday: { value: null, updatedAt: '' },
      },
      coordinator: {
        email: { value: '', updatedAt: '' },
        name: { value: '', updatedAt: '' },
        phone: { value: '', updatedAt: '' },
      },
      public_talk_coordinator: {
        email: { value: '', updatedAt: '' },
        name: { value: '', updatedAt: '' },
        phone: { value: '', updatedAt: '' },
      },
      request_id: '',
      request_status: 'approved',
    },
  });

  await dbUpdateSpeakersCongregationsMetadata();
};

export const dbSpeakersCongregationsCreate = async (
  data: SpeakersCongregationsType
) => {
  await appDb.speakers_congregations.add(data);
  await dbUpdateSpeakersCongregationsMetadata();
};

export const dbSpeakersCongregationsUpdate = async (
  changes: UpdateSpec<SpeakersCongregationsType>,
  id: string
) => {
  await appDb.speakers_congregations.update(id, changes);
  await dbUpdateSpeakersCongregationsMetadata();
};

export const dbSpeakersCongregationsClear = async () => {
  const records = await appDb.speakers_congregations.toArray();

  if (records.length === 0) return;

  for (const record of records) {
    record._deleted = { value: true, updatedAt: new Date().toISOString() };
  }

  await appDb.speakers_congregations.bulkPut(records);
};

export const dbSpeakersCongregationsSetName = async () => {
  const records = await appDb.speakers_congregations.toArray();
  const settings = await appDb.app_settings.get(1);
  const congName = settings.cong_settings.cong_name;

  if (records.length === 0) return;

  const recordsToUpdate: SpeakersCongregationsType[] = [];

  for (const record of records) {
    if (record.cong_data.cong_name.value.trim().length > 0) continue;

    const obj = structuredClone(record);
    obj.cong_data.cong_name = {
      value: congName,
      updatedAt: new Date().toISOString(),
    };

    recordsToUpdate.push(obj);
  }

  if (recordsToUpdate.length === 0) return;

  await appDb.speakers_congregations.bulkPut(recordsToUpdate);
};
