import { UpdateSpec } from 'dexie';
import { dbSpeakersCongregationsCreateLocal } from './speakers_congregations';
import { vistingSpeakerSchema } from './schema';
import {
  VisitingSpeakerBackupType,
  VisitingSpeakerType,
} from '@definition/visiting_speakers';
import { decryptData } from '@services/encryption';
import appDb from '@db/appDb';

const dbUpdateVisitingSpeakersMetadata = async () => {
  const metadata = await appDb.metadata.get(1);

  if (!metadata) return;

  metadata.metadata.visiting_speakers = {
    ...metadata.metadata.visiting_speakers,
    send_local: true,
  };

  await appDb.metadata.put(metadata);
};

export const dbVisitingSpeakersLocalCongSpeakerAdd = async (local: boolean) => {
  try {
    const settings = await appDb.app_settings.get(1);
    const congName = settings.cong_settings.cong_name;
    const congregations = await appDb.speakers_congregations.toArray();

    const congExist = congregations.find(
      (record) => record.cong_data.cong_name.value === congName
    );

    if (!congExist) {
      await dbSpeakersCongregationsCreateLocal();
    }

    const congregationsNew = await appDb.speakers_congregations.toArray();

    const congLocal = congregationsNew.find(
      (record) => record.cong_data.cong_name.value === congName
    );

    const newSpeaker = structuredClone(vistingSpeakerSchema);
    newSpeaker.person_uid = crypto.randomUUID();
    newSpeaker.speaker_data.cong_id = congLocal.id;
    newSpeaker.speaker_data.local = {
      value: local,
      updatedAt: new Date().toISOString(),
    };

    await appDb.visiting_speakers.put(newSpeaker);
    await dbUpdateVisitingSpeakersMetadata();
  } catch (err) {
    console.error(err);
    throw new Error(err);
  }
};

export const dbVisitingSpeakersDelete = async (person_uid: string) => {
  try {
    const speaker = await appDb.visiting_speakers.get(person_uid);
    speaker._deleted = { value: true, updatedAt: new Date().toISOString() };
    await appDb.visiting_speakers.put(speaker);
    await dbUpdateVisitingSpeakersMetadata();
  } catch (err) {
    console.error(err);
    throw new Error(err);
  }
};

export const dbVisitingSpeakersUpdate = async (
  changes: UpdateSpec<VisitingSpeakerType>,
  person_uid: string
) => {
  try {
    // check if deleted speaker
    const speaker = changes.person_uid
      ? await appDb.visiting_speakers.get(changes.person_uid)
      : undefined;

    if (speaker) {
      // restore deleted
      speaker._deleted = { value: false, updatedAt: new Date().toISOString() };
      speaker.speaker_data.talks = [];

      // delete temp record
      const temp = await appDb.visiting_speakers.get(person_uid);
      temp._deleted = { value: true, updatedAt: new Date().toISOString() };

      await appDb.visiting_speakers.bulkPut([temp, speaker]);

      await appDb.visiting_speakers.update(speaker.person_uid, changes);
    }

    if (!speaker) {
      await appDb.visiting_speakers.update(person_uid, changes);
    }

    await dbUpdateVisitingSpeakersMetadata();
  } catch (err) {
    console.error(err);
    throw new Error(err);
  }
};

export const dbVisitingSpeakersAdd = async (cong_id: string) => {
  try {
    const newSpeaker = structuredClone(vistingSpeakerSchema);
    newSpeaker.person_uid = crypto.randomUUID();
    newSpeaker.speaker_data.cong_id = cong_id;

    await appDb.visiting_speakers.put(newSpeaker);
    await dbUpdateVisitingSpeakersMetadata();
  } catch (err) {
    console.error(err);
    throw new Error(err);
  }
};

export const decryptVisitingSpeakers = (
  visiting_speakers: VisitingSpeakerBackupType[],
  masterKey
) => {
  const result = visiting_speakers.map((speaker) => {
    const obj = {} as VisitingSpeakerType;

    obj.person_uid = JSON.parse(
      decryptData(speaker.person_uid, masterKey, 'speaker_person_uid')
    );

    obj._deleted = JSON.parse(
      decryptData(speaker._deleted, masterKey, 'speaker_deleted')
    );

    obj.speaker_data = JSON.parse(
      decryptData(speaker.speaker_data, masterKey, 'speaker_data')
    ) as VisitingSpeakerType['speaker_data'];

    return obj;
  });

  return result;
};

export const dbVisitingSpeakersUpdateRemote = async (
  newSpeakers: VisitingSpeakerType[],
  cong_id: string
) => {
  const speakers = await appDb.visiting_speakers.toArray();

  const oldSpeakers = speakers.filter(
    (record) => record.speaker_data.cong_id === cong_id
  );

  for await (const speaker of newSpeakers) {
    const speakerAdd = structuredClone(speaker);
    speakerAdd.speaker_data.cong_id = cong_id;

    await appDb.visiting_speakers.put(speakerAdd);
    await dbUpdateVisitingSpeakersMetadata();
  }

  for await (const speaker of oldSpeakers) {
    const findSpeaker = newSpeakers.find(
      (record) => record.person_uid === speaker.person_uid
    );

    if (!findSpeaker) {
      await appDb.visiting_speakers.delete(speaker.person_uid);
      await dbUpdateVisitingSpeakersMetadata();
    }
  }
};

export const dbVisitingSpeakersClearRemote = async (cong_id: string) => {
  const speakers = await appDb.visiting_speakers.toArray();

  const oldSpeakers = speakers.filter(
    (record) => record.speaker_data.cong_id === cong_id
  );

  for await (const speaker of oldSpeakers) {
    await appDb.visiting_speakers.delete(speaker.person_uid);
    await dbUpdateVisitingSpeakersMetadata();
  }
};

export const dbVisitingSpeakersClear = async () => {
  const records = await appDb.visiting_speakers.toArray();

  if (records.length === 0) return;

  for (const record of records) {
    record._deleted = { value: true, updatedAt: new Date().toISOString() };
  }

  await appDb.visiting_speakers.bulkPut(records);
};
